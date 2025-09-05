export default function Pricing() {
  return (
    <div className="pt-4">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Choose your plan</h1>
      <p className="text-white/75 mb-6">Start with <span className="font-medium">Basic Control</span>. Go <span className="font-medium">Locked In.</span> when you’re ready.</p>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-semibold">Basic Control</h3>
            <div className="text-3xl font-bold tracking-tight">$9.99<span className="text-base font-medium text-white/70">/mo</span></div>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-white/90">
            <li>• 2 starter modules (Workout, Finance)</li>
            <li>• Hosted checkout + portal</li>
            <li>• Dark/Light themes</li>
          </ul>
          <a
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold shadow-inner hover:bg-white/20"
            href="https://buy.stripe.com/6oU00kbPvh03eUbb3U7g402"
          >
            Continue
          </a>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-xl ring-1 ring-white/30">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-semibold">Locked In.</h3>
            <div className="text-3xl font-bold tracking-tight">$14.99<span className="text-base font-medium text-white/70">/mo</span></div>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-white/90">
            <li>• All current & future modules</li>
            <li>• Priority improvements</li>
            <li>• Early beta access</li>
          </ul>
          <a
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold shadow-inner hover:bg-white/20"
            href="https://buy.stripe.com/6oU00kbPvh03eUbb3U7g402"
          >
            Continue
          </a>
        </div>
      </div>
    </div>
  );
}
