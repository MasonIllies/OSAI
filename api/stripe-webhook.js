// /api/stripe-webhook.js
import Stripe from "stripe";
import { buffer } from "micro";
import { getAdminSupabase } from "../lib/supabaseAdmin.js";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = getAdminSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const userId = s.client_reference_id || s.metadata?.supabase_user_id;
        if (userId) {
          await supabase.from("profiles").update({
            subscription_status: "active",
            subscription_current_period_end: s.expires_at ? new Date(s.expires_at * 1000).toISOString() : null
          }).eq("id", userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object;
        if (sub.customer) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", sub.customer)
            .maybeSingle();
          if (prof?.id) {
            await supabase.from("profiles").update({
              subscription_status: sub.status,
              subscription_current_period_end: new Date(sub.current_period_end * 1000).toISOString()
            }).eq("id", prof.id);
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        if (sub.customer) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", sub.customer)
            .maybeSingle();
          if (prof?.id) {
            await supabase.from("profiles").update({ subscription_status: "canceled" }).eq("id", prof.id);
          }
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    res.status(500).send("Server error");
  }
}
