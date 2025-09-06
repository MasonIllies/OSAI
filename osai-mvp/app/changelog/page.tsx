function Entry({
  date, title, items,
}: { date: string; title: string; items: string[] }) {
  return (
    <article className="card p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-xs text-white/60 mt-1">{date}</p>
      <ul className="mt-3 space-y-2 text-sm text-white/80">
        {items.map((it) => <li key={it}>• {it}</li>)}
      </ul>
    </article>
  );
}

export default function Changelog() {
  return (
    <section className="space-y-8 max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
      <p className="text-white/80">The ship log. Real changes, in plain English.</p>

      <div className="space-y-5">
        <Entry
          date={new Date().toLocaleDateString()}
          title="Polished marketing surface"
          items={[
            "Centered layout and consistent ‘glass’ design",
            "Added Waitlist, FAQ, Contact",
            "Live legal pages (Terms, Privacy)",
          ]}
        />
        <Entry
          date={new Date().toLocaleDateString()}
          title="Pricing clarity"
          items={[
            "Two plans: Basic Control and Locked In.",
            "Buttons label plan + price",
            "Account page opens Billing Portal placeholder",
          ]}
        />
      </div>
    </section>
  );
}
