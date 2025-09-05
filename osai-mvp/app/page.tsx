export default function Home() {
  return (
    <div className="space-y-16 md:space-y-20">
      {/* HERO */}
      <section className="text-center md:text-left">
        <div className="max-w-3xl mx-auto md:mx-0">
          <span className="pill">Trainable • Private • Always on</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
            Your personal OS assistant
          </h1>
          <p className="mt-4 text-white/80">
            Structure beats motivation. OSAI gives you modules, checklists, and a coach that outputs clean JSON into a simple UI — no chaos.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 md:justify-start justify-center">
            <a href="/pricing" className="btn">See plans →</a>
            <a href="#benefits" className="btn-ghost">How it works ↗</a>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="card p-6 md:p-7">
            <h3 className="text-base font-semibold">🚀 Fast to live</h3>
            <p className="text-sm text-white/70 mt-1">Next.js + Supabase + Stripe. Create account, pay, use. No fluff.</p>
          </div>
          <div className="card p-6 md:p-7">
            <h3 className="text-base font-semibold">🔒 Private by default</h3>
            <p className="text-sm text-white/70 mt-1">Minimal data stored. RLS policies so only you touch your rows.</p>
          </div>
          <div className="card p-6 md:p-7">
            <h3 className="text-base font-semibold">💳 Billing that’s painless</h3>
            <p className="text-sm text-white/70 mt-1">Stripe Checkout + Customer Portal. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">Modules included</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-6">
            <h3 className="text-lg font-semibold">Workout</h3>
            <p className="text-sm text-white/70 mt-1">Plan, track, and auto-progress routines. Export clean JSON.</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold">Finance</h3>
            <p className="text-sm text-white/70 mt-1">Budgets, cashflow, and weekly snapshots. Always-on nudges.</p>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section>
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Simple pricing</h2>
          <p className="mt-2 text-white/75">
            Start with <span className="font-medium">Basic Control</span>. When you’re ready, go <span className="font-medium">Locked In.</span>
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-6 md:p-8">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-semibold">Basic Control</h3>
              <div className="text-3xl font-bold tracking-tight">$9.99<span className="text-base font-medium text-white/70">/mo</span></div>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              <li>• 2 starter modules (Workout, Finance)</li>
              <li>• Hosted checkout + portal</li>
              <li>• Dark/Light themes</li>
            </ul>
            <a href={process.env.NEXT_PUBLIC_STRIPE_BASIC_URL || "/pricing"} className="btn mt-8">Subscribe — Basic Control ($9.99/mo)</a>
          </div>

          <div className="card p-6 md:p-8 ring-1 ring-white/40">
            <span className="pill inline-block mb-4">Recommended</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-semibold">Locked In.</h3>
              <div className="text-3xl font-bold tracking-tight">$14.99<span className="text-base font-medium text-white/70">/mo</span></div>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              <li>• All current & future modules</li>
              <li>• Priority improvements</li>
              <li>• Beta features early</li>
            </ul>
            <a href={process.env.NEXT_PUBLIC_STRIPE_LOCKED_URL || "/pricing"} className="btn mt-8">Subscribe — Locked In. ($14.99/mo)</a>
          </div>
        </div>
      </section>

      {/* ACCOUNT CTA */}
      <section>
        <div className="card p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            <div className="grow">
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Manage your subscription</h3>
              <p className="mt-2 text-sm text-white/75">Open the Stripe Customer Portal to update cards, change plans, or cancel anytime.</p>
            </div>
            <a href="/account" className="btn">Open Billing Portal →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
