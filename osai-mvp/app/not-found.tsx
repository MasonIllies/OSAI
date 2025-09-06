export default function NotFound() {
  return (
    <section className="max-w-xl text-center md:text-left">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-white/80">
        That route doesn’t exist. Try the homepage or pricing.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
        <a href="/" className="btn">Go home →</a>
        <a href="/pricing" className="btn-ghost">View pricing</a>
      </div>
    </section>
  );
}
