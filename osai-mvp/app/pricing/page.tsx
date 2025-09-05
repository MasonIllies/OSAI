const FEATURES_BASIC = [
  "Core assistant (always-on)",
  "Notes, tasks, and simple automations",
  "Email summaries once/day",
];

const FEATURES_LOCKED = [
  "Everything in Basic",
  "Advanced automations & integrations",
  "Priority task execution",
  "Billing portal & fast support",
];

const STRIPE_BASIC = process.env.NEXT_PUBLIC_STRIPE_BASIC_URL || "#";
const STRIPE_LOCKED = process.env.NEXT_PUBLIC_STRIPE_LOCKED_URL || "#";

function PlanCard({
  name, price, features, checkoutUrl
}: { name: string; price: string; features: string[]; checkoutUrl: string }) {
  return (
    <div className="rounded-2xl border border-white/15 p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">{name}</h2>
      <p className="mt-1 text-white/70">{price}/mo</p>
      <ul className="mt-4 list-disc pl-5 space-y-1">
        {features.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <div className="mt-6">
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-base font-semibold border border-white/15 shadow-sm hover:opacity-90 focus:outline-none focus:ring"
        >
          Subscribe — {name} ({price}/mo)
        </a>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <section className="space-y-10">
      <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <PlanCard
          name="Basic Control"
          price="$9.99"
          features={FEATURES_BASIC}
          checkoutUrl={STRIPE_BASIC}
        />
        <PlanCard
          name="Locked In"
          price="$14.99"
          features={FEATURES_LOCKED}
          checkoutUrl={STRIPE_LOCKED}
        />
      </div>
      <p className="text-sm text-white/60">You can change plans anytime in the billing portal.</p>
    </section>
  );
}
