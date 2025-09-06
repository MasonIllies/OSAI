"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * OSAI Workout Module (no external deps)
 * - Routine editor (inline form to add exercises; no prompts)
 * - Start session from routine
 * - Check off sets; inline edit of actual reps/weight (no prompts)
 * - Finish session applies progression to routine
 * - Data persists in localStorage ("osai_workout_v1")
 */

/* ----------------------------- Types ----------------------------- */
type ID = string;
type ProgressionMode = "weight" | "reps";

type RoutineExercise = {
  id: ID;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  progression: { mode: ProgressionMode; step: number; capReps?: number };
};

type Routine = { name: string; exercises: RoutineExercise[] };

type SessionSet = {
  targetReps: number;
  targetWeight: number;
  done?: boolean;
  actualReps?: number;
  actualWeight?: number;
};

type SessionExercise = { id: ID; name: string; sets: SessionSet[] };

type Session = { id: ID; dateISO: string; exercises: SessionExercise[] };

type Store = { routine?: Routine; history: Session[] };

/* -------------------------- Utilities ---------------------------- */
const LS_KEY = "osai_workout_v1";

function uid(): ID {
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
function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/* ------------------------ Starter Routine ------------------------ */
function starterRoutine(): Routine {
  return {
    name: "Starter 3×5",
    exercises: [
      { id: uid(), name: "Back Squat",   sets: 3, reps: 5, weight: 95,  progression: { mode: "weight", step: 5 } },
      { id: uid(), name: "Bench Press",  sets: 3, reps: 5, weight: 75,  progression: { mode: "weight", step: 5 } },
      { id: uid(), name: "Barbell Row",  sets: 3, reps: 5, weight: 65,  progression: { mode: "weight", step: 5 } },
      { id: uid(), name: "Overhead Press", sets: 3, reps: 5, weight: 55, progression: { mode: "weight", step: 2.5 } },
      { id: uid(), name: "Deadlift",     sets: 1, reps: 5, weight: 135, progression: { mode: "weight", step: 10 } },
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

function allSetsCompleted(se: SessionExercise): boolean {
  return se.sets.every((s) => s.done);
}

/* Progression: only when all sets of an exercise are marked done */
function applyProgression(routine: Routine, completed: Session) {
  const next = clone(routine);
  for (const rx of next.exercises) {
    const se = completed.exercises.find((e) => e.id === rx.id);
    if (!se) continue;
    if (!allSetsCompleted(se)) continue;

    if (rx.progression.mode === "weight") {
      rx.weight = round1(rx.weight + rx.progression.step);
    } else {
      const cap = rx.progression.capReps ?? rx.reps + rx.progression.step;
      rx.reps = Math.min(cap, rx.reps + rx.progression.step);
    }
  }
  return next;
}

/* ----------------------- Form Helpers ---------------------------- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-white/80">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30 ${props.className || ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30 ${props.className || ""}`}
    />
  );
}

/* ----------------------- React Page ------------------------------ */
export default function WorkoutModule() {
  const [store, setStore] = useState<Store>({ history: [] });
  const [active, setActive] = useState<Session | null>(null);

  // UI state for inline forms
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSets, setAddSets] = useState<number>(3);
  const [addReps, setAddReps] = useState<number>(5);
  const [addWeight, setAddWeight] = useState<number>(45);
  const [addMode, setAddMode] = useState<ProgressionMode>("weight");
  const [addStep, setAddStep] = useState<number>(5);
  const [addCapReps, setAddCapReps] = useState<number | "">("");

  // Per-set inline editing state: key "exId#setIdx" -> { reps, weight }
  const [editing, setEditing] = useState<Record<string, { reps: number; weight: number }>>({});

  /* Load & autosave */
  useEffect(() => {
    setStore(loadStore());
  }, []);
  useEffect(() => {
    saveStore(store);
  }, [store]);

  const hasRoutine = !!store.routine;

  /* Routine actions */
  function resetToStarter() {
    setStore({ history: store.history, routine: starterRoutine() });
    setShowAdd(false);
  }
  function clearRoutine() {
    setStore({ history: store.history, routine: undefined });
    setShowAdd(false);
  }
  function addExercise() {
    if (!store.routine) return;
    if (!addName.trim()) return alert("Name required.");
    const rx: RoutineExercise = {
      id: uid(),
      name: addName.trim(),
      sets: Math.max(1, Number(addSets) || 1),
      reps: Math.max(1, Number(addReps) || 1),
      weight: Math.max(0, Number(addWeight) || 0),
      progression: {
        mode: addMode,
        step: Math.max(0.5, Number(addStep) || 1),
        capReps: addMode === "reps" ? (addCapReps === "" ? undefined : Math.max(1, Number(addCapReps))) : undefined,
      },
    };
    setStore({
      ...store,
      routine: { ...store.routine, exercises: [...store.routine.exercises, rx] },
    });
    // reset form
    setAddName("");
    setAddSets(3);
    setAddReps(5);
    setAddWeight(45);
    setAddMode("weight");
    setAddStep(5);
    setAddCapReps("");
    setShowAdd(false);
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

  /* Session interactions */
  function toggleSet(exId: ID, setIdx: number) {
    if (!active) return;
    const next = clone(active);
    const ex = next.exercises.find((e) => e.id === exId);
    if (!ex) return;
    const s = ex.sets[setIdx];
    s.done = !s.done;
    if (s.done) {
      s.actualReps = s.actualReps ?? s.targetReps;
      s.actualWeight = s.actualWeight ?? s.targetWeight;
    }
    setActive(next);
  }

  function beginEdit(exId: ID, setIdx: number) {
    if (!active) return;
    const ex = active.exercises.find((e) => e.id === exId);
    if (!ex) return;
    const s = ex.sets[setIdx];
    const key = `${exId}#${setIdx}`;
    setEditing({
      ...editing,
      [key]: {
        reps: s.actualReps ?? s.targetReps,
        weight: s.actualWeight ?? s.targetWeight,
      },
    });
  }

  function cancelEdit(exId: ID, setIdx: number) {
    const key = `${exId}#${setIdx}`;
    const next = { ...editing };
    delete next[key];
    setEditing(next);
  }

  function saveEdit(exId: ID, setIdx: number) {
    if (!active) return;
    const key = `${exId}#${setIdx}`;
    const draft = editing[key];
    if (!draft) return;
    const next = clone(active);
    const ex = next.exercises.find((e) => e.id === exId);
    if (!ex) return;
    const s = ex.sets[setIdx];
    s.actualReps = Math.max(0, Number(draft.reps) || 0);
    s.actualWeight = Math.max(0, Number(draft.weight) || 0);
    s.done = true;
    setActive(next);
    cancelEdit(exId, setIdx);
  }

  const allDone = useMemo(() => {
    if (!active) return false;
    return active.exercises.every(allSetsCompleted);
  }, [active]);

  function finishSession() {
    if (!active || !store.routine) return;
    const newHistory = [clone(active), ...store.history].slice(0, 50);
    const progressed = applyProgression(store.routine, active);
    setStore({ routine: progressed, history: newHistory });
    setActive(null);
    alert("Session saved. Routine progressed for next time.");
  }

  /* --------------------------- UI --------------------------- */
  return (
    <section className="space-y-8 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight">Workout</h1>

      {/* Routine */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold">Routine</h2>
            {!hasRoutine && <p className="text-sm text-white/70 mt-1">No routine yet. Create a starter or begin custom.</p>}
          </div>
          <div className="flex gap-2">
            {!hasRoutine ? (
              <>
                <button className="btn" onClick={resetToStarter}>Create Starter 3×5</button>
                <button
                  className="btn-ghost"
                  onClick={() => { setStore({ ...store, routine: { name: "Custom", exercises: [] } }); setShowAdd(true); }}
                >
                  New Custom Routine
                </button>
              </>
            ) : (
              <>
                <button className="btn" onClick={startSession}>Start Session</button>
                <button className="btn-ghost" onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Close form" : "Add Exercise"}</button>
                <button className="btn-ghost" onClick={resetToStarter}>Reset to Starter</button>
                <button className="btn-ghost" onClick={clearRoutine}>Clear Routine</button>
              </>
            )}
          </div>
        </div>

        {/* Add Exercise Form */}
        {hasRoutine && showAdd && (
          <div className="mt-6 card p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Exercise name">
                <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g., Back Squat" />
              </Field>
              <Field label="Sets">
                <Input type="number" inputMode="numeric" value={addSets} onChange={(e) => setAddSets(Number(e.target.value))} />
              </Field>
              <Field label="Reps">
                <Input type="number" inputMode="numeric" value={addReps} onChange={(e) => setAddReps(Number(e.target.value))} />
              </Field>
              <Field label="Weight (lb)">
                <Input type="number" inputMode="decimal" step="0.5" value={addWeight} onChange={(e) => setAddWeight(Number(e.target.value))} />
              </Field>
              <Field label="Progression mode">
                <Select value={addMode} onChange={(e) => setAddMode(e.target.value as ProgressionMode)}>
                  <option value="weight">Add weight</option>
                  <option value="reps">Add reps</option>
                </Select>
              </Field>
              <Field label="Step (lb or reps)">
                <Input type="number" inputMode="decimal" step="0.5" value={addStep} onChange={(e) => setAddStep(Number(e.target.value))} />
              </Field>
              {addMode === "reps" && (
                <Field label="Cap reps at (optional)">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={addCapReps === "" ? "" : addCapReps}
                    onChange={(e) => setAddCapReps(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g., 12"
                  />
                </Field>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn" onClick={addExercise}>Add Exercise</button>
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Routine Table */}
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
                        : `+${rx.progression.step} rep${rx.progression.step !== 1 ? "s" : ""}${
                            rx.progression.capReps ? ` (cap ${rx.progression.capReps})` : ""
                          }`}
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
              <button className="btn" disabled={!allDone} onClick={finishSession}>Finish Session</button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {active.exercises.map((ex) => (
              <div key={ex.id}>
                <h3 className="font-semibold">{ex.name}</h3>
                <div className="mt-2 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ex.sets.map((s, i) => {
                    const key = `${ex.id}#${i}`;
                    const draft = editing[key];
                    const isEditing = !!draft;
                    return (
                      <div key={i} className={`card p-3 ${s.done ? "ring-1 ring-white/40" : ""}`}>
                        <div className="text-xs text-white/60">Set {i + 1}</div>
                        <div className="mt-1 text-sm">Target: {s.targetReps} reps @ {s.targetWeight} lb</div>

                        {s.done && !isEditing && (
                          <div className="mt-1 text-sm text-white/80">
                            Actual: {s.actualReps} reps @ {s.actualWeight} lb
                          </div>
                        )}

                        {isEditing ? (
                          <div className="mt-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Field label="Reps">
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  value={draft.reps}
                                  onChange={(e) =>
                                    setEditing({ ...editing, [key]: { ...draft, reps: Number(e.target.value) } })
                                  }
                                />
                              </Field>
                              <Field label="Weight (lb)">
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.5"
                                  value={draft.weight}
                                  onChange={(e) =>
                                    setEditing({ ...editing, [key]: { ...draft, weight: Number(e.target.value) } })
                                  }
                                />
                              </Field>
                            </div>
                            <div className="flex gap-2">
                              <button className="btn" onClick={() => saveEdit(ex.id, i)}>Save</button>
                              <button className="btn-ghost" onClick={() => cancelEdit(ex.id, i)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 flex gap-2">
                            <button className="btn-ghost" onClick={() => toggleSet(ex.id, i)}>
                              {s.done ? "Undo" : "Complete"}
                            </button>
                            <button className="btn-ghost" onClick={() => beginEdit(ex.id, i)}>Edit actual</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                            Set {i + 1}: {(s.actualReps ?? s.targetReps)} reps @ {(s.actualWeight ?? s.targetWeight)} lb
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
