import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setStatusByEmail(email?: string | null, customerId?: string, status?: string) {
  if (!email) return;
  const { data: users, error: uerr } = await (supabaseAdmin as any).auth.admin.listUsers({ email });
  if (uerr) throw uerr;
  const user = users?.users?.[0];
  if (!user) return;

  const { error: perr } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: user.id, // assumes profiles.id = auth.users.id
      stripe_customer_id: customerId ?? undefined,
      subscription_status: status ?? undefined,
    }, { onConflict: 'id' });
  if (perr) throw perr;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const buf = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    return new NextResponse(`Invalid signature: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        await setStatusByEmail(s.customer_details?.email, String(s.customer), 'active');
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const cust = await stripe.customers.retrieve(String(sub.customer)) as Stripe.Customer;
        await setStatusByEmail(typeof cust.email === 'string' ? cust.email : undefined, String(sub.customer), String(sub.status));
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const cust = await stripe.customers.retrieve(String(sub.customer)) as Stripe.Customer;
        await setStatusByEmail(typeof cust.email === 'string' ? cust.email : undefined, String(sub.customer), 'canceled');
        break;
      }
      default: break;
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}