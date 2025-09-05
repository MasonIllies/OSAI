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
    <div className="pt-4">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Account</h1>
      <p className="text-white/75 mb-6">Manage your subscription in the Stripe Customer Portal.</p>

      <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-xl max-w-xl">
        <button
          onClick={() => openPortal()}
          disabled={loading}
          className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold shadow-inner hover:bg-white/20 disabled:opacity-60"
        >
          {loading ? "Opening…" : "Open Billing Portal"}
        </button>
        {msg && <p className="mt-4 text-sm text-red-300">{msg}</p>}
      </div>
    </div>
  );
}
