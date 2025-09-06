// Server Component: Landing = Sign up free → /modules
import React from "react";

export default function Home({
  searchParams,
}: {
  searchParams?: { next?: string; err?: string };
}) {
  const next = searchParams?.next || "/modules";
  const hasError = searchParams?.err === "1";

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_700px_at_70%_-10%,rgba(255,255,255,0.18),transparent),radial-gradient(800px_500px_at_-10%_30%,rgba(255,255,255,0.10),transparent)] text-white antialiased bg-black">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/30 border-b border-white/10">
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-6 rounded-full bg-white/90 shadow ring-1 ring-black/10" />
            <span className="font-semibold tracking-tight">OSAI</span>
            <span className="hidden md:inline text-white/50">— your personal OS</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/pricing" className="hidden md:inline text-sm text-white/80 hover:text-white">Pricing</a>
            <a href="/legal/terms" className="hidden md:inline text-sm text-white/60 hover:text-white">Terms</a>
            <a href="/legal/privacy" className="hidden md:inline text-sm text-white/60 hover:text-white">Privacy</a>
          </div>
        </nav>
      </header>

      {/* HERO + FREE SIGNUP */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
              Trainable • Private • Always on
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Your personal OS assistant
            </h1>
            <p className="mt-4 text-white/80">
              Sign up free. Use the full product. Limit: add up to <span className="font-semibold">3 modules</span> on the free plan (accelerated learning).
            </p>

            <form method="POST" action="/api/signup" className="mt-8 flex flex-col sm:flex-row items-stretch gap-3">
              <input type="hidden" name="next" value={next} />
              <input
                name="email"
                placeholder="you@yourdomain.com"
                className="flex-1 rounded-full bg-white/5 border border-white/15 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/30"
                autoComplete="email"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold shadow-inner hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Sign up free
              </button>
            </form>
            {hasError && (
              <div className="mt-2 text-sm text-red-300">Enter an email to continue.</div>
            )}

            <div className="mt-6 text-sm text-white/70">
              No credit card. You can upgrade to <span className="font-medium">Locked In.</span> anytime.
            </div>
          </div>

          {/* Side panel bullets */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 shadow-xl backdrop-blur-xl p-5">
              <div className="text-lg font-semibold">What you get free</div>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>• Calendar with GPT prompt bar</li>
                <li>• College-style week view, day/month/year views</li>
                <li>• Modules system — add up to 3 modules</li>
                <li>• Local, private storage for your data</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 shadow-xl backdrop-blur-xl p-5">
              <div className="text-lg font-semibold">Upgrade gets you</div>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>• Unlimited modules</li>
                <li>• Priority features & improvements</li>
                <li>• Early access to experiments</li>
              </ul>
              <a
                href="/pricing"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold shadow-inner hover:bg-white/20"
              >
                See pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-sm flex flex-col md:flex-row items-center justify-between gap-4 text-white/70">
          <div>© {new Date().getFullYear()} OSAI. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-white" href="/pricing">Pricing</a>
            <a className="hover:text-white" href="/legal/terms">Terms</a>
            <a className="hover:text-white" href="/legal/privacy">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
