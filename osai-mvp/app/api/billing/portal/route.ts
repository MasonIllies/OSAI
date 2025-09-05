import Stripe from "stripe";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");

    let customerId: string | null = null;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      customerId = (session.customer as string) || null;

      if (customerId) {
        cookies().set("osai_stripe_customer", customerId, {
          httpOnly: true,
          sameSite: "lax",
          secure: true,
          maxAge: 60 * 60 * 24 * 365,
          path: "/",
        });
      }
    }

    if (!customerId) customerId = cookies().get("osai_stripe_customer")?.value || null;
    if (!customerId) return Response.json({ error: "NO_CUSTOMER" }, { status: 400 });

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    });

    return Response.json({ url: portal.url });
  } catch (err) {
    console.error("PORTAL_FAILED:", err);
    return Response.json({ error: "PORTAL_FAILED" }, { status: 500 });
  }
}
