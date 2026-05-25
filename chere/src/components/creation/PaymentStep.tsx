"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { Tier } from "@/lib/supabase/types";

interface TierDef {
  id: Tier;
  name: string;
  price: string;
  features: string[];
  badge?: string;
  muted?: boolean;
}

const TIERS: TierDef[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    muted: true,
    features: [
      "Scrolling Story format only",
      "Up to 5 photos",
      "\"Made with Chère\" watermark",
      "Shareable for 7 days",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9.99",
    badge: "Most popular",
    features: [
      "All formats",
      "Up to 15 photos",
      "No watermark",
      "Link active for 1 year",
      "Email delivery",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$19.99",
    features: [
      "Everything in Starter",
      "Permanent link — forever",
      "Downloadable PDF keepsake",
      "Background music",
    ],
  },
];

export default function PaymentStep() {
  const { tier, setTier, creationId, setStep } = useCreationStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (tier === "free") {
      setStep("deliver");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creationId, tier }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout unavailable");
      }
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl text-espresso text-center mb-3"
        >
          Choose your gift wrapping
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-10 leading-relaxed"
        >
          Every option is beautiful. Paid tiers unlock more.
        </motion.p>

        {/* Tier grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
        >
          {TIERS.map((t, i) => {
            const selected = tier === t.id;
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: t.muted ? 0.65 : 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                onClick={() => setTier(t.id)}
                className="text-left p-5 rounded-xl relative"
                style={{
                  backgroundColor: "var(--color-cream)",
                  border: "2px solid",
                  borderColor: selected ? "var(--color-muted-gold)" : "transparent",
                  boxShadow: selected
                    ? "var(--shadow-elevated), 0 0 0 1px var(--color-muted-gold)20"
                    : t.muted
                    ? "none"
                    : "var(--shadow-card)",
                  transform: selected ? "translateY(-3px)" : "none",
                  transition:
                    "border-color 350ms var(--ease-elegant), box-shadow 350ms var(--ease-elegant), transform 350ms var(--ease-elegant)",
                }}
              >
                {t.badge && (
                  <span
                    className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "var(--color-muted-gold)",
                      color: "var(--color-cream)",
                    }}
                  >
                    {t.badge}
                  </span>
                )}

                <p
                  className="font-serif text-lg mb-1"
                  style={{ color: "var(--color-espresso)" }}
                >
                  {t.name}
                </p>
                <p
                  className="text-2xl mb-4"
                  style={{
                    color:
                      t.id === "free"
                        ? "var(--color-stone)"
                        : "var(--color-muted-gold)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                  }}
                >
                  {t.price}
                </p>

                <ul className="space-y-1.5">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="text-xs flex items-start gap-2"
                      style={{ color: "var(--color-charcoal)" }}
                    >
                      <span style={{ color: "var(--color-muted-gold)", flexShrink: 0 }}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.button>
            );
          })}
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-center mb-6"
            style={{ color: "var(--color-error, #C0392B)" }}
          >
            {error}
          </motion.p>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex justify-center"
        >
          {tier === "free" ? (
            <button onClick={handleContinue} className="btn-secondary text-base px-10 py-4">
              Continue with free
            </button>
          ) : (
            <button
              onClick={handleContinue}
              disabled={loading}
              className="btn-gold text-base px-10 py-4"
              style={{ opacity: loading ? 0.75 : 1 }}
            >
              {loading ? "Opening checkout..." : "Continue to checkout"}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
