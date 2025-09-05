import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Replace with real Stripe Billing Portal session creation
  return NextResponse.json({ url: "/pricing" });
}
