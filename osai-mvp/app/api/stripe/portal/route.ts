import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Replace with Stripe Billing Portal session creation.
  // return NextResponse.json({ url: portalSession.url });
  return NextResponse.json({ url: "/pricing" });
}
