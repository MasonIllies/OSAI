"use client";
import { useState } from "react";

export default function AccountPage() {
  const [loading, setLoading] = useState(false);
  const [authed] = useState(true); // TODO: replace with real auth

  const openPortal = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe-portal", { method: "POST" });
      if (!res.ok) throw new Error("failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      alert("Could not open billing portal. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Account</h1>
      {!authed ? (
        <p className="text-white/70">Please sign in to manage your subscription.</p>
      ) : (
        <div className="flex gap-4 items-center">
          <button onClick={openPortal} disabled={loading} className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-base font-semibold border border-white/15 shadow-sm hover:opacity-90 focus:outline-none focus:ring disabled:opacity-50">
            {loading ? "Opening…" : "Open Billing Portal"}
          </button>
          <a href="/pricing" className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-base font-semibold border border-white/15 shadow-sm hover:opacity-90 focus:outline-none focus:ring">
            Change Plan
          </a>
        </div>
      )}
    </section>
  );
}
