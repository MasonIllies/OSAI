export default function ModulesIndex() {
  return (
    <section className="space-y-8 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Modules</h1>
      <p className="text-white/80">
        Start with one fully working module. More unlock as we go.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        <a href="/modules/workout" className="card p-6 md:p-8 block hover:bg-white/10 transition-colors">
          <h2 className="text-xl font-semibold">🏋️ Workout</h2>
          <p className="text-sm text-white/70 mt-1">Plan sessions, check off sets, and auto-progress next time.</p>
        </a>

        <div className="card p-6 md:p-8 opacity-70">
          <h2 className="text-xl font-semibold">💸 Finance (coming soon)</h2>
          <p className="text-sm text-white/70 mt-1">Weekly snapshots, spend buckets, and nudges.</p>
        </div>
      </div>
    </section>
  );
}
