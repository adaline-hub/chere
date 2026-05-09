"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { GiftType } from "@/lib/supabase/types";

// ─── Field Definitions ────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  isTextarea?: boolean;
}

const GIFT_FIELDS: Record<GiftType, FieldDef[]> = {
  trip: [
    { key: "destination", label: "Destination", placeholder: "Paris, a cabin in Vermont, Tokyo..." },
    { key: "dates", label: "Dates", placeholder: "June 15–22" },
    { key: "details", label: "Any details they should know", placeholder: "We're staying at that hotel you showed me last year...", isTextarea: true },
  ],
  experience: [
    { key: "what", label: "What is it?", placeholder: "Hamilton tickets, a cooking class, skydiving..." },
    { key: "when", label: "When", placeholder: "Saturday night, next month, your birthday weekend..." },
    { key: "details", label: "Details", placeholder: "Front row seats. I'm not kidding.", isTextarea: true },
  ],
  physical: [
    { key: "what", label: "What is it?", placeholder: "The necklace you kept looking at, a custom portrait of us..." },
    { key: "details", label: "Details", placeholder: "It's already wrapped and hidden in the closet...", isTextarea: true },
  ],
  shopping: [
    { key: "where", label: "Where?", placeholder: "Sephora, Target, that bookstore downtown..." },
    { key: "budget", label: "Budget or description", placeholder: "Pick anything you want. Seriously — anything.", isTextarea: true },
  ],
  mystery: [
    { key: "hint", label: "Just a hint", placeholder: "You'll find out soon enough... but you might want to clear your Saturday.", isTextarea: true },
  ],
};

const PRIMARY_FIELD: Record<GiftType, string> = {
  trip: "destination",
  experience: "what",
  physical: "what",
  shopping: "where",
  mystery: "hint",
};

const GIFT_TYPES: { value: GiftType; label: string }[] = [
  { value: "trip", label: "A Trip" },
  { value: "experience", label: "An Experience" },
  { value: "physical", label: "Something Physical" },
  { value: "shopping", label: "A Shopping Surprise" },
  { value: "mystery", label: "A Mystery" },
];

const REVEAL_STYLES: { value: "card" | "envelope" | "ticket" | "box"; label: string; symbol: string }[] = [
  { value: "card", label: "Card", symbol: "◻" },
  { value: "envelope", label: "Envelope", symbol: "✉" },
  { value: "ticket", label: "Ticket", symbol: "▶" },
  { value: "box", label: "Box", symbol: "◇" },
];

// ─── Component ────────────────────────────────────────────

export default function GiftDescriber() {
  const { addGiftMoment, setStep } = useCreationStore();

  const [giftType, setGiftType] = useState<GiftType | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [revealStyle, setRevealStyle] = useState<"card" | "envelope" | "ticket" | "box">("card");

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const primaryKey = giftType ? PRIMARY_FIELD[giftType] : null;
  const canContinue =
    giftType !== null && primaryKey !== null && (fields[primaryKey] ?? "").trim().length > 0;

  function handleContinue() {
    if (!canContinue || !giftType || !primaryKey) return;
    addGiftMoment({
      id: crypto.randomUUID(),
      giftType,
      description: fields[primaryKey] ?? "",
      details: { ...fields },
      message,
      revealStyle,
      position: "end",
    });
    setStep("photos");
  }

  const currentFields = giftType ? GIFT_FIELDS[giftType] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl text-espresso text-center mb-3"
        >
          What&apos;s the gift?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-10 leading-relaxed"
        >
          Describe it in your own words — we&apos;ll turn it into something beautiful.
        </motion.p>

        {/* Gift type pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {GIFT_TYPES.map((t) => {
            const active = giftType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => { setGiftType(t.value); setFields({}); }}
                className="py-2 px-4 rounded-full text-sm transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: active ? "var(--color-espresso)" : "var(--color-cream)",
                  color: active ? "var(--color-cream)" : "var(--color-charcoal)",
                  border: "1px solid",
                  borderColor: active ? "var(--color-espresso)" : "var(--color-parchment)",
                  boxShadow: active ? "var(--shadow-card)" : "var(--shadow-subtle)",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </motion.div>

        {/* Context-specific fields */}
        <AnimatePresence mode="wait">
          {currentFields && (
            <motion.div
              key={giftType}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-5 mb-8"
            >
              {currentFields.map((field) => (
                <div key={field.key}>
                  <label
                    className="block text-xs mb-1.5"
                    style={{ color: "var(--color-stone)" }}
                  >
                    {field.label}
                  </label>
                  {field.isTextarea ? (
                    <textarea
                      value={fields[field.key] ?? ""}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="textarea"
                      style={{ minHeight: "88px" }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={fields[field.key] ?? ""}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="input"
                    />
                  )}
                </div>
              ))}

              {/* Personal message */}
              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "var(--color-stone)" }}
                >
                  Add a personal message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A note to go with the gift..."
                  className="textarea"
                  style={{ minHeight: "80px" }}
                />
              </div>

              {/* Reveal style */}
              <div>
                <p
                  className="text-xs mb-3"
                  style={{ color: "var(--color-stone)" }}
                >
                  How should we reveal it?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {REVEAL_STYLES.map((style) => {
                    const active = revealStyle === style.value;
                    return (
                      <button
                        key={style.value}
                        onClick={() => setRevealStyle(style.value)}
                        className="py-4 px-2 rounded-lg flex flex-col items-center gap-2 text-xs cursor-pointer transition-all duration-300"
                        style={{
                          backgroundColor: "var(--color-cream)",
                          border: "2px solid",
                          borderColor: active ? "var(--color-muted-gold)" : "transparent",
                          boxShadow: active ? "var(--shadow-elevated)" : "var(--shadow-card)",
                          transform: active ? "translateY(-2px)" : "none",
                          transition: "border-color 300ms var(--ease-elegant), box-shadow 300ms var(--ease-elegant), transform 300ms var(--ease-elegant)",
                          color: "var(--color-charcoal)",
                        }}
                      >
                        <span
                          className="text-xl"
                          style={{ color: active ? "var(--color-muted-gold)" : "var(--color-warm-gray)" }}
                        >
                          {style.symbol}
                        </span>
                        {style.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue */}
        <div className="flex justify-center">
          <AnimatePresence>
            {canContinue && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={handleContinue}
                className="btn-gold text-base px-10 py-4"
              >
                Continue
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
