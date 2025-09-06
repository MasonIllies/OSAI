"use client";

import { useEffect, useMemo, useState, useRef } from "react";

/**
 * OSAI Weekly Calendar — visual timetable + guided add flow
 *
 * NEW:
 * - Custom dark dropdowns (no OS-white menus)
 * - Guided flow: 1) Add to calendar  2) Select module/routine  3) Assistant box (days/times/recurring)
 * - Reads Workout routines from localStorage (osai_workout_v2) for selection
 * - College-style grid (Mon–Sun by hour) with gradient blocks
 */

type ID = string;
type CalType = "work" | "workout" | "company" | "content" | "music" | "personal";

type CalEvent = {
  id: ID;
  title: string;
  type: CalType;
  startISO: string;
  endISO: string;
  notes?: string;
};
type CalStore = { events: CalEvent[] };

/* --------- Routines (pulled from Workout module storage) --------- */
type ProgressionMode = "weight" | "reps";
type RoutineExercise = {
  id: ID;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  progression: { mode: ProgressionMode; step: number; capReps?: number };
};
type Routine = { id: ID; name: string; exercises: RoutineExercise[] };
type WorkoutStoreV2 = { routines: Routine[]; activeRoutineId?: ID; history: any[] };

const CAL_KEY = "osai_calendar_v1";
const WORKOUT_KEY = "osai_workout_v2";

/* ---------- Visual grid constants ---------- */
const DAY_START_HOUR = 6;   // 6:00
const DAY_END_HOUR = 22;    // 22:00
const PX_PER_MIN = 1;       // 60 min -> 60px

/* ------------------ Utilities ------------------ */
const DAY_MS = 24 * 60 * 60 * 1000;
function uid(): ID { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function startOfWeek(d = new Date()): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setHours(0, 0, 0, 0);
  return new Date(x.getTime() - day * DAY_MS);
}
function addDays(d: Date, days: number): Date { const x = new Date(d); x.setDate(x.getDate() + days); return x; }
function toISOLocal(date: Date, timeHHMM: string): string {
  const [hh, mm] = timeHHMM.split(":").map((n) => parseInt(n || "0", 10));
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}
function fmtDayShort(d: Date) { return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); }
function minutesFromStart(iso: string) {
  const dt = new Date(iso);
  const mins = dt.getHours() * 60 + dt.getMinutes();
  return Math.max(0, mins - DAY_START_HOUR * 60);
}
function eventDurationMin(ev: CalEvent) { return Math.max(15, Math.round((+new Date(ev.endISO) - +new Date(ev.startISO)) / 60000)); }
function loadCalendar(): CalStore {
  try {
    const raw = localStorage.getItem(CAL_KEY);
    if (!raw) return { events: [] };
    const parsed = JSON.parse(raw) as CalStore;
    if (!parsed.events) parsed.events = [];
    return parsed;
  } catch { return { events: [] }; }
}
function saveCalendar(store: CalStore) { localStorage.setItem(CAL_KEY, JSON.stringify(store)); }
function loadWorkout(): WorkoutStoreV2 | null {
  try {
    const raw = localStorage.getItem(WORKOUT_KEY);
    return raw ? (JSON.parse(raw) as WorkoutStoreV2) : null;
  } catch { return null; }
}

/* ------------------ Little UI helpers ------------------ */
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/30 ${props.className || ""}`}
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/30 ${props.className || ""}`}
    />
  );
}
function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs text-white/80">{children}</span>;
}
function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs border transition ${active ? "bg-white/20 border-white/30" : "bg-white/5 border-white/15 hover:bg-white/10"}`}
    >
      {label}
    </button>
  );
}

/** Custom dark dropdown (no OS-white). Keyboard + click outside supported. */
function DarkSelect<T extends string>({
  value,
  onChange,
  options,
  getLabel,
  className = "",
}: {
  value: T;
  onChange: (next: T) => void;
  options: T[];
  getLabel: (v: T) => string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white flex items-center justify-between focus:ring-2 focus:ring-white/30"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{getLabel(value)}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="opacity-70">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-white/15 bg-black/80 backdrop-blur-xl shadow-xl"
        >
          <div className="max-h-56 overflow-auto py-1">
            {options.map((opt) => (
              <button
                key={opt}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 ${opt === value ? "text-white" : "text-white/80"}`}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {getLabel(opt)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Color/gradient per type */
function gradientFor(type: CalType) {
  switch (type) {
    case "workout":  return "from-emerald-400/40 to-emerald-600/40 border-emerald-300/40";
    case "company":  return "from-sky-400/40 to-sky-600/40 border-sky-300/40";
    case "content":  return "from-violet-400/40 to-violet-600/40 border-violet-300/40";
    case "music":    return "from-pink-400/40 to-pink-600/40 border-pink-300/40";
    case "personal": return "from-orange-400/40 to-orange-600/40 border-orange-300/40";
    default:         return "from-white/20 to-white/10 border-white/20";
  }
}

/* ------------------ Component ------------------ */
export default function CalendarPage() {
  const [store, setStore] = useState<CalStore>({ events: [] });
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek());

  // Guided flow
  type Step = 1 | 2 | 3;
  const [step, setStep] = useState<Step>(1);

  // Step 1 (what type)
  const [type, setType] = useState<CalType>("work");

  // Step 2 (module/routine or title)
  const workout = loadWorkout();
  const routines = workout?.routines || [];
  const [routineId, setRoutineId] = useState<ID>(workout?.activeRoutineId || routines[0]?.id);
  const [title, setTitle] = useState<string>("Deep Work");

  // Step 3 (assistant)
  const [assistantText, setAssistantText] = useState<string>(
    "Mon, Wed, Fri at 7:00am for 60 min, recurring weekly"
  );
  const [daysSel, setDaysSel] = useState<Record<number, boolean>>({1:true,3:true,5:true}); // Mon/Wed/Fri
  const [time, setTime] = useState("07:00");
  const [duration, setDuration] = useState<number>(60);
  const [recurring, setRecurring] = useState<boolean>(true);
  const [notes, setNotes] = useState("");

  // Storage
  useEffect(() => setStore(loadCalendar()), []);
  useEffect(() => saveCalendar(store), [store]);

  // Grid days/hours
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const totalHeight = (DAY_END_HOUR - DAY_START_HOUR) * 60 * PX_PER_MIN;
  const hours = useMemo(() => { const list:number[]=[]; for (let h=DAY_START_HOUR; h<=DAY_END_HOUR; h++) list.push(h); return list; }, []);

  /* ---------------- Actions ---------------- */
  function prevWeek() { setWeekStart(addDays(weekStart, -7)); }
  function nextWeek() { setWeekStart(addDays(weekStart, 7)); }
  function todayWeek() { setWeekStart(startOfWeek(new Date())); }

  function removeEvent(id: ID) {
    setStore({ events: store.events.filter((e) => e.id !== id) });
  }
  function eventsFor(day: Date): CalEvent[] {
    const ds = day.toISOString().slice(0, 10);
    return store.events
      .filter((e) => e.startISO.slice(0, 10) === ds)
      .sort((a, b) => +new Date(a.startISO) - +new Date(b.startISO));
  }

  // Very small natural-language helper for the assistant box
  function interpretAssistant(text: string) {
    const t = text.toLowerCase();

    // days
    const map: Record<string, number> = { sun:0, mon:1, tue:2, tues:2, wed:3, thu:4, thur:4, fri:5, sat:6 };
    const nextDays: Record<number, boolean> = {};
    Object.entries(map).forEach(([k, idx]) => { if (t.includes(k)) nextDays[idx] = true; });

    // time (7am / 7:30am / 19:00)
    let foundTime = time;
    const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (m) {
      let h = parseInt(m[1],10);
      const mm = m[2] ? parseInt(m[2],10) : 0;
      const ap = m[3];
      if (ap === "pm" && h < 12) h += 12;
      if (ap === "am" && h === 12) h = 0;
      foundTime = `${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
    }

    // duration (e.g., 60 min / 1h / 90 minutes)
    let dur = duration;
    const md = t.match(/(\d+)\s*(min|mins|minutes|m)/) || t.match(/(\d+)\s*(h|hr|hour|hours)/);
    if (md) {
      const val = parseInt(md[1],10);
      const unit = md[2];
      dur = /h/.test(unit) ? val * 60 : val;
    }

    // recurring?
    const rec = /recurring|every week|weekly|each week/.test(t);

    setDaysSel(Object.keys(nextDays).length ? nextDays : daysSel);
    setTime(foundTime);
    setDuration(dur);
    setRecurring(rec);
  }

  function addToCalendar() {
    const baseTitle =
      type === "workout"
        ? `Workout: ${routines.find(r => r.id === routineId)?.name || "Routine"}`
        : title.trim() || "Block";

    const chosenDays = Object.entries(daysSel).filter(([, on]) => on).map(([idx]) => Number(idx));
    if (chosenDays.length === 0) return alert("Select at least one day.");

    const calEvents: CalEvent[] = [];
    const weekBase = startOfWeek(weekStart);

    chosenDays.forEach((dow) => {
      const d = addDays(weekBase, dow);
      const startISO = toISOLocal(d, time);
      const endISO = new Date(new Date(startISO).getTime() + duration * 60000).toISOString();
      calEvents.push({
        id: uid(),
        title: baseTitle,
        type,
        startISO,
        endISO,
        notes: notes || undefined,
      });
    });

    setStore({ events: [...store.events, ...calEvents] });
    if (recurring) {
      alert("Added to this week. (Recurring weekly scheduling UI coming next.)");
    }
    setStep(1); // reset flow to the top
  }

  /* ---------------- Render ---------------- */
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-4xl font-bold tracking-tight">Calendar</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={prevWeek}>← Prev</button>
          <button className="btn" onClick={todayWeek}>This Week</button>
          <button className="btn-ghost" onClick={nextWeek}>Next →</button>
        </div>
      </div>
      <p className="text-white/80 max-w-3xl">
        A single, visual planner. Mix <b>work</b>, <b>workouts</b>, <b>company</b>, <b>content</b> (YouTube), <b>music</b>, and <b>personal</b> in one grid.
      </p>

      {/* Guided Add Flow */}
      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <Pill>1</Pill><div className="font-semibold">Add to calendar</div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <DarkSelect<CalType>
            value={type}
            onChange={setType}
            options={["work", "workout", "company", "content", "music", "personal"]}
            getLabel={(v) =>
              ({ work:"Work", workout:"Workout", company:"Company", content:"Content / YouTube", music:"Music", personal:"Personal" } as const)[v]
            }
          />
          {type === "workout" ? (
            <DarkSelect<string>
              value={routineId || ""}
              onChange={(id) => setRoutineId(id)}
              options={(routines.length ? routines : [{ id: "", name: "No routines found — create one in Workout", exercises: [] } as Routine]).map(r => r.id)}
              getLabel={(id) => routines.find(r => r.id === id)?.name || "No routines found — open /modules/workout"}
              className="md:col-span-2"
            />
          ) : (
            <Input className="md:col-span-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Block title (e.g., Deep Work)" />
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Pill>2</Pill><div className="font-semibold">Assistant</div>
        </div>
        <p className="text-sm text-white/70 -mt-2">
          Tell me days, times, duration, and whether it repeats. Example: <i>“Mon, Wed, Fri at 7am for 60 min, recurring weekly”</i>
        </p>
        <Textarea value={assistantText} onChange={(e) => setAssistantText(e.target.value)} rows={2} />
        <div className="flex flex-wrap gap-2">
          <Chip label="Parse" onClick={() => interpretAssistant(assistantText)} />
          <Chip label="MWF · 60m · 7am · weekly" onClick={() => { setDaysSel({1:true,3:true,5:true}); setTime("07:00"); setDuration(60); setRecurring(true); }} />
          <Chip label="TTh · 90m · 6pm" onClick={() => { setDaysSel({2:true,4:true}); setTime("18:00"); setDuration(90); setRecurring(false); }} />
          <Chip label="Daily · 30m · 8am" onClick={() => { setDaysSel({0:true,1:true,2:true,3:true,4:true,5:true,6:true}); setTime("08:00"); setDuration(30); setRecurring(true); }} />
        </div>

        <div className="grid md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <div className="text-sm text-white/80">Days (this week, Mon start)</div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDaysSel({ ...daysSel, [idx]: !daysSel[idx] })}
                  className={`rounded-lg px-2 py-1 text-xs border ${daysSel[idx] ? "bg-white/20 border-white/30" : "bg-white/5 border-white/15 hover:bg-white/10"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-white/80">Start</div>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <div className="text-sm text-white/80">Duration (min)</div>
            <Input type="number" inputMode="numeric" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
              Recurring weekly
            </label>
          </div>
        </div>

        <div>
          <div className="text-sm text-white/80">Notes (optional)</div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>

        <div className="pt-2">
          <button className="btn" onClick={addToCalendar}>Add to calendar</button>
        </div>
      </div>

      {/* MOBILE: simple list */}
      <div className="md:hidden space-y-4">
        {days.map((d, idx) => {
          const evs = eventsFor(d);
          return (
            <div key={idx} className="card p-4">
              <div className="font-semibold">{fmtDayShort(d)}</div>
              <div className="mt-2 space-y-2">
                {evs.length === 0 && <div className="text-sm text-white/50">No events</div>}
                {evs.map((ev) => (
                  <div key={ev.id} className={`rounded-xl border px-3 py-2 bg-gradient-to-br ${gradientFor(ev.type)}`}>
                    <div className="text-xs opacity-80">{fmtTime(ev.startISO)}–{fmtTime(ev.endISO)}</div>
                    <div className="font-medium">{ev.title}</div>
                    {ev.notes && <div className="text-xs opacity-80 mt-1">{ev.notes}</div>}
                    <button className="btn-ghost text-xs mt-2" onClick={() => removeEvent(ev.id)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP: visual timetable */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-2">
          {/* Hour gutter */}
          <div className="relative" style={{ height: `${totalHeight}px` }}>
            {hours.map((h, i) => {
              const top = (h - DAY_START_HOUR) * 60 * PX_PER_MIN;
              const label = new Date().setHours(h, 0, 0, 0);
              return (
                <div key={i} className="absolute left-0 right-0" style={{ top }}>
                  <div className="text-[10px] text-white/60 -translate-y-2">{new Date(label).toLocaleTimeString(undefined, { hour: "numeric" })}</div>
                  <div className="border-t border-white/10" />
                </div>
              );
            })}
          </div>

          {/* 7 day columns */}
          {days.map((d, colIdx) => {
            const evs = eventsFor(d);
            return (
              <div key={colIdx} className="relative card p-2 overflow-hidden" style={{ height: `${totalHeight}px` }}>
                {/* Day header */}
                <div className="absolute left-2 top-2 z-10 text-xs font-medium opacity-80">
                  {fmtDayShort(d)}
                </div>

                {/* Hour lines (faint) */}
                {hours.map((h, i) => {
                  const top = (h - DAY_START_HOUR) * 60 * PX_PER_MIN;
                  return <div key={i} className="absolute left-0 right-0 border-t border-white/5" style={{ top }} />;
                })}

                {/* Events */}
                {evs.map((ev, i) => {
                  const top = minutesFromStart(ev.startISO) * PX_PER_MIN;
                  const height = eventDurationMin(ev) * PX_PER_MIN;
                  const jitter = (i % 2) * 4;
                  return (
                    <div
                      key={ev.id}
                      title={ev.notes || ev.title}
                      className={`absolute left-[6px] right-[6px] rounded-xl border text-[12px] leading-tight shadow-lg backdrop-blur-xs bg-gradient-to-br ${gradientFor(ev.type)}`}
                      style={{ top: Math.max(2, top) + jitter, height: Math.max(22, height) }}
                    >
                      <div className="px-2 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold truncate">{ev.title}</div>
                          <button aria-label="Remove" className="text-white/70 hover:text-white text-xs" onClick={() => removeEvent(ev.id)}>×</button>
                        </div>
                        <div className="opacity-80">{fmtTime(ev.startISO)}–{fmtTime(ev.endISO)}</div>
                        {ev.notes && <div className="opacity-70 mt-0.5 line-clamp-2">{ev.notes}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
