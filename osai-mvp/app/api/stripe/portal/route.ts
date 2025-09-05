import { NextResponse } from "next/server";
export async function POST() {
  // TODO: replace with Stripe Billing Portal session creation
  return NextResponse.json({ url: "/pricing" });
}
