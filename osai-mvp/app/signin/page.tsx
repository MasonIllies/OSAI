"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/calendar";
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const EXPECTED = process.env.NEXT_PUBLIC_ACCESS_CODE || "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EXPECTED) {
      setErr("Missing NEXT_PUBLIC_ACCESS_CODE. Set it in Vercel → Settings → Environment Variables.");
      return;
    }
    if (code.trim() !== EXPECTED) {
      setErr("Wrong access code.");
      return;
    }
    // 30-day cookie
    document.cookie = `osai_auth=1; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax; Secure`;
    router.push(next);
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-white/70 text-sm mt-1">
          Enter your access code to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
          />
          {err && <div className="text-sm text-red-300">{err}</div>}
          <button type="submit" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold shadow-inner hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30">
            Continue
          </button>
        </form>

        <div className="text-xs text-white/60 mt-4">
          You’ll be redirected to <span className="text-white/80">{next}</span>.
        </div>
      </div>
    </div>
  );
}
