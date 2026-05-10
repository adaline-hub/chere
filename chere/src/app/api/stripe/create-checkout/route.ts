import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { Tier } from "@/lib/supabase/types";

const TIER_PRICES: Record<string, { amount: number; name: string }> = {
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

    const price = TIER_PRICES[tier];
    if (!price) {
      return NextResponse.json({ error: "Unknown tier" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.get("origin") ?? "https://chere.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: price.name },
            unit_amount: price.amount,
          },
          quantity: 1,
        },
      ],
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
