"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * OSAI Calendar — GPT Bar + Day/Week/Month/Year Views
 * - GPT-style input for natural scheduling
 * - Views: Day / Week / Month / Year
 * - LocalStorage events + simple weekly recurrence rules
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
  location?: string;
};
type CalStore = { events: CalEvent[] };

type ChatMsg = { role: "user" | "assistant"; text: string; chips?: { label: string; apply: () => void }[] };

type ProgressionMode = "weight" | "reps";
type Routine = {
  id: ID;
  name: string;
  exercises: { id: ID; name: string; sets: number; reps: number; weight: number; progression: { mode: ProgressionMode; step: number; capReps?: number } }[];
};
type WorkoutStoreV2 = { routines: Routine[]; activeRoutineId?: ID; history: any[] };
const DEFAULT_WORKOUT: WorkoutStoreV2 = { routines: [], history: [] };

const CAL_KEY = "osai_calendar_v1";
const WORKOUT_KEY = "osai_workout_v2";
const RULES_KEY = "osai_calendar_rules_v1";

/* ---- Visual timetable constants ---- */
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;
const PX_PER_MIN = 1;
const DAY_MS = 24 * 60 * 60 * 1000;

/* ---------------- Utils ---------------- */
function uid(): ID { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function startOfWeek(d = new Date()): Date { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setHours(0,0,0,0); return new Date(x.getTime() - day * DAY_MS); }
function startOfMonth(d = new Date()): Date { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function addWeeks(d: Date, n: number) { return addDays(d, n * 7); }
function addMonths(d: Date, n: number) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
function addYears(d: Date, n: number) { const x = new Date(d); x.setFullYear(x.getFullYear() + n); return x; }
function toISOLocal(date: Date, timeHHMM: string) { const [hh, mm] = timeHHMM.split(":").map((n) => parseInt(n || "0", 10)); const d = new Date(date); d.setHours(hh, mm, 0, 0); return d.toISOString(); }
function fmtDayShort(d: Date) { return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }
function fmtDayLong(d: Date) { return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
function fmtMonthYear(d: Date) { return d.toLocaleDateString(undefined, { month: "long", year: "numeric" }); }
function fmtYear(d: Date) { return d.getFullYear().toString(); }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); }
function minutesFromStart(iso: string) { const dt = new Date(iso); return Math.max(0, dt.getHours() * 60 + dt.getMinutes() - DAY_START_HOUR * 60); }
function eventDurationMin(ev: CalEvent) { return Math.max(15, Math.round((+new Date(ev.endISO) - +new Date(ev.startISO)) / 60000)); }
function sameDay(a: Date, b: Date) { return a.toISOString().slice(0,10) === b.toISOString().slice(0,10); }

function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function save<T>(key: string, val: T) { localStorage.setItem(key, JSON.stringify(val)); }

/* ---------------- Parsers ---------------- */
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","sept","oct","nov","dec"];
const DOW: Record<string, number> = { sun:0, sunday:0, mon:1, monday:1, tue:2, tues:2, tuesday:2, wed:3, weds:3, wednesday:3, thu:4, thur:4, thurs:4, thursday:4, fri:5, friday:5, sat:6, saturday:6 };

type Intent = {
  type?: CalType;
  title?: string;
  routineName?: string;
  days?: number[];          // 0..6
  date?: Date;              // explicit date
  start?: string;           // "HH:MM"
  end?: string;             // "HH:MM"
  duration?: number;        // minutes
  location?: string;
  with?: string[];
  recurring?: boolean;
  notes?: string;
};

function guessType(text: string): CalType | undefined {
  const t = text.toLowerCase();
  if (/\bworkout|gym|lift|squat|deadlift|bench\b/.test(t)) return "workout";
  if (/\bcontent|youtube|video|script|shoot|edit\b/.test(t)) return "content";
  if (/\bmusic|mix|master|studio|song|album\b/.test(t)) return "music";
  if (/\bcompany|startup|osai|sales|client\b/.test(t)) return "company";
  if (/\bpersonal|errand|dentist|doctor|family\b/.test(t)) return "personal";
  if (/\bwork|meeting|deep work|focus\b/.test(t)) return "work";
  return undefined;
}

function parseDays(text: string, anchorWeekStart: Date): { days?: number[]; date?: Date; recurring?: boolean } {
  const t = text.toLowerCase();

  if (/\bweekdays?\b/.test(t)) return { days: [1,2,3,4,5], recurring: true };
  if (/\bweekends?\b/.test(t)) return { days: [0,6], recurring: true };

  const set = new Set<number>();
  for (const [k, idx] of Object.entries(DOW)) if (new RegExp(`\\b${k}\\b`).test(t)) set.add(idx);
  if (set.size) return { days: [...set], recurring: true };

  if (/\btoday\b/.test(t)) return { date: new Date(), recurring: false };
  if (/\btomorrow\b/.test(t)) return { date: addDays(new Date(), 1), recurring: false };

  const nextX = t.match(/next\s+(sun|mon|tue|tues|weds?|thu|thur|thurs|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  if (nextX) {
    const idx = DOW[nextX[1]];
    let d = startOfWeek(anchorWeekStart); d = addDays(d, idx);
    if (d <= new Date()) d = addDays(d, 7);
    return { date: d, recurring: false };
  }
  const m = t.match(new RegExp(`\\b(${MONTHS.join("|")})\\s*(\\d{1,2})\\b`));
  if (m) {
    const month = Math.max(0, MONTHS.indexOf(m[1]));
    const day = parseInt(m[2], 10);
    const y = new Date().getFullYear();
    return { date: new Date(y, month, day), recurring: false };
  }
  return {};
}

function normalizeHour(h: number, ampm?: string | null) {
  let H = h;
  if (ampm) {
    if (/pm/.test(ampm) && H < 12) H += 12;
    if (/am/.test(ampm) && H === 12) H = 0;
  } else {
    if (H >= 1 && H <= 7) H += 12;
  }
  return H;
}
function parseTime(text: string): { start?: string; end?: string; duration?: number } {
  const t = text.toLowerCase();

  // 4-6 / 4-6pm / 4:30-6 / 16:00-18:00
  const r = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[-–to]+\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (r) {
    let H1 = normalizeHour(parseInt(r[1], 10), r[3]);
    const M1 = r[2] ? parseInt(r[2], 10) : 0;
    let H2 = normalizeHour(parseInt(r[4], 10), r[6] || r[3] || null);
    const M2 = r[5] ? parseInt(r[5], 10) : 0;
    const s = `${String(H1).padStart(2,"0")}:${String(M1).padStart(2,"0")}`;
    const e = `${String(H2).padStart(2,"0")}:${String(M2).padStart(2,"0")}`;
    return { start: s, end: e };
  }

  // 7am for 90m / 1h
  const s1 = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  const d1 = t.match(/(\d+)\s*(min|mins|minutes|m|h|hr|hour|hours)/);
  if (s1 && d1) {
    let H = normalizeHour(parseInt(s1[1], 10), s1[3]);
    const M = s1[2] ? parseInt(s1[2], 10) : 0;
    let dur = parseInt(d1[1], 10);
    if (/h/.test(d1[2])) dur *= 60;
    return { start: `${String(H).padStart(2,"0")}:${String(M).padStart(2,"0")}`, duration: dur };
  }

  return {};
}
function parseLocation(text: string): string | undefined {
  const at = text.match(/@\s*([^,]+(?:, *[^,]+)*)/i);
  return at ? at[1].trim() : undefined;
}
function parseWith(text: string): string[] {
  const names: string[] = [];
  const regex = /\bwith\s+([a-z][a-z\s.'-]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text))) names.push(m[1].trim());
  return names;
}

function parseIntent(raw: string, anchorWeekStart: Date) {
  const text = raw.trim(); const t = text.toLowerCase();
  const intent: Intent = {};
  intent.type = guessType(t);

  // read workouts
  const workout = load<WorkoutStoreV2>(WORKOUT_KEY, DEFAULT_WORKOUT);

  // If a routine matches, use its name; otherwise avoid "Workout: workout ..."
  if (intent.type === "workout" && workout.routines.length) {
    const found = workout.routines.find((r) => t.includes(r.name.toLowerCase()));
    if (found) {
      const clean = found.name.replace(/^work(out)?[:\s-]*/i, "").trim();
      intent.routineName = clean || found.name;
    }
  }

  // Title guess
  if (intent.type === "workout" && !intent.routineName) {
    intent.title = "Workout";
  } else {
    const stripped = t.replace(/@\s.*$/, "").replace(/\b(with|at|on|every|each|week|weekly|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|am|pm|for|minutes?|mins?|hours?|hr|h)\b/gi, "");
    const words = stripped.split(/\s+/).filter(Boolean);
    if (words.length) intent.title = words.slice(0, 5).join(" ");
  }

  // day/time/other
  Object.assign(intent, parseDays(t, anchorWeekStart));
  Object.assign(intent, parseTime(t));
  intent.location = parseLocation(text);
  intent.with = parseWith(text);
  if (/\b(recurring|every week|weekly|each week)\b/i.test(t)) intent.recurring = true;

  // notes
  const notesBits: string[] = [];
  const afterComma = text.split("@")[0];
  const hint = afterComma.split(/,|–|-—/).slice(1).join(",").trim(); // <-- FIXED
  if (hint) notesBits.push(hint);
  if (intent.with?.length) notesBits.push("With: " + intent.with.join(", "));
  if (intent.location) notesBits.push("Location: " + intent.location);
  intent.notes = notesBits.filter(Boolean).join(" · ");

  return intent;
}

/* ---------------- Recurrence ---------------- */
type RecurrenceRule = {
  id: ID;
  type: CalType;
  titleOrRoutine: string;
  days: number[];
  time: string;
  duration: number;
  location?: string;
  notes?: string;
};
function applyRulesToWeek(rules: RecurrenceRule[], weekStart: Date, push: (ev: CalEvent) => void) {
  const seen = new Set<string>();
  rules.forEach((r) => {
    r.days.forEach((dow) => {
      const day = addDays(startOfWeek(weekStart), dow);
      const sISO = toISOLocal(day, r.time);
      const eISO = new Date(new Date(sISO).getTime() + r.duration * 60000).toISOString();
      const title = r.type === "workout" ? `Workout: ${r.titleOrRoutine}` : r.titleOrRoutine;
      const ev: CalEvent = { id: uid(), title, type: r.type, startISO: sISO, endISO: eISO, location: r.location, notes: r.notes };
      const key = `${r.type}|${title}|${sISO}`;
      if (!seen.has(key)) { push(ev); seen.add(key); }
    });
  });
}

/* ---------------- Component ---------------- */
type View = "day" | "week" | "month" | "year";

export default function CalendarPage() {
  const [store, setStore] = useState<CalStore>({ events: [] });
  const [rules, setRules] = useState<RecurrenceRule[]>([]);
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState<Date>(new Date());
  const weekStart = startOfWeek(cursor);

  // Chat
  const [chat, setChat] = useState<ChatMsg[]>([{ role: "assistant", text: "What do you want to add?" }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load/save
  useEffect(() => { setStore(load<CalStore>(CAL_KEY, { events: [] })); setRules(load<RecurrenceRule[]>(RULES_KEY, [])); }, []);
  useEffect(() => { save(CAL_KEY, store); }, [store]);
  useEffect(() => { save(RULES_KEY, rules); }, [rules]);

  // Apply recurrence when week changes
  useEffect(() => {
    const toAdd: CalEvent[] = [];
    applyRulesToWeek(rules, weekStart, (ev) => toAdd.push(ev));
    if (toAdd.length) setStore((s) => ({ events: [...s.events, ...toAdd] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  // Derived
  const hours = useMemo(() => { const arr:number[]=[]; for (let h=DAY_START_HOUR; h<=DAY_END_HOUR; h++) arr.push(h); return arr; }, []);
  const daysOfWeek = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Helpers
  function eventsForDate(d: Date): CalEvent[] {
    const ds = d.toISOString().slice(0, 10);
    return store.events.filter(e => e.startISO.slice(0,10) === ds).sort((a,b) => +new Date(a.startISO) - +new Date(b.startISO));
  }
  function eventsForMonth(m: Date): CalEvent[] {
    const y = m.getFullYear(); const mon = m.getMonth();
    return store.events.filter(e => { const dt = new Date(e.startISO); return dt.getFullYear() === y && dt.getMonth() === mon; });
  }
  function removeEvent(id: ID) { setStore({ events: store.events.filter((e) => e.id !== id) }); }

  /* ---------- GPT-ish handling ---------- */
  function respond(msg: ChatMsg) {
    setChat((c) => [...c, msg]);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 0);
  }

  function handleSubmit() {
    const userText = input.trim();
    if (!userText) return;
    respond({ role: "user", text: userText });
    setInput("");

    const intent = parseIntent(userText, weekStart);
    if (!intent.type) intent.type = "work";
    if (intent.type === "workout" && intent.routineName) intent.title = `Workout: ${intent.routineName}`;
    if (!intent.title) intent.title = intent.type === "workout" ? "Workout" : "Block";

    const missing: string[] = [];
    if (!intent.days && !intent.date) missing.push("which days");
    if (!intent.start && !intent.end && !intent.duration) missing.push("time");
    if (!(intent.end || intent.duration)) missing.push("duration");

    if (missing.length) {
      const chips: ChatMsg["chips"] = [
        { label: "MWF · 7–8am · weekly", apply: () => quickApply({ days: [1,3,5], start: "07:00", end: "08:00", recurring: true }) },
        { label: "Tue/Thu · 6–7:30pm", apply: () => quickApply({ days: [2,4], start: "18:00", end: "19:30", recurring: true }) },
        { label: "Today · 60m · 4pm", apply: () => quickApply({ date: new Date(), start: "16:00", duration: 60 }) },
      ];
      respond({
        role: "assistant",
        text: `Got it: **${intent.title}**${intent.location ? ` @ ${intent.location}` : ""}${intent.with?.length ? ` (with ${intent.with.join(", ")})` : ""}. I need ${missing.join(", ")}.`,
        chips,
      });
      (window as any).__osaiDraft = intent;
      return;
    }
    finalizeAndSchedule(intent);
  }
  function quickApply(overrides: Partial<Intent>) {
    const base: Intent = (window as any).__osaiDraft || {};
    const merged: Intent = { ...base, ...overrides };
    finalizeAndSchedule(merged);
    (window as any).__osaiDraft = undefined;
  }
  function finalizeAndSchedule(intent: Intent) {
    const title = intent.title!; const type = intent.type!; const recurring = !!intent.recurring;
    const addList: CalEvent[] = [];
    if (intent.date) {
      const s = toISOLocal(intent.date, intent.start || "09:00");
      const e = intent.end ? toISOLocal(intent.date, intent.end) : new Date(new Date(s).getTime() + (intent.duration || 60) * 60000).toISOString();
      addList.push({ id: uid(), title, type, startISO: s, endISO: e, notes: intent.notes, location: intent.location });
      setView("day"); setCursor(intent.date);
    } else if (intent.days && intent.days.length) {
      const base = startOfWeek(weekStart);
      intent.days.forEach((dow) => {
        const day = addDays(base, dow);
        const s = toISOLocal(day, intent.start || "09:00");
        const e = intent.end ? toISOLocal(day, intent.end) : new Date(new Date(s).getTime() + (intent.duration || 60) * 60000).toISOString();
        addList.push({ id: uid(), title, type, startISO: s, endISO: e, notes: intent.notes, location: intent.location });
      });
      setView("week");
    }
    if (addList.length) setStore({ events: [...store.events, ...addList] });

    if (recurring && intent.days?.length && (intent.start || intent.end)) {
      const time = intent.start || "09:00";
      const duration = intent.duration || (intent.start && intent.end
        ? Math.max(15, (parseInt(intent.end.slice(0,2))*60+parseInt(intent.end.slice(3)))-(parseInt(time.slice(0,2))*60+parseInt(time.slice(3))))
        : 60);
      const rule: RecurrenceRule = {
        id: uid(),
        type,
        titleOrRoutine: intent.type === "workout" && intent.routineName ? intent.routineName : title,
        days: intent.days!,
        time,
        duration,
        location: intent.location,
        notes: intent.notes,
      };
      setRules([...rules, rule]);
    }

    respond({ role: "assistant", text: `Added **${title}**${intent.location ? ` @ ${intent.location}` : ""}${intent.with?.length ? ` (with ${intent.with.join(", ")})` : ""}${recurring ? " — recurring weekly" : ""}.` });
  }

  /* ---------- Navigation ---------- */
  function prev() { if (view === "day") setCursor(addDays(cursor, -1)); else if (view === "week") setCursor(addWeeks(cursor, -1)); else if (view === "month") setCursor(addMonths(cursor, -1)); else setCursor(addYears(cursor, -1)); }
  function next() { if (view === "day") setCursor(addDays(cursor, +1)); else if (view === "week") setCursor(addWeeks(cursor, +1)); else if (view === "month") setCursor(addMonths(cursor, +1)); else setCursor(addYears(cursor, +1)); }
  function today() { setCursor(new Date()); }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Calendar</h1>
          <div className="text-white/70">
            {view === "day" && fmtDayLong(cursor)}
            {view === "week" && `${fmtDayShort(daysOfWeek[0])} → ${fmtDayShort(daysOfWeek[6])}`}
            {view === "month" && fmtMonthYear(cursor)}
            {view === "year" && fmtYear(cursor)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/5 border border-white/10 p-1 flex">
            {(["day","week","month","year"] as View[]).map(v => (
              <button key={v} className={`px-3 py-1.5 text-sm rounded-full ${view===v?"bg-white/20":"hover:bg-white/10"}`} onClick={()=>setView(v)}>
                {v[0].toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-ghost" onClick={prev}>← Prev</button>
          <button className="btn" onClick={today}>Today</button>
          <button className="btn-ghost" onClick={next}>Next →</button>
        </div>
      </div>

      {/* GPT BAR */}
      <div className="card p-0 overflow-hidden">
        <div className="max-h-60 overflow-auto px-4 pt-4" ref={scrollRef}>
          {chat.map((m, i) => (
            <div key={i} className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block max-w[90%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-white/20" : "bg-white/8 border border-white/10"}`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.chips && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.chips.map((c, idx) => (
                      <button key={idx} className="rounded-full px-3 py-1 text-xs border bg-white/5 border-white/15 hover:bg-white/10" onClick={c.apply}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 px-3 py-2">
          <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g., "workout mon & wed 4–6 with Tom @ Railyard, legs first"'
              className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
            />
            <button className="btn" type="submit">Add</button>
          </form>
        </div>
      </div>

      {/* VIEWS */}
      {view === "day" && (
        <DayView
          date={cursor}
          events={eventsForDate(cursor)}
          removeEvent={removeEvent}
        />
      )}

      {view === "week" && (
        <WeekView
          days={daysOfWeek}
          hours={hours}
          totalHeight={(DAY_END_HOUR - DAY_START_HOUR) * 60 * PX_PER_MIN}
          eventsForDate={eventsForDate}
          removeEvent={removeEvent}
        />
      )}

      {view === "month" && (
        <MonthView
          monthCursor={startOfMonth(cursor)}
          eventsForMonth={eventsForMonth}
          onPickDay={(d) => { setCursor(d); setView("day"); }}
        />
      )}

      {view === "year" && (
        <YearView
          yearCursor={new Date(cursor.getFullYear(), 0, 1)}
          eventsForMonth={eventsForMonth}
          onPickMonth={(d) => { setCursor(d); setView("month"); }}
        />
      )}
    </section>
  );
}

/* ====================== VIEW COMPONENTS ====================== */

function gradientFor(type: CalType) {
  // darker, polite contrasts that fit the theme
  switch (type) {
    case "workout":  return "from-emerald-500/25 to-emerald-800/25 border-emerald-400/30";
    case "company":  return "from-sky-500/25 to-sky-800/25 border-sky-400/30";
    case "content":  return "from-violet-500/25 to-violet-800/25 border-violet-400/30";
    case "music":    return "from-fuchsia-500/25 to-fuchsia-800/25 border-fuchsia-400/30";
    case "personal": return "from-amber-500/25 to-amber-800/25 border-amber-400/30";
    default:         return "from-zinc-300/15 to-zinc-600/20 border-white/20";
  }
}

/* ---- Day View (agenda + hour rail) ---- */
function DayView({ date, events, removeEvent }: { date: Date; events: CalEvent[]; removeEvent: (id: ID) => void; }) {
  const hours = Array.from({length: (DAY_END_HOUR - DAY_START_HOUR) + 1}, (_,i)=>DAY_START_HOUR+i);
  const totalHeight = (DAY_END_HOUR - DAY_START_HOUR) * 60 * PX_PER_MIN;

  return (
    <div className="grid md:grid-cols-[120px_1fr] gap-4">
      {/* Agenda list */}
      <div className="card p-4">
        <div className="font-semibold">{date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
        <div className="mt-3 space-y-2">
          {events.length === 0 && <div className="text-sm text-white/60">No events today.</div>}
          {events.map(ev => (
            <div key={ev.id} className={`rounded-xl border px-3 py-2 bg-gradient-to-br ${gradientFor(ev.type)} no-transition`}>
              <div className="text-xs opacity-80">{fmtTime(ev.startISO)}–{fmtTime(ev.endISO)}</div>
              <div className="font-medium">{ev.title}</div>
              {ev.location && <div className="opacity-75">{ev.location}</div>}
              {ev.notes && <div className="text-xs opacity-80 mt-1">{ev.notes}</div>}
              <button className="btn-ghost text-xs mt-2" onClick={() => removeEvent(ev.id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative card p-2 overflow-hidden" style={{ height: `${totalHeight}px` }}>
        {hours.map((h,i) => {
          const top = (h - DAY_START_HOUR) * 60 * PX_PER_MIN;
          const label = new Date().setHours(h,0,0,0);
          return (
            <div key={i} className="absolute left-0 right-0" style={{ top }}>
              <div className="text-[10px] text-white/60 -translate-y-2">{new Date(label).toLocaleTimeString(undefined, { hour: "numeric" })}</div>
              <div className="border-t border-white/10" />
            </div>
          );
        })}
        {events.map((ev) => {
          const top = minutesFromStart(ev.startISO) * PX_PER_MIN;
          const height = eventDurationMin(ev) * PX_PER_MIN;
          return (
            <div key={ev.id}
              className={`absolute left-2 right-2 rounded-xl border text-[12px] leading-tight shadow-lg bg-gradient-to-br ${gradientFor(ev.type)} no-transition`}
              style={{ top: Math.max(2, top), height: Math.max(22, height) }}>
              <div className="px-2 py-1.5 font-medium truncate">{ev.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Week View (college timetable) ---- */
function WeekView({
  days, hours, totalHeight, eventsForDate, removeEvent,
}: {
  days: Date[];
  hours: number[];
  totalHeight: number;
  eventsForDate: (d: Date) => CalEvent[];
  removeEvent: (id: ID) => void;
}) {
  return (
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

        {/* Day columns */}
        {days.map((d, colIdx) => {
          const evs = eventsForDate(d);
          return (
            <div key={colIdx} className="relative card p-2 overflow-hidden" style={{ height: `${totalHeight}px` }}>
              <div className="absolute left-2 top-2 z-10 text-xs font-medium opacity-80">{fmtDayShort(d)}</div>
              {hours.map((h, i) => {
                const top = (h - DAY_START_HOUR) * 60 * PX_PER_MIN;
                return <div key={i} className="absolute left-0 right-0 border-t border-white/5" style={{ top }} />;
              })}
              {evs.map((ev) => {
                const top = minutesFromStart(ev.startISO) * PX_PER_MIN;
                const height = eventDurationMin(ev) * PX_PER_MIN;
                return (
                  <div key={ev.id}
                    className={`absolute left-[6px] right-[6px] rounded-xl border text-[12px] leading-tight shadow-lg backdrop-blur-xs bg-gradient-to-br ${gradientFor(ev.type)} no-transition`}
                    style={{ top: Math.max(2, top), height: Math.max(22, height) }}>
                    <div className="px-2 py-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold truncate">{ev.title}</div>
                        <button aria-label="Remove" className="text-white/70 hover:text-white text-xs" onClick={() => removeEvent(ev.id)}>×</button>
                      </div>
                      <div className="opacity-80">{fmtTime(ev.startISO)}–{fmtTime(ev.endISO)}</div>
                      {ev.location && <div className="opacity-75">{ev.location}</div>}
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
  );
}

/* ---- Month View (6-week grid) ---- */
function MonthView({
  monthCursor,
  eventsForMonth,
  onPickDay,
}: {
  monthCursor: Date;
  eventsForMonth: (m: Date) => CalEvent[];
  onPickDay: (d: Date) => void;
}) {
  const firstOfMonth = startOfMonth(monthCursor);
  const firstWeekStart = startOfWeek(firstOfMonth);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(firstWeekStart, i));
  const monthEvents = eventsForMonth(firstOfMonth);

  function eventsOn(d: Date) {
    const ds = d.toISOString().slice(0,10);
    return monthEvents.filter(e => e.startISO.slice(0,10) === ds);
  }

  return (
    <div className="card p-4">
      <div className="grid grid-cols-7 gap-2 text-xs text-white/60 mb-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((s)=> <div key={s} className="text-center">{s}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, idx) => {
          const inMonth = d.getMonth() === firstOfMonth.getMonth();
          const todays = sameDay(d, new Date());
          const evs = eventsOn(d);
          return (
            <button
              key={idx}
              onClick={() => onPickDay(d)}
              className={`text-left rounded-xl p-2 border transition ${inMonth ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-white/5 opacity-60" } ${todays ? "ring-1 ring-white/60" : ""}`}
            >
              <div className="text-xs mb-1">{d.getDate()}</div>
              <div className="space-y-1">
                {evs.slice(0,3).map(ev => (
                  <div key={ev.id} className={`truncate rounded-md px-2 py-0.5 text-[11px] border bg-gradient-to-br ${gradientFor(ev.type)}`}>{ev.title}</div>
                ))}
                {evs.length > 3 && <div className="text-[11px] text-white/70">+{evs.length-3} more</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Year View (12 months overview) ---- */
function YearView({
  yearCursor,
  eventsForMonth,
  onPickMonth,
}: {
  yearCursor: Date;
  eventsForMonth: (m: Date) => CalEvent[];
  onPickMonth: (d: Date) => void;
}) {
  const months = Array.from({length: 12}, (_,i)=> new Date(yearCursor.getFullYear(), i, 1));
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {months.map((m) => {
        const count = eventsForMonth(m).length;
        return (
          <button key={m.toISOString()} onClick={() => onPickMonth(m)} className="card p-4 text-left hover:bg-white/10 transition">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{m.toLocaleDateString(undefined, { month: "long" })}</div>
              <span className="pill">{count}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-white/40" style={{ width: `${Math.min(100, (count/30)*100)}%` }} />
            </div>
            <div className="text-xs text-white/60 mt-1">events this month</div>
          </button>
        );
      })}
    </div>
  );
}
