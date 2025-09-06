"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * OSAI Workout Module (no external deps)
 * - Routine editor (exercises with sets/reps/weight + progression rule)
 * - Start session from routine
 * - Check off sets; record actuals
 * - Finish session applies progression to routine
 * - Data persists in localStorage ("osai_workout_v1")
 */

/* ----------------------------- Types ----------------------------- */
type ID = string;

type ProgressionMode = "weight" | "reps";

type RoutineExercise = {
  id: ID;
  name: string;
  sets: number;         // target number of sets
  reps: number;         // target reps per set
  weight: number;       // target weight per set
  progression: {
    mode: ProgressionMode;  // "weight" => add weight; "reps" => add reps
    step: number;           // how much to add
    capReps?: number;       // only used when mode === "reps"
  };
};

type Routine = {
  name: string;
  exercises: RoutineExercise[];
};

type SessionSet = {
  targetReps: number;
  targetWeight: number;
  done?: boolean;
  actualReps?: number;
  actualWeight?: number;
};

type SessionExercise = {
  id: ID;           // reuse routine exercise id for mapping back
  name: string;
  sets: SessionSet[];
};

type Session = {
  id: ID;
  dateISO: string;
  exercises: SessionExercise[];
};

type Store = {
  routine?: Routine;
  history: Session[];
};

/* -------------------------- Utilities ---------------------------- */
const LS_KEY = "osai_workout_v1";

function uid(): ID {
  // Avoids crypto dependency; good enough for client-only ids
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { history: [] };
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.history) parsed.history = [];
    return parsed;
  } catch {
    return { history: [] };
  }
}

function saveStore(store: Store) {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

/* ------------------------ Starter Routine ------------------------ */
function starterRoutine(): Routine {
  return {
    name: "Starter 3×5",
    exercises: [
      {
        id: uid(),
        name: "Back Squat",
        sets: 3,
        reps: 5,
        weight: 95,
        progression: { mode: "weight", step: 5 },
      },
      {
        id: uid(),
        name: "Bench Press",
        sets: 3,
        reps: 5,
        weight: 75,
        progression: { mode: "weight", step: 5 },
      },
      {
        id: uid(),
        name: "Barbell Row",
        sets: 3,
        reps: 5,
        weight: 65,
        progression: { mode: "weight", step: 5 },
      },
      {
        id: uid(),
        name: "Overhead Press",
        sets: 3,
        reps: 5,
        weight: 55,
        progression: { mode: "weight", step: 2.5 },
      },
      {
        id: uid(),
        name: "Deadlift",
        sets: 1,
        reps: 5,
        weight: 135,
        progression: { mode: "weight", step: 10 },
      },
    ],
  };
}

/* --------------------- Session Construction ---------------------- */
function makeSessionFromRoutine(routine: Routine): Session {
  const exercises: SessionExercise[] = routine.exercises.map((rx) => ({
    id: rx.id,
    name: rx.name,
    sets: Array.from({ length: rx.sets }).map(() => ({
      targetReps: rx.reps,
      targetWeight: rx.weight,
      done: false,
    })),
  }));
  return { id: uid(), dateISO: new Date().toISOString(), exercises };
}

/* --------------------- Progression Application ------------------- */
function allSetsCompleted(se: SessionExercise): boolean {
  return se.sets.every((s) => s.done);
}

function applyProgression(routine: Routine, completed: Session) {
  const next = clone(routine);
  for (const rx of next.exercises) {
    const se = completed.exercises.find((e) => e.id === rx.id);
    if (!se) continue; // should not happen
    if (!allSetsCompleted(se)) continue; // only progress when all sets done

    if (rx.progression.mode === "weight") {
      rx.weight = round1(rx.weight + rx.progression.step);
    } else if (rx.progression.mode === "reps") {
      const cap = rx.progression.capReps ?? rx.reps + rx.progression.step;
      rx.reps = Math.min(cap, rx.reps + rx.progression.step);
    }
  }
  return next;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/* ----------------------- React Page Component -------------------- */
export default function WorkoutModule() {
  const [store, setStore] = useState<Store>({ history: [] });
  const [active, setActive] = useState<Session | null>(null);

  // Load once
  useEffect(() => {
    const s = loadStore();
    setStore(s);
  }, []);

  // Auto-save
  useEffect(() => {
    saveStore(store);
  }, [store]);

  /* --------------- Routine Management --------------- */
  const hasRoutine = !!store.routine;

  function resetToStarter() {
    setStore({ history: store.history, routine: starterRoutine() });
  }

  function addExercise() {
    if (!store.routine) return;
    const name = prompt("Exercise name?");
    if (!name) return;
    const sets = Number(prompt("Sets?", "3")) || 3;
    const reps = Number(prompt("Reps?", "5")) || 5;
    const weight = Number(prompt("Weight (lbs)?", "45")) || 45;
    const mode = (prompt('Progression mode: "weight" or "reps"?', "weight") || "weight") as ProgressionMode;
    const step = Number(prompt("Progression step (lbs or reps)?", mode === "weight" ? "5" : "1")) || (mode === "weight" ? 5 : 1);
    const capReps = mode === "reps" ? Number(prompt("Cap reps at (optional)", "")) || undefined : undefined;

    const rx: RoutineExercise = {
      id: uid(),
      name,
      sets,
      reps,
      weight,
      progression: { mode, step, capReps },
    };
    setStore({ ...store, routine: { ...store.routine, exercises: [...store.routine.exercises, rx] } });
  }

  function removeExercise(id: ID) {
    if (!store.routine) return;
    setStore({
      ...store,
      routine: { ...store.routine, exercises: store.routine.exercises.filter((e) => e.id !== id) },
    });
  }

  function startSession() {
    if (!store.routine) return;
    setActive(makeSessionFromRoutine(store.routine));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ----------------- Session Interactions ----------------- */
  function toggleSet(exId: ID, setIdx: number) {
    if (!active) return;
    const next = clone(active);
    const se = next.exercises.find((e) => e.id === exId);
    if (!se) return;
    const s = se.sets[setIdx];
    s.done = !s.done;
    if (s.done) {
      s.actualReps = s.actualReps ?? s.targetReps;
      s.actualWeight = s.actualWeight ?? s.targetWeight;
    }
    setActive(next);
  }

  function editActual(exId: ID, setIdx: number) {
    if (!active) return;
    const next = clone(active);
    const se = next.exercises.find((e) => e.id === exId);
    if (!se) return;
    const s = se.sets[setIdx];
    const reps = Number(prompt("Actual reps?", String(s.actualReps ?? s.targetReps))) || s.targetReps;
    const weight = Number(prompt("Actual weight (lbs)?", String(s.actualWeight ?? s.targetWeight))) || s.targetWeight;
    s.actualReps = reps;
    s.actualWeight = weight;
    s.done = true;
    setActive(next);
  }

  const allDone = useMemo(() => {
    if (!active) return false;
    return active.exercises.every(allSetsCompleted);
  }, [active]);

  function finishSession() {
    if (!active || !store.routine) return;
    // Save history
    const newHistory = [clone(active), ...store.history].slice(0, 50); // keep last 50
    // Progress routine
    const progressed = applyProgression(store.routine, active);
    setStore({ routine: progressed, history: newHistory });
    setActive(null);
    alert("Session saved. Routine progressed for next time.");
  }

  /* --------------------------- UI --------------------------- */
  return (
    <section className="space-y-8 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight">Workout</h1>

      {/* Routine section */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold">Routine</h2>
            {!hasRoutine && <p className="text-sm text-white/70 mt-1">No routine yet. Create a starter or build your own.</p>}
          </div>
          <div className="flex gap-2">
            {!hasRoutine ? (
              <button className="btn" onClick={resetToStarter}>Create Starter 3×5</button>
            ) : (
              <>
                <button className="btn" onClick={startSession}>Start Session</button>
                <button className="btn-ghost" onClick={addExercise}>Add Exercise</button>
              </>
            )}
          </div>
        </div>

        {hasRoutine && store.routine && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="text-left font-medium pb-2">Exercise</th>
                  <th className="text-left font-medium pb-2">Sets</th>
                  <th className="text-left font-medium pb-2">Reps</th>
                  <th className="text-left font-medium pb-2">Weight</th>
                  <th className="text-left font-medium pb-2">Progression</th>
                  <th className="text-left font-medium pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {store.routine.exercises.map((rx) => (
                  <tr key={rx.id} className="border-t border-white/10">
                    <td className="py-2 pr-3">{rx.name}</td>
                    <td className="py-2 pr-3">{rx.sets}</td>
                    <td className="py-2 pr-3">{rx.reps}</td>
                    <td className="py-2 pr-3">{rx.weight} lb</td>
                    <td className="py-2 pr-3">
                      {rx.progression.mode === "weight"
                        ? `+${rx.progression.step} lb`
                        : `+${rx.progression.step} rep${rx.progression.step !== 1 ? "s" : ""}${rx.progression.capReps ? ` (cap ${rx.progression.capReps})` : ""}`}
                    </td>
                    <td className="py-2">
                      <button className="btn-ghost" onClick={() => removeExercise(rx.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active session */}
      {active && (
        <div className="card p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-semibold">Session — {new Date(active.dateISO).toLocaleString()}</h2>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setActive(null)}>Discard</button>
              <button className="btn" disabled={!allDone} onClick={finishSession}>
                Finish Session
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {active.exercises.map((ex) => (
              <div key={ex.id}>
                <h3 className="font-semibold">{ex.name}</h3>
                <div className="mt-2 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ex.sets.map((s, i) => (
                    <div key={i} className={`card p-3 ${s.done ? "ring-1 ring-white/40" : ""}`}>
                      <div className="text-xs text-white/60">Set {i + 1}</div>
                      <div className="mt-1 text-sm">Target: {s.targetReps} reps @ {s.targetWeight} lb</div>
                      {s.done && (
                        <div className="mt-1 text-sm text-white/80">
                          Actual: {s.actualReps} reps @ {s.actualWeight} lb
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button className="btn-ghost" onClick={() => toggleSet(ex.id, i)}>
                          {s.done ? "Undo" : "Complete"}
                        </button>
                        <button className="btn-ghost" onClick={() => editActual(ex.id, i)}>Edit actual</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {store.history.length > 0 && (
        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-semibold">History</h2>
          <div className="mt-4 space-y-4">
            {store.history.map((sess) => (
              <details key={sess.id} className="bg-white/5 rounded-xl p-4">
                <summary className="cursor-pointer select-none">
                  {new Date(sess.dateISO).toLocaleString()}
                </summary>
                <div className="mt-3">
                  {sess.exercises.map((ex) => (
                    <div key={ex.name} className="mt-2">
                      <div className="font-medium">{ex.name}</div>
                      <ul className="text-sm text-white/80 mt-1 space-y-1">
                        {ex.sets.map((s, i) => (
                          <li key={i}>
                            Set {i + 1}: {s.actualReps ?? s.targetReps} reps @ {s.actualWeight ?? s.targetWeight} lb
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
