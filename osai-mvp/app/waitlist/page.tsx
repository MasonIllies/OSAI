export default function Waitlist() {
  return (
    <section className="space-y-6 max-w-2xl">
      <h1 className="text-4xl font-bold tracking-tight">Join the OSAI Waitlist</h1>
      <p className="text-white/80">
        Be first to unlock modules, early features, and “Locked In.” perks. Add your email — we’ll only message when it matters.
      </p>

      {/* Option A: email link now (works today) */}
      <a
        href="mailto:waitlist@osai.llc?subject=OSAI%20Waitlist&body=Name:%0AEmail:%0AWhat%20should%20OSAI%20do%20for%20you%3F"
        className="btn inline-block"
      >
        Email us to join →
      </a>

      {/* Option B: replace this href with your Google Form when ready */}
      <a
        href="https://forms.gle/your-form-id"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost inline-block"
      >
        Or fill the Google Form ↗
      </a>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">What you’ll get</h2>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <li>• Early access to new modules</li>
          <li>• A say in roadmap priorities</li>
          <li>• Founder-only “Locked In.” discounts</li>
        </ul>
      </div>
    </section>
  );
}
