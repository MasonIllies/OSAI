"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * OSAI Workout Module — Routines Library + Weekly Scheduling
 * - Create/store multiple routines
 * - Pick a routine to run a session
 * - Schedule selected routine into the in-app weekly calendar
 * - LocalStorage persistence
 */

type ID = string;
type ProgressionMode = "weight" | "reps";

/* -------- Routines / Sessions -------- */
type RoutineExercise = {
  id: ID;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  progression: { mode: ProgressionMode; step: number; capReps?: number };
};
type Routine = { id: ID; name: string; exercises: RoutineExercise[] };

type SessionSet = { targetReps: number; targetWeight: number; done?: boolean; actualReps?: number; actualWeight?: number; };
type SessionExercise = { id: ID; name: string; sets: SessionSet[] };
type Session = { id: ID; routineId: ID; dateISO: string; exercises: SessionExercise[] };

type Store = {
  routines: Routine[];
  activeRoutineId?: ID;
  history: Session[];
};

/* -------- Calendar (shared model) -------- */
type CalType = "work" | "workout" | "company" | "content" | "music" | "personal";
type CalEvent = { id: ID; title: string; type: CalType; startISO: string; endISO: string; notes?: string; };

const LS_KEY = "osai_workout_v2";
const CAL_KEY = "osai_calendar_v1";

/* ---------------- Utilities ---------------- */
function uid(): ID { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function round1(n: number) { return Math.round(n * 10) / 10; }
function clone<T>(x: T): T { return JSON.parse(JSON.stringify(x)); }

function startOfWeek(d = new Date()): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}
function addDays(d: Date, days: number): Date { const x = new Date(d); x.setDate(x.getDate() + days); return x; }
function toISOLocal(date: Date, timeHHMM: string): string {
  const [hh, mm] = timeHHMM.split(":").map((n) => parseInt(n || "0", 10));
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

/* ------------- Load/Save (with migration) ------------- */
function loadStore(): Store {
  try {
    const rawV2 = localStorage.getItem(LS_KEY);
    if (rawV2) return JSON.parse(rawV2) as Store;

    // migrate from old single-routine key if present
    const rawOld = localStorage.getItem("osai_workout_v1");
    if (rawOld) {
      const old = JSON.parse(rawOld) as { routine?: Omit<Routine, "id">; history: Session[] };
      const routines: Routine[] = old.routine ? [{ id: uid(), name: old.routine.name || "Imported", exercises: (old.routine.exercises || []) }] : [];
      const activeRoutineId = routines[0]?.id;
      const migrated: Store = { routines, activeRoutineId, history: old.history || [] };
      localStorage.setItem(LS_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return { routines: [], history: [] };
  } catch {
    return { routines: [], history: [] };
  }
}
function saveStore(store: Store) { localStorage.setItem(LS_KEY, JSON.stringify(store)); }

function loadCalendar(): { events: CalEvent[] } {
  try {
    const raw = localStorage.getItem(CAL_KEY);
    return raw ? (JSON.parse(raw) as { events: CalEvent[] }) : { events: [] };
  } catch { return { events: [] }; }
}
function saveCalendar(cal: { events: CalEvent[] }) {
  localStorage.setItem(CAL_KEY, JSON.stringify(cal));
}

/* ---------------- Starter Templates ---------------- */
function starter3x5(): Routine {
  return {
    id: uid(),
    name: "Starter 3×5",
    exercises: [
      { id: uid(), name: "Back Squat", sets: 3, reps: 5, weight: 95, progression: { mode: "weight", step: 5 } },
      { id: uid(), name: "Bench Press", sets: 3, reps: 5, weight: 75, progression: { mode: "weight", step: 5 } },
      { id: uid(), name: "Barbell Row", sets: 3, reps: 5, weight: 65, progression: { mode: "weight", step: 5 } },
      { id: uid(), name: "Overhead Press", sets: 3, reps: 5, weight: 55, progression: { mode: "weight", step: 2.5 } },
      { id: uid(), name: "Deadlift", sets: 1, reps: 5, weight: 135, progression: { mode: "weight", step: 10 } },
    ],
  };
}
function upperLower(): Routine {
  return {
    id: uid(),
    name: "Upper/Lower",
    exercises: [
      { id: uid(), name: "Incline DB Press", sets: 4, reps: 8, weight: 45, progression: { mode: "reps", step: 1, capReps: 12 } },
      { id: uid(), name: "Lat Pulldown", sets: 4, reps: 10, weight: 110, progression: { mode: "weight", step: 5 } },
      { id: uid(), name: "Seated Row", sets: 3, reps: 12, weight: 90, progression: { mode: "weight", step: 5 } },
      { id: uid(), name: "Leg Press", sets: 4, reps: 10, weight: 180, progression: { mode: "weight", step: 10 } },
    ],
  };
}

/* ---------------- Session Helpers ---------------- */
function makeSessionFromRoutine(routine: Routine): Session {
  const exercises: SessionExercise[] = routine.exercises.map((rx) => ({
    id: rx.id,
    name: rx.name,
    sets: Array.from({ length: rx.sets }).map(() => ({ targetReps: rx.reps, targetWeight: rx.weight, done: false })),
  }));
  return { id: uid(), routineId: routine.id, dateISO: new Date().toISOString(), exercises };
}
function allSetsCompleted(se: SessionExercise) { return se.sets.every((s) => s.done); }
function applyProgression(routine: Routine, completed: Session) {
  const next = clone(routine);
  for (const rx of next.exercises) {
    const se = completed.exercises.find((e) => e.id === rx.id);
    if (!se || !allSetsCompleted(se)) continue;
    if (rx.progression.mode === "weight") rx.weight = round1(rx.weight + rx.progression.step);
    else rx.reps = Math.min(rx.progression.capReps ?? rx.reps + rx.progression.step, rx.reps + rx.progression.step);
  }
  return next;
}

/* ---------------- UI Helpers ---------------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="text-white/80">{label}</span><div className="mt-1">{children}</div></label>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30 ${props.className || ""}`} />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30 ${props.className || ""}`} />;
}

/* ---------------- Component ---------------- */
export default function WorkoutModule() {
  const [store, setStore] = useState<Store>({ routines: [], history: [] });
  const [active, setActive] = useState<Session | null>(null);

  // add-exercise form (for current routine editor)
  const [exName, setExName] = useState(""); const [exSets, setExSets] = useState(3);
  const [exReps, setExReps] = useState(5); const [exWeight, setExWeight] = useState(45);
  const [exMode, setExMode] = useState<ProgressionMode>("weight"); const [exStep, setExStep] = useState(5);
  const [exCap, setExCap] = useState<number | "">("");

  // schedule form
  const [weekRef, setWeekRef] = useState<Date>(startOfWeek(new Date()));
  const [time, setTime] = useState("09:00");
  const [daysSel, setDaysSel] = useState<Record<number, boolean>>({ 1: true, 3: true, 5: false, 0: false, 2: false, 4: false, 6: false }); // Mon, Wed default

  // per-set inline edit
  const [editing, setEditing] = useState<Record<string, { reps: number; weight: number }>>({});

  useEffect(() => setStore(loadStore()), []);
  useEffect(() => saveStore(store), [store]);

  const routines = store.routines;
  const activeRoutine = routines.find((r) => r.id === store.activeRoutineId) || routines[0];

  /* ------- Library actions ------- */
  function addTemplateStarter() {
    const r = starter3x5();
    setStore({ ...store, routines: [...routines, r], activeRoutineId: r.id });
  }
  function addTemplateUpperLower() {
    const r = upperLower();
    setStore({ ...store, routines: [...routines, r], activeRoutineId: r.id });
  }
  function newEmptyRoutine() {
    const r: Routine = { id: uid(), name: "Custom Routine", exercises: [] };
    setStore({ ...store, routines: [...routines, r], activeRoutineId: r.id });
  }
  function renameRoutine(id: ID) {
    const name = prompt("Routine name?", routines.find(r => r.id === id)?.name || "");
    if (!name) return;
    setStore({ ...store, routines: routines.map(r => (r.id === id ? { ...r, name } : r)) });
  }
  function deleteRoutine(id: ID) {
    const next = routines.filter(r => r.id !== id);
    const nextActive = next[0]?.id;
    setStore({ ...store, routines: next, activeRoutineId: nextActive });
  }
  function setActiveRoutine(id: ID) { setStore({ ...store, activeRoutineId: id }); }

  /* ------- Routine editor ------- */
  function addExercise() {
    if (!activeRoutine) return;
    if (!exName.trim()) return alert("Name required.");
    const rx: RoutineExercise = {
      id: uid(),
      name: exName.trim(),
      sets: Math.max(1, Number(exSets) || 1),
      reps: Math.max(1, Number(exReps) || 1),
      weight: Math.max(0, Number(exWeight) || 0),
      progression: { mode: exMode, step: Math.max(0.5, Number(exStep) || 1), capReps: exMode === "reps" ? (exCap === "" ? undefined : Math.max(1, Number(exCap))) : undefined },
    };
    setStore({
      ...store,
      routines: routines.map(r => r.id === activeRoutine.id ? { ...r, exercises: [...r.exercises, rx] } : r),
    });
    setExName(""); setExSets(3); setExReps(5); setExWeight(45); setExMode("weight"); setExStep(5); setExCap("");
  }
  function removeExercise(exId: ID) {
    if (!activeRoutine) return;
    setStore({
      ...store,
      routines: routines.map(r => r.id === activeRoutine.id ? { ...r, exercises: r.exercises.filter(e => e.id !== exId) } : r),
    });
  }

  /* ------- Sessions ------- */
  function startSession() {
    if (!activeRoutine) return;
    setActive(makeSessionFromRoutine(activeRoutine));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toggleSet(exId: ID, setIdx: number) {
    if (!active) return;
    const next = clone(active);
    const ex = next.exercises.find(e => e.id === exId);
    if (!ex) return;
    const s = ex.sets[setIdx];
    s.done = !s.done;
    if (s.done) { s.actualReps = s.actualReps ?? s.targetReps; s.actualWeight = s.actualWeight ?? s.targetWeight; }
    setActive(next);
  }
  function beginEdit(exId: ID, setIdx: number) {
    if (!active) return;
    const ex = active.exercises.find(e => e.id === exId); if (!ex) return;
    const s = ex.sets[setIdx];
    const key = `${exId}#${setIdx}`;
    setEditing({ ...editing, [key]: { reps: s.actualReps ?? s.targetReps, weight: s.actualWeight ?? s.targetWeight } });
  }
  function cancelEdit(exId: ID, setIdx: number) {
    const key = `${exId}#${setIdx}`; const next = { ...editing }; delete next[key]; setEditing(next);
  }
  function saveEdit(exId: ID, setIdx: number) {
    if (!active) return;
    const key = `${exId}#${setIdx}`; const draft = editing[key]; if (!draft) return;
    const next = clone(active);
    const ex = next.exercises.find(e => e.id === exId); if (!ex) return;
    const s = ex.sets[setIdx]; s.actualReps = Math.max(0, Number(draft.reps) || 0); s.actualWeight = Math.max(0, Number(draft.weight) || 0); s.done = true;
    setActive(next); cancelEdit(exId, setIdx);
  }
  const allDone = useMemo(() => active ? active.exercises.every(e => e.sets.every(s => s.done)) : false, [active]);
  function finishSession() {
    if (!active || !activeRoutine) return;
    const progressed = applyProgression(activeRoutine, active);
    setStore({
      ...store,
      routines: routines.map(r => r.id === activeRoutine.id ? progressed : r),
      history: [{ ...clone(active) }, ...store.history].slice(0, 50),
    });
    setActive(null);
    alert("Session saved. Routine progressed for next time.");
  }

  /* ------- Scheduling to Calendar ------- */
  function scheduleToCalendar() {
    if (!activeRoutine) return alert("Pick a routine first.");
    const cal = loadCalendar();
    const start = startOfWeek(weekRef);
    const chosenDays = Object.entries(daysSel).filter(([d, on]) => on && (on as unknown as boolean)).map(([d]) => Number(d));
    if (chosenDays.length === 0) return alert("Select at least one weekday.");

    const newEvents: CalEvent[] = chosenDays.map((dow) => {
      const day = addDays(start, dow);
      const startISO = toISOLocal(day, time);
      const endISO = new Date(new Date(startISO).getTime() + 60 * 60000).toISOString(); // default 60m
      return { id: uid(), title: `Workout: ${activeRoutine.name}`, type: "workout", startISO, endISO };
    });

    saveCalendar({ events: [...cal.events, ...newEvents] });
    alert("Added to this week's Calendar. See /calendar.");
  }

  /* ---------------- UI ---------------- */
  return (
    <section className="space-y-8 max-w-5xl">
      <h1 className="text-4xl font-bold tracking-tight">Workout</h1>
      <p className="text-white/80">Build multiple routines, run sessions, and schedule them into your weekly <a className="underline" href="/calendar">Calendar</a>.</p>

      {/* Library */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">Routines Library</h2>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={addTemplateStarter}>+ Starter 3×5</button>
            <button className="btn-ghost" onClick={addTemplateUpperLower}>+ Upper/Lower</button>
            <button className="btn" onClick={newEmptyRoutine}>+ New Custom</button>
          </div>
        </div>

        {routines.length === 0 ? (
          <p className="text-sm text-white/70 mt-3">No routines yet. Add a template or create your own.</p>
        ) : (
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            {routines.map((r) => {
              const activeCls = r.id === activeRoutine?.id ? "ring-1 ring-white/40" : "";
              return (
                <div key={r.id} className={`card p-4 ${activeCls}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold truncate">{r.name}</div>
                    <span className="pill">{r.exercises.length}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn" onClick={() => setActiveRoutine(r.id)}>Select</button>
                    <button className="btn-ghost" onClick={() => renameRoutine(r.id)}>Rename</button>
                    <button className="btn-ghost" onClick={() => deleteRoutine(r.id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor + Session + Schedule */}
      {activeRoutine && (
        <>
          {/* Editor */}
          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xl font-semibold">Edit: {activeRoutine.name}</h2>
              <div className="flex gap-2">
                <button className="btn" onClick={startSession}>Start Session</button>
              </div>
            </div>

            {/* Add exercise form */}
            <div className="mt-4 grid md:grid-cols-6 gap-3">
              <Field label="Exercise">
                <Input value={exName} onChange={(e) => setExName(e.target.value)} placeholder="e.g., Back Squat" />
              </Field>
              <Field label="Sets">
                <Input type="number" inputMode="numeric" value={exSets} onChange={(e) => setExSets(Number(e.target.value))} />
              </Field>
              <Field label="Reps">
                <Input type="number" inputMode="numeric" value={exReps} onChange={(e) => setExReps(Number(e.target.value))} />
              </Field>
              <Field label="Weight (lb)">
                <Input type="number" inputMode="decimal" step="0.5" value={exWeight} onChange={(e) => setExWeight(Number(e.target.value))} />
              </Field>
              <Field label="Progression">
                <Select value={exMode} onChange={(e) => setExMode(e.target.value as ProgressionMode)}>
                  <option value="weight">Add weight</option>
                  <option value="reps">Add reps</option>
                </Select>
              </Field>
              <Field label="Step / Cap">
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" inputMode="decimal" step="0.5" value={exStep} onChange={(e) => setExStep(Number(e.target.value))} placeholder="step" />
                  <Input type="number" inputMode="numeric" value={exCap === "" ? "" : exCap} onChange={(e) => setExCap(e.target.value === "" ? "" : Number(e.target.value))} placeholder="cap reps (opt)" />
                </div>
              </Field>
            </div>
            <div className="mt-3">
              <button className="btn" onClick={addExercise}>Add Exercise</button>
            </div>

            {/* Routine table */}
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
                  {activeRoutine.exercises.map((rx) => (
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
                  {activeRoutine.exercises.length === 0 && (
                    <tr><td className="py-3 text-white/60" colSpan={6}>No exercises yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule to calendar */}
          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-semibold">Schedule “{activeRoutine.name}” to your weekly Calendar</h2>
            <p className="text-sm text-white/70 mt-1">Pick days and a time. This will add items to the selected week in your <a className="underline" href="/calendar">Calendar</a>.</p>

            <div className="mt-4 grid md:grid-cols-5 gap-3">
              <Field label="Week (Mon start)">
                <input
                  type="date"
                  value={weekRef.toISOString().slice(0, 10)}
                  onChange={(e) => {
                    const d = new Date(e.target.value + "T00:00:00");
                    setWeekRef(startOfWeek(d));
                  }}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                />
              </Field>

              <Field label="Time">
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </Field>

              <div className="md:col-span-3">
                <div className="text-sm text-white/80">Days</div>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((label, idx) => (
                    <label key={label} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!daysSel[idx]}
                        onChange={(e) => setDaysSel({ ...daysSel, [idx]: e.target.checked })}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button className="btn" onClick={scheduleToCalendar}>Add to this week’s Calendar</button>
            </div>
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
                                    <Input type="number" inputMode="numeric" value={draft.reps} onChange={(e) => setEditing({ ...editing, [key]: { ...draft, reps: Number(e.target.value) } })} />
                                  </Field>
                                  <Field label="Weight (lb)">
                                    <Input type="number" inputMode="decimal" step="0.5" value={draft.weight} onChange={(e) => setEditing({ ...editing, [key]: { ...draft, weight: Number(e.target.value) } })} />
                                  </Field>
                                </div>
                                <div className="flex gap-2">
                                  <button className="btn" onClick={() => {
                                    if (!active) return;
                                    const next = clone(active);
                                    const ex2 = next.exercises.find(e => e.id === ex.id)!;
                                    const s2 = ex2.sets[i];
                                    s2.actualReps = Math.max(0, Number(draft.reps) || 0);
                                    s2.actualWeight = Math.max(0, Number(draft.weight) || 0);
                                    s2.done = true;
                                    setActive(next); cancelEdit(ex.id, i);
                                  }}>Save</button>
                                  <button className="btn-ghost" onClick={() => cancelEdit(ex.id, i)}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 flex gap-2">
                                <button className="btn-ghost" onClick={() => toggleSet(ex.id, i)}>{s.done ? "Undo" : "Complete"}</button>
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
                      {new Date(sess.dateISO).toLocaleString()} — {routines.find(r => r.id === sess.routineId)?.name || "Routine"}
                    </summary>
                    <div className="mt-3">
                      {sess.exercises.map((ex) => (
                        <div key={ex.name} className="mt-2">
                          <div className="font-medium">{ex.name}</div>
                          <ul className="text-sm text-white/80 mt-1 space-y-1">
                            {ex.sets.map((s, i) => (
                              <li key={i}>Set {i + 1}: {(s.actualReps ?? s.targetReps)} reps @ {(s.actualWeight ?? s.targetWeight)} lb</li>
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
        </>
      )}
    </section>
  );
}
