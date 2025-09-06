export default function Contact() {
  return (
    <section className="space-y-6 max-w-2xl">
      <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
      <p className="text-white/80">Questions, partnerships, or press? Reach out.</p>

      <a href="mailto:support@osai.llc?subject=OSAI%20Inquiry" className="btn inline-block">
        Email support@osai.llc →
      </a>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">What to include</h2>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <li>• Your goal (what you want OSAI to handle)</li>
          <li>• Current tools you use (if any)</li>
          <li>• If you want early access to “Locked In.”</li>
        </ul>
      </div>
    </section>
  );
}
