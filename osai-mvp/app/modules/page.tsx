"use client";

import { useEffect, useState } from "react";

type ModuleKey = "workout" | "company" | "content" | "music" | "finance" | "personal" | "focus" | "notes";
type Mod = { key: ModuleKey; name: string; desc: string };

const ALL: Mod[] = [
  { key: "workout", name: "Workout", desc: "Routines, progression, sessions." },
  { key: "company", name: "Company", desc: "Sales, CRM, ops, runway." },
  { key: "content", name: "Content", desc: "YouTube scripts, shoots, edits." },
  { key: "music", name: "Music", desc: "Tracks, mixes, album roadmap." },
  { key: "finance", name: "Finance", desc: "Budget, cashflow, dashboards." },
  { key: "personal", name: "Personal", desc: "Errands, health, family." },
  { key: "focus", name: "Focus", desc: "Deep work timer & goals." },
  { key: "notes", name: "Notes", desc: "Atomic notes, backlinks, tasks." },
];

const STORAGE_KEY = "osai_modules_v1";

export default function ModulesPage() {
  const [selected, setSelected] = useState<ModuleKey[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSelected(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);

  const atLimit = selected.length >= 3;

  function toggle(m: ModuleKey) {
    setSelected((list) => {
      if (list.includes(m)) return list.filter((x) => x !== m);
      if (list.length >= 3) return list; // hard stop on free
      return [...list, m];
    });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 text-white">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Modules</h1>
          <p className="text-white/70 mt-1">
            Free plan: add up to <span className="font-semibold">3</span> modules. Upgrade to unlock unlimited.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/calendar" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold shadow-inner hover:bg-white/20">
            Open Calendar
          </a>
          <a href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold shadow-inner hover:bg-white/20">
            Upgrade (Locked In.)
          </a>
        </div>
      </div>

      {atLimit && (
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
          <div className="text-sm">
            You’ve reached the free limit of <b>3 modules</b>. Remove one, or{" "}
            <a href="/pricing" className="underline hover:opacity-80">upgrade to Locked In.</a>
          </div>
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL.map((m) => {
          const active = selected.includes(m.key);
          const disabled = !active && atLimit;
          return (
            <button
              key={m.key}
              onClick={() => !disabled && toggle(m.key)}
              className={`text-left rounded-3xl border p-5 transition
                ${active ? "border-white/30 bg-white/15" : "border-white/10 bg-white/5 hover:bg-white/10"}
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="text-lg font-semibold">{m.name}</div>
              <div className="text-sm text-white/70 mt-1">{m.desc}</div>
              <div className="mt-4 text-sm">
                {active ? (
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1">Added</span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1">Add module</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected summary */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-white/70">Selected modules ({selected.length}/3):</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.length === 0 && <div className="text-sm text-white/60">None yet. Pick up to 3.</div>}
          {selected.map((k) => (
            <span key={k} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
              {ALL.find((x) => x.key === k)?.name}
              <button onClick={() => toggle(k)} className="opacity-80 hover:opacity-100">×</button>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
