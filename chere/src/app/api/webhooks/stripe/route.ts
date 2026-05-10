import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminUpdateCreation } from "@/lib/supabase/creations";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { creationId, tier } = session.metadata ?? {};

    if (creationId && tier) {
      await adminUpdateCreation(creationId, {
        tier: tier as "standard" | "premium" | "deluxe",
        stripe_payment_id: typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
        expires_at: null, // paid = permanent
      }).catch((e) => console.error("[stripe/webhook] DB update failed:", e));
    }
  }

  return NextResponse.json({ received: true });
}
