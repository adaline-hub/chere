"use client";

import { motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { OutputFormat } from "@/lib/supabase/types";

// ─── Format Definitions ───────────────────────────────────

interface FormatDef {
  value: OutputFormat;
  label: string;
  description: string;
  giftOnly?: boolean;
  comingSoon?: boolean;
  preview: React.ReactNode;
}

function ScrollPreview() {
  return (
    <div
      className="rounded-md h-16 w-full"
      style={{ background: "linear-gradient(to bottom, var(--color-linen), var(--color-parchment))" }}
    />
  );
}

function MemoryPreview() {
  return (
    <div className="relative h-16 w-full overflow-hidden rounded-md">
      <div
        className="absolute inset-x-4 top-3 bottom-0 rounded-md"
        style={{ backgroundColor: "var(--color-parchment)", transform: "rotate(-2.5deg)" }}
      />
      <div
        className="absolute inset-x-2 top-1.5 bottom-0 rounded-md"
        style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-subtle)" }}
      />
    </div>
  );
}

function LetterPreview() {
  return (
    <div
      className="h-16 w-full rounded-md flex items-center justify-center text-2xl"
      style={{
        backgroundColor: "var(--color-cream)",
        border: "1px solid var(--color-parchment)",
        color: "var(--color-warm-gray)",
      }}
    >
      ✉
    </div>
  );
}

function GiftPreview() {
  return (
    <div
      className="h-16 w-full rounded-md flex items-center justify-center text-2xl"
      style={{
        backgroundColor: "var(--color-cream)",
        border: "1px solid var(--color-parchment)",
        color: "var(--color-muted-gold)",
      }}
    >
      ◇
    </div>
  );
}

function ComingSoonPreview() {
  return (
    <div
      className="h-16 w-full rounded-md"
      style={{ backgroundColor: "var(--color-parchment)" }}
    />
  );
}

const ALL_FORMATS: FormatDef[] = [
  {
    value: "scrollytelling",
    label: "Scrolling Story",
    description:
      "A cinematic scroll through your memories, with photos that fill the screen and text that reveals as you read.",
    preview: <ScrollPreview />,
  },
  {
    value: "memory_wrapped",
    label: "Memory Wrapped",
    description:
      "Swipeable cards — like a story, but yours. Stats, quotes, photos, one moment at a time.",
    preview: <MemoryPreview />,
  },
  {
    value: "love_letter",
    label: "Love Letter",
    description: "An envelope that opens to reveal a handwritten letter. Intimate. Classic.",
    preview: <LetterPreview />,
  },
  {
    value: "gift_reveal",
    label: "Gift Reveal",
    description: "A beautifully wrapped digital box that opens to show your surprise.",
    giftOnly: true,
    preview: <GiftPreview />,
  },
  {
    value: "storybook",
    label: "Digital Storybook",
    description: "A page-turning picture book of your memories together.",
    comingSoon: true,
    preview: <ComingSoonPreview />,
  },
  {
    value: "companion",
    label: "Memory Companion",
    description: "An animated scene they can explore and interact with.",
    comingSoon: true,
    preview: <ComingSoonPreview />,
  },
];

// ─── Template Swatches ────────────────────────────────────

const TEMPLATES: { id: string; label: string; bg: string; dot: string }[] = [
  { id: "warm-linen", label: "Warm Linen", bg: "#F5F0EB", dot: "#C4A97D" },
  { id: "soft-sage", label: "Soft Sage", bg: "#F2F5F0", dot: "#A8B5A0" },
  { id: "midnight-gold", label: "Midnight Gold", bg: "#1A1714", dot: "#C4A97D" },
];

// ─── Component ────────────────────────────────────────────

export default function FormatPicker() {
  const { creationType, outputFormat, setOutputFormat, templateId, setTemplateId, recipientName, setStep } =
    useCreationStore();

  const visibleFormats = ALL_FORMATS.filter(
    (f) => !(f.giftOnly && creationType === "tribute")
  );

  const canContinue = outputFormat !== null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl text-espresso text-center mb-3"
        >
          Choose your format
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-12 leading-relaxed"
        >
          How should {recipientName || "their"}&apos;s gift look and feel?
        </motion.p>

        {/* Format grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12"
        >
          {visibleFormats.map((format, i) => {
            const selected = outputFormat === format.value;
            const disabled = !!format.comingSoon;

            return (
              <motion.button
                key={format.value}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: disabled ? 0.45 : 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                onClick={() => { if (!disabled) setOutputFormat(format.value); }}
                disabled={disabled}
                className="text-left p-4 rounded-xl relative"
                style={{
                  backgroundColor: "var(--color-cream)",
                  border: "2px solid",
                  borderColor: selected ? "var(--color-muted-gold)" : "transparent",
                  boxShadow: selected ? "var(--shadow-elevated)" : "var(--shadow-card)",
                  transform: selected ? "translateY(-3px)" : "none",
                  transition: "border-color 350ms var(--ease-elegant), box-shadow 350ms var(--ease-elegant), transform 350ms var(--ease-elegant)",
                  cursor: disabled ? "default" : "pointer",
                }}
              >
                {/* Preview area */}
                <div className="mb-4">{format.preview}</div>

                {/* Coming soon badge */}
                {format.comingSoon && (
                  <span
                    className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "var(--color-parchment)",
                      color: "var(--color-warm-gray)",
                    }}
                  >
                    Coming soon
                  </span>
                )}

                <h3
                  className="font-serif mb-1"
                  style={{ fontSize: "1rem", color: "var(--color-espresso)" }}
                >
                  {format.label}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-stone)" }}>
                  {format.description}
                </p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Template swatches */}
        {outputFormat && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm text-stone text-center mb-5">Choose a look</p>
            <div className="flex justify-center gap-6">
              {TEMPLATES.map((tmpl) => {
                const active = templateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setTemplateId(tmpl.id)}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: tmpl.bg,
                        border: "3px solid",
                        borderColor: active ? "var(--color-muted-gold)" : "transparent",
                        boxShadow: active ? "0 0 0 1px var(--color-muted-gold)" : "var(--shadow-card)",
                      }}
                    />
                    <span
                      className="text-xs transition-colors duration-300"
                      style={{ color: active ? "var(--color-espresso)" : "var(--color-stone)" }}
                    >
                      {tmpl.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Continue */}
        <div className="flex justify-center">
          {canContinue && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setStep("customize")}
              className="btn-gold text-base px-10 py-4"
            >
              Continue
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
