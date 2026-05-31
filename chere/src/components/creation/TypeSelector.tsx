"use client";

import { motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import StepHeader from "@/components/creation/StepHeader";
import type { CreationType } from "@/lib/supabase/types";

const TYPES: {
  value: CreationType;
  icon: string;
  headline: string;
  description: string;
}[] = [
  {
    value: "tribute",
    icon: "✦",
    headline: "Memory Tribute",
    description:
      "Celebrate someone you love with their favorite memories, photos, and a letter written from your heart.",
  },
  {
    value: "gift_reveal",
    icon: "◇",
    headline: "Gift Reveal",
    description:
      "Wrap a real gift — a trip, tickets, a surprise — in a beautiful digital reveal experience.",
  },
  {
    value: "combined",
    icon: "∞",
    headline: "Both",
    description:
      "Start with memories, end with a surprise. The full Chère experience.",
  },
];

export default function TypeSelector() {
  const { creationType, setCreationType, setStep } = useCreationStore();

  function select(value: CreationType) {
    setCreationType(value);
    setTimeout(() => setStep("relationship"), 350);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <StepHeader
        step="type"
        title="What kind of gift would you like to make?"
        className="mb-16"
      />

      <div className="grid md:grid-cols-3 gap-5 w-full max-w-3xl">
        {TYPES.map((type, i) => {
          const selected = creationType === type.value;
          return (
            <motion.button
              key={type.value}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              onClick={() => select(type.value)}
              className="text-left p-8 rounded-xl cursor-pointer w-full border-2"
              style={{
                backgroundColor: "var(--color-cream)",
                borderColor: selected ? "var(--color-muted-gold)" : "transparent",
                boxShadow: selected ? "var(--shadow-elevated)" : "var(--shadow-card)",
                transform: selected ? "translateY(-4px)" : "translateY(0)",
                transition:
                  "border-color 350ms var(--ease-elegant), box-shadow 350ms var(--ease-elegant), transform 350ms var(--ease-elegant)",
              }}
            >
              <span
                className="block mb-5 text-xl"
                style={{ color: "var(--color-muted-gold)" }}
              >
                {type.icon}
              </span>
              <h2
                className="font-serif mb-2 text-espresso"
                style={{ fontSize: "1.25rem" }}
              >
                {type.headline}
              </h2>
              <p className="text-sm leading-relaxed text-stone">
                {type.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
