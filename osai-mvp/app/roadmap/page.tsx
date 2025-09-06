export default function Roadmap() {
  return (
    <section className="space-y-8 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Roadmap</h1>
      <p className="text-white/80">
        Direction over distraction. Here’s what’s coming and what just shipped.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Now (Building)</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>• Workout module v1 (plans, sessions, progression)</li>
            <li>• Finance snapshots (weekly digest, spend buckets)</li>
            <li>• Billing Portal polish (self-serve upgrades)</li>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold">Next (Up Next)</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>• Routines & checklists (JSON-first, shareable)</li>
            <li>• Calendar hooks (nudges, “show me my next 3”)</li>
            <li>• Mobile-friendly quick capture</li>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold">Later (Exploring)</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>• Email triage (“summarize + next step”)</li>
            <li>• Files inbox (auto-rename + classify)</li>
            <li>• Team mode (lightweight sharing)</li>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold">Your vote</h2>
          <p className="mt-3 text-sm text-white/80">
            Want something moved up? <a className="underline" href="/waitlist">Join the waitlist</a> and reply to the welcome email with your #1 ask.
          </p>
        </div>
      </div>
    </section>
  );
}
