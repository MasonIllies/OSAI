"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * OSAI Weekly Calendar (no external deps)
 * - Single source of truth for everything (work, workout, company, content, music, personal)
 * - LocalStorage persistence
 * - Week navigation (Mon–Sun), quick-add form
 */

type ID = string;
type CalType = "work" | "workout" | "company" | "content" | "music" | "personal";

type CalEvent = {
  id: ID;
  title: string;
  type: CalType;
  startISO: string; // local time converted to ISO
  endISO: string;
  notes?: string;
};

type CalStore = { events: CalEvent[] };

const CAL_KEY = "osai_calendar_v1";

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
function fmtDay(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

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

/* ------------------ Component ------------------ */
export default function CalendarPage() {
  const [store, setStore] = useState<CalStore>({ events: [] });
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek());

  // Quick-add state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CalType>("work");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState("09:00");
  const [duration, setDuration] = useState<number>(60); // minutes
  const [notes, setNotes] = useState("");

  useEffect(() => setStore(loadStore()), []);
  useEffect(() => saveStore(store), [store]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  function nextWeek() {
    setWeekStart(addDays(weekStart, 7));
  }
  function prevWeek() {
    setWeekStart(addDays(weekStart, -7));
  }
  function todayWeek() {
    setWeekStart(startOfWeek(new Date()));
  }

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

  function badgeColor(t: CalType) {
    switch (t) {
      case "workout": return "bg-emerald-400/20 text-emerald-300 border-emerald-300/30";
      case "company": return "bg-sky-400/20 text-sky-300 border-sky-300/30";
      case "content": return "bg-violet-400/20 text-violet-300 border-violet-300/30";
      case "music": return "bg-pink-400/20 text-pink-300 border-pink-300/30";
      case "personal": return "bg-orange-400/20 text-orange-300 border-orange-300/30";
      default: return "bg-white/10 text-white/80 border-white/20";
    }
  }

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
      <p className="text-white/80 max-w-2xl">
        Your only calendar. Mix <b>work</b>, <b>workouts</b>, <b>company</b>, <b>content</b> (YouTube), <b>music</b>, and <b>personal</b> — all in one place.
      </p>

      {/* Quick Add */}
      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-semibold">Quick add</h2>
        <div className="grid md:grid-cols-6 gap-3 mt-4">
          <label className="md:col-span-2 text-sm">
            <span className="text-white/80">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deep work / Leg day / Mix" className="w-full mt-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30" />
          </label>

          <label className="text-sm">
            <span className="text-white/80">Type</span>
            <select value={type} onChange={(e) => setType(e.target.value as CalType)} className="w-full mt-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30">
              <option value="work">Work</option>
              <option value="workout">Workout</option>
              <option value="company">Company</option>
              <option value="content">Content / YouTube</option>
              <option value="music">Music</option>
              <option value="personal">Personal</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="text-white/80">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30" />
          </label>

          <label className="text-sm">
            <span className="text-white/80">Start</span>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full mt-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30" />
          </label>

          <label className="text-sm">
            <span className="text-white/80">Duration (min)</span>
            <input type="number" inputMode="numeric" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full mt-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30" />
          </label>
        </div>

        <label className="block text-sm mt-3">
          <span className="text-white/80">Notes (optional)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full mt-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30" />
        </label>

        <div className="mt-4">
          <button className="btn" onClick={addEvent}>Add to calendar</button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid md:grid-cols-7 gap-4">
        {days.map((d, idx) => {
          const dayEvents = eventsFor(d);
          return (
            <div key={idx} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{fmtDay(d)}</div>
                <span className="pill">{dayEvents.length}</span>
              </div>

              <div className="mt-3 space-y-3">
                {dayEvents.length === 0 && <div className="text-sm text-white/50">No events</div>}

                {dayEvents.map((ev) => (
                  <div key={ev.id} className={`rounded-xl border px-3 py-2 ${badgeColor(ev.type)}`}>
                    <div className="text-xs opacity-80">{fmtTime(ev.startISO)}–{fmtTime(ev.endISO)}</div>
                    <div className="font-medium">{ev.title}</div>
                    {ev.notes && <div className="text-xs opacity-80 mt-1">{ev.notes}</div>}
                    <div className="mt-2">
                      <button className="btn-ghost text-xs" onClick={() => removeEvent(ev.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
