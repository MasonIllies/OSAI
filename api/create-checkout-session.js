// /api/create-checkout-session.js
import Stripe from "stripe";
import { getAdminSupabase } from "../lib/supabaseAdmin.js";
import cookie from "cookie";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };

async function getUserFromCookie(req) {
  try {
    const raw = req.headers.cookie || "";
    const parsed = cookie.parse(raw || "");
    const access =
      parsed["sb-access-token"] ||
      parsed["supabase-auth-token"];
    if (!access) return null;

    const supabase = getAdminSupabase();
    const { data, error } = await supabase.auth.getUser(access);
    if (error) return null;
    return data?.user || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { priceId, successUrl, cancelUrl } = req.body || {};
    const price = priceId || process.env.STRIPE_PRICE_ID;
    if (!price) return res.status(400).json({ error: "Missing priceId" });

    const user = await getUserFromCookie(req);
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    const supabase = getAdminSupabase();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, display_name, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.display_name || undefined,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: successUrl || `${process.env.PUBLIC_SITE_URL}/?success=1`,
      cancel_url:  cancelUrl  || `${process.env.PUBLIC_SITE_URL}/?canceled=1`,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      allow_promotion_codes: true
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}
