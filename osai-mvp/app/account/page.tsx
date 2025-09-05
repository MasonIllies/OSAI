"use client";
import { useEffect, useState } from "react";

export default function Account() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ok = p.get("ok");
    const sid = p.get("session_id");
    if (ok && sid) openPortal(sid);
  }, []);

  async function openPortal(sessionId?: string) {
    setLoading(true);
    setMsg(null);
    try {
      const qs = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
      const r = await fetch(`/api/billing/portal${qs}`, { method: "POST" });
      const j = await r.json();
      if (j.url) window.location.href = j.url;
      else setMsg("Could not open billing portal. Try again.");
    } catch {
      setMsg("Portal error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-10 text-white">
      <h1 className="text-3xl font-bold mb-4">Account</h1>
      <p className="mb-6 text-white/80">Manage your subscription in the Stripe Customer Portal.</p>
      <button
        onClick={() => openPortal()}
        disabled={loading}
        className="rounded border border-white/20 px-4 py-3 inline-flex items-center gap-2 disabled:opacity-60"
      >
        {loading ? "Opening…" : "Open Billing Portal"}
      </button>
      {msg && <p className="mt-4 text-sm text-red-300">{msg}</p>}
    </main>
  );
}
