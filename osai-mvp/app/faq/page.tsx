export default function FAQ() {
  return (
    <section className="space-y-8 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">FAQ</h1>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">What is OSAI?</h2>
        <p className="mt-2 text-white/80">
          Your always-on personal OS assistant. Modules + checklists + a coach that outputs clean JSON into a simple UI — no chaos.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">What do I get with Basic Control vs “Locked In.”?</h2>
        <p className="mt-2 text-white/80">
          <b>Basic Control</b> covers the core assistant and starter modules. <b>Locked In.</b> unlocks all current/future modules, priority updates, and early betas.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">Is my data private?</h2>
        <p className="mt-2 text-white/80">
          Yes. Minimal data is stored; row-level security keeps your rows yours. See <a className="underline" href="/legal/privacy">Privacy</a>.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">Can I cancel anytime?</h2>
        <p className="mt-2 text-white/80">Yep. Manage your plan in the billing portal at any time.</p>
      </div>
    </section>
  );
}
