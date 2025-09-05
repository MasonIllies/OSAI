import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Replace with real Stripe Billing Portal session logic.
  // For now, this just returns your pricing page so the button works.
  return NextResponse.json({ url: "/pricing" });
}
