export default function Pricing() {
  return (
    <main className="mx-auto max-w-3xl p-10 text-white">
      <h1 className="text-3xl font-bold mb-4">Choose your plan</h1>
      <div className="grid gap-4">
        <a
          className="rounded border border-white/20 px-4 py-3 inline-block"
          href="https://buy.stripe.com/YOUR_BASIC_CONTROL_LIVE_LINK"  // replace with your live Payment Link
        >
          Basic Control — $9.99/mo
        </a>
        <a
          className="rounded border border-white/20 px-4 py-3 inline-block"
          href="https://buy.stripe.com/YOUR_LOCKED_IN_LIVE_LINK"      // replace with your live Payment Link
        >
          Locked In. — $14.99/mo
        </a>
      </div>
    </main>
  );
}
