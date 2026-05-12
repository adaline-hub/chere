import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { Tier } from "@/lib/supabase/types";

const TIER_PRICE_IDS: Record<string, string | undefined> = {
  standard: process.env.STRIPE_PRICE_STANDARD,
  premium: process.env.STRIPE_PRICE_PREMIUM,
  deluxe: process.env.STRIPE_PRICE_DELUXE,
};

const TIER_FALLBACK: Record<string, { amount: number; name: string }> = {
  standard: { amount: 999, name: "Chère Standard" },
  premium: { amount: 2499, name: "Chère Premium" },
  deluxe: { amount: 4499, name: "Chère Deluxe" },
};

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  try {
    const { creationId, tier } = (await req.json()) as {
      creationId: string | null;
      tier: Tier;
    };

    if (!tier || tier === "free") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceId = TIER_PRICE_IDS[tier];
    const fallback = TIER_FALLBACK[tier];
    if (!fallback) {
      return NextResponse.json({ error: "Unknown tier" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.get("origin") ?? "https://chere.app";

    const lineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: { name: fallback.name },
            unit_amount: fallback.amount,
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      metadata: { creationId: creationId ?? "", tier },
      success_url: `${origin}/create?payment=success`,
      cancel_url: `${origin}/create?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/create-checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
