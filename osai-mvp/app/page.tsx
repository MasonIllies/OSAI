import React from "react";
import { ArrowRight, Check, CreditCard, Shield, Zap, ExternalLink } from "lucide-react";

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
    {children}
  </span>
);

const FrostCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl md:rounded-3xl border border-white/15 bg-white/10 shadow-xl backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

const Row = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1"><Icon className="size-5" aria-hidden /></div>
    <div>
      <h4 className="text-base font-semibold leading-tight">{title}</h4>
      <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
    </div>
  </div>
);

type PriceProps = {
  name: string;
  price: string; // "$9.99"
  note?: string;
  features: string[];
  href?: string; // Stripe link or /pricing
  popular?: boolean;
};

const Price = ({ name, price, note, features, href, popular = false }: PriceProps) => {
  const external = !!href && /^https?:\/\//i.test(href);
  return (
    <FrostCard className={`p-6 md:p-8 transition-transform ${popular ? "ring-1 ring-white/40 scale-[1.01]" : "hover:scale-[1.01]"}`}>
      {popular && <div className="mb-4"><Pill>Recommended</Pill></div>}
      <div className="flex items-baseline justify-between">
        <h3 className="text-xl font-semibold">{name}</h3>
        <div className="text-3xl font-bold tracking-tight">
          {price}<span className="text-base font-medium text-white/70">/mo</span>
        </div>
      </div>
      {note && <p className="mt-1 text-sm text-white/70">{note}</p>}
      <ul className="mt-6 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <Check className="mt-0.5 size-4" aria-hidden />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href={href || "/pricing"}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } as any : {})}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold shadow-inner transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        Subscribe — {name} ({price}/mo) <ArrowRight className="size-4" aria-hidden />
      </a>
    </FrostCard>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="pt-12 md:pt-20 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-4"><Pill>Trainable • Private • Always on</Pill></div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
            Your personal OS assistant
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-white/80">
            Structure beats motivation. OSAI gives you modules, checklists, and a coach that outputs clean JSON into a simple UI — no chaos.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <a href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold shadow-inner hover:bg-white/20">
              See plans <ArrowRight className="size-4" aria-hidden />
            </a>
            <a href="#benefits" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold hover:bg-white/10">
              How it works <ExternalLink className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="pt-14 md:pt-20">
        <div className="grid md:grid-cols-3 gap-5">
          <FrostCard className="p-6 md:p-7">
            <Row icon={Zap} title="Fast to live" desc="Next.js + Supabase + Stripe. Create account, pay, use. No fluff." />
          </FrostCard>
          <FrostCard className="p-6 md:p-7">
            <Row icon={Shield} title="Private by default" desc="Minimal data stored. RLS policies so only you touch your rows." />
          </FrostCard>
          <FrostCard className="p-6 md:p-7">
            <Row icon={CreditCard} title="Billing that’s painless" desc="Stripe Checkout and Customer Portal. Cancel anytime." />
          </FrostCard>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="pt-14 md:pt-20">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Simple pricing</h2>
          <p className="mt-2 text-white/75">
            Start with <span className="font-medium">Basic Control</span>. When you’re ready, go <span className="font-medium">Locked In.</span>
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <Price
            name="Basic Control"
            price="$9.99"
            note="Core assistant + essentials"
            features={["2 starter modules (Workout, Finance)", "Hosted checkout + portal", "Dark/Light themes"]}
            href={process.env.NEXT_PUBLIC_STRIPE_BASIC_URL}
          />
          <Price
            name="Locked In."
            price="$14.99"
            note="All modules + priority updates"
            features={["All current & future modules", "Priority improvements", "Beta features early"]}
            href={process.env.NEXT_PUBLIC_STRIPE_LOCKED_URL}
            popular
          />
        </div>
      </section>

      {/* ACCOUNT CTA */}
      <section className="pt-14 md:pt-20 pb-4">
        <FrostCard className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            <div className="grow">
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Manage your subscription</h3>
              <p className="mt-2 text-sm text-white/75">Open the Stripe Customer Portal to update cards, change plans, or cancel anytime.</p>
            </div>
            <a href="/account" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold shadow-inner hover:bg-white/20">
              Open Billing Portal <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </FrostCard>
      </section>
    </div>
  );
}
