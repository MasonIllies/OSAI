"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * OSAI Weekly Calendar — Visual "college-style" grid
 * - 7 columns (Mon–Sun), hour rows (6:00 → 22:00)
 * - Gradient blocks positioned by time (absolute within each day)
 * - Quick Add form (pretty select); localStorage persistence
 * - Mobile: falls back to simple stacked lists
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

const CAL_KEY = "osai_calendar_v1";

/* ---------- Visual grid constants ---------- */
const DAY_START_HOUR = 6;   // 6:00
const DAY_END_HOUR = 22;    // 22:00
const PX_PER_MIN = 1;       // 60 min -> 60px, total height ~ (END-START)*60 px

/* ------------------ Utilities ------------------ */
const DAY_MS = 24 * 60 * 60 * 1000;

function uid(): ID {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function startOfWeek(d = new Date()): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setHours(0, 0, 0, 0);
  return new Date(x.getTime() - day * DAY_MS);
}
function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function toISOLocal(date: Date, timeHHMM: string): string {
  const [hh, mm] = timeHHMM.split(":").map((n) => parseInt(n || "0", 10));
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}
function fmtDayShort(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/* Position helpers for the grid */
function minutesFromStart(iso: string) {
  const dt = new Date(iso);
  const mins = dt.getHours() * 60 + dt.getMinutes();
  return Math.max(0, mins - DAY_START_HOUR * 60);
}
function eventDurationMin(ev: CalEvent) {
  return Math.max(15, Math.round((+new Date(ev.endISO) - +new Date(ev.startISO)) / 60000));
}

/* Storage */
function loadStore(): CalStore {
  try {
    const raw = localStorage.getItem(CAL_KEY);
    if (!raw) return { events: [] };
    const parsed = JSON.parse(raw) as CalStore;
    if (!parsed.events) parsed.events = [];
    return parsed;
  } catch {
    return { events: [] };
  }
}
function saveStore(store: CalStore) {
  localStorage.setItem(CAL_KEY, JSON.stringify(store));
}

/* ------------------ Little UI helpers ------------------ */
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30 ${props.className || ""}`}
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30 ${props.className || ""}`}
    />
  );
}
/** Clean select with our chevron */
function PrettySelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <div className="relative">
      <select
        {...rest}
        className={
          "appearance-none w-full rounded-lg border border-white/15 bg-white/5 pr-10 pl-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30 " +
          className
        }
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
  );
}

/* Color/gradient per type */
function gradientFor(type: CalType) {
  switch (type) {
    case "workout":
      return "from-emerald-400/40 to-emerald-600/40 border-emerald-300/40";
    case "company":
      return "from-sky-400/40 to-sky-600/40 border-sky-300/40";
    case "content":
      return "from-violet-400/40 to-violet-600/40 border-violet-300/40";
    case "music":
      return "from-pink-400/40 to-pink-600/40 border-pink-300/40";
    case "personal":
      return "from-orange-400/40 to-orange-600/40 border-orange-300/40";
    default:
      return "from-white/20 to-white/10 border-white/20";
  }
}

/* ------------------ Component ------------------ */
export default function CalendarPage() {
  const [store, setStore] = useState<CalStore>({ events: [] });
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek());

  // Quick-add
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CalType>("work");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState("09:00");
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState("");

  useEffect(() => setStore(loadStore()), []);
  useEffect(() => saveStore(store), [store]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  function nextWeek() { setWeekStart(addDays(weekStart, 7)); }
  function prevWeek() { setWeekStart(addDays(weekStart, -7)); }
  function todayWeek() { setWeekStart(startOfWeek(new Date())); }

  function addEvent() {
    if (!title.trim()) return alert("Title required.");
    const day = new Date(date + "T00:00:00");
    const startISO = toISOLocal(day, start);
    const endISO = new Date(new Date(startISO).getTime() + duration * 60000).toISOString();
    const ev: CalEvent = { id: uid(), title: title.trim(), type, startISO, endISO, notes: notes || undefined };
    setStore({ events: [...store.events, ev] });
    setTitle(""); setNotes("");
  }
  function removeEvent(id: ID) {
    setStore({ events: store.events.filter((e) => e.id !== id) });
  }

  function eventsFor(day: Date): CalEvent[] {
    const ds = day.toISOString().slice(0, 10);
    return store.events
      .filter((e) => e.startISO.slice(0, 10) === ds)
      .sort((a, b) => +new Date(a.startISO) - +new Date(b.startISO));
  }

  const totalHeight = (DAY_END_HOUR - DAY_START_HOUR) * 60 * PX_PER_MIN; // px

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) list.push(h);
    return list;
  }, []);

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

      {/* Quick Add */}
      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-semibold">Quick add</h2>
        <div className="grid md:grid-cols-6 gap-3 mt-4">
          <label className="md:col-span-2 text-sm">
            <span className="text-white/80">Title</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deep work / Leg day / Mix" />
          </label>

          <label className="text-sm">
            <span className="text-white/80">Type</span>
            <PrettySelect value={type} onChange={(e) => setType(e.target.value as CalType)}>
              <option value="work">Work</option>
              <option value="workout">Workout</option>
              <option value="company">Company</option>
              <option value="content">Content / YouTube</option>
              <option value="music">Music</option>
              <option value="personal">Personal</option>
            </PrettySelect>
          </label>

          <label className="text-sm">
            <span className="text-white/80">Date</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="text-sm">
            <span className="text-white/80">Start</span>
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>

          <label className="text-sm">
            <span className="text-white/80">Duration (min)</span>
            <Input type="number" inputMode="numeric" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </label>
        </div>

        <label className="block text-sm mt-3">
          <span className="text-white/80">Notes (optional)</span>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>

        <div className="mt-4">
          <button className="btn" onClick={addEvent}>Add to calendar</button>
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
                  return (
                    <div key={i} className="absolute left-0 right-0 border-t border-white/5" style={{ top }} />
                  );
                })}

                {/* Events */}
                {evs.map((ev, i) => {
                  const top = minutesFromStart(ev.startISO) * PX_PER_MIN;
                  const height = eventDurationMin(ev) * PX_PER_MIN;
                  // slight horizontal jitter to hint overlaps
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
                          <button
                            aria-label="Remove"
                            className="text-white/70 hover:text-white text-xs"
                            onClick={() => removeEvent(ev.id)}
                          >
                            ×
                          </button>
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
