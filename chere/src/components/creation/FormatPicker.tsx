"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useCreationStore } from "@/stores/creation-store";
import { updateCreation } from "@/lib/supabase/creations";
import type { OutputFormat } from "@/lib/supabase/types";

// ─── Format Definitions ───────────────────────────────────

const INTERACTIVE_FORMATS: OutputFormat[] = ["recipe_book"];

interface SubTemplate {
  value: OutputFormat;
  label: string;
  description: string;
  comingSoon?: boolean;
  preview: React.ReactNode;
}

interface FormatDef {
  value: OutputFormat | "interactive_website";
  label: string;
  description: string;
  giftOnly?: boolean;
  hidden?: boolean;
  comingSoon?: boolean;
  premium?: boolean;
  preview: React.ReactNode;
  subTemplates?: SubTemplate[];
}

function ScrollPreview() {
  return (
    <div className="h-full w-full p-4" style={{ background: "linear-gradient(to bottom, var(--color-linen), var(--color-cream))" }}>
      <div className="h-full w-full rounded-lg px-3 py-3" style={{ backgroundColor: "rgba(255,255,255,0.35)" }}>
        <div className="h-2 w-full rounded-full mb-3" style={{ backgroundColor: "rgba(42,36,32,0.22)" }} />
        <div className="h-8 w-16 rounded-md mb-3" style={{ backgroundColor: "rgba(196,169,125,0.45)" }} />
        <div className="h-2 w-4/5 rounded-full" style={{ backgroundColor: "rgba(42,36,32,0.22)" }} />
      </div>
    </div>
  );
}

function MemoryPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute left-8 right-8 top-8 bottom-6 rounded-xl"
        style={{ backgroundColor: "#D8C6AC", transform: "rotate(-6deg)" }}
      />
      <div
        className="absolute left-10 right-6 top-6 bottom-4 rounded-xl"
        style={{ backgroundColor: "var(--color-parchment)", transform: "rotate(-2.5deg)" }}
      />
      <div
        className="absolute left-12 right-4 top-4 bottom-2 rounded-xl"
        style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-subtle)" }}
      />
    </div>
  );
}

function LetterPreview() {
  return (
    <div className="h-full w-full flex items-center justify-center px-4">
      <div className="relative w-full max-w-[190px] h-[110px] rounded-md" style={{ backgroundColor: "var(--color-cream)", border: "1px solid #E0D0BC" }}>
        <div className="absolute inset-x-0 top-0 h-0 border-l-[95px] border-r-[95px] border-t-[56px] border-l-transparent border-r-transparent" style={{ borderTopColor: "#E4D4C2" }} />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 w-4 h-4 rounded-full" style={{ backgroundColor: "var(--color-muted-gold)" }} />
      </div>
    </div>
  );
}

function GiftPreview() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="relative w-[110px] h-[92px] rounded-md" style={{ border: "2px solid var(--color-muted-gold)", backgroundColor: "var(--color-cream)" }}>
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2" style={{ borderColor: "var(--color-muted-gold)" }} />
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[2px] h-4" style={{ backgroundColor: "var(--color-muted-gold)" }} />
        <div className="absolute -top-4 left-1/2 -translate-x-[10px] w-4 h-3 rounded-t-full border-t-2 border-l-2" style={{ borderColor: "var(--color-muted-gold)" }} />
        <div className="absolute -top-4 left-1/2 -translate-x-[2px] w-4 h-3 rounded-t-full border-t-2 border-r-2" style={{ borderColor: "var(--color-muted-gold)" }} />
      </div>
    </div>
  );
}

function ComingSoonPreview() {
  return (
    <div
      className="h-full w-full"
      style={{ backgroundColor: "var(--color-parchment)" }}
    />
  );
}

function CompanionPreview() {
  return (
    <div className="h-full w-full relative overflow-hidden" style={{ backgroundColor: "#F2EDE6" }}>
      {/* Mini scene */}
      <div style={{ position: "absolute", left: "10%", top: "15%", width: "30%", height: "22%", backgroundColor: "#C8DCE8", borderRadius: "1px", border: "3px solid #E0D4C8" }} />
      <div style={{ position: "absolute", left: 0, top: "60%", right: 0, bottom: 0, background: "linear-gradient(to bottom, #C49A70, #A88050)" }} />
      {/* Hotspot dots */}
      {[{ x: "30%", y: "66%" }, { x: "55%", y: "64%" }, { x: "75%", y: "40%" }].map((pos, i) => (
        <div key={i} style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#C4A97D", boxShadow: "0 0 8px rgba(196,169,125,0.6)" }} />
          <div style={{ position: "absolute", inset: "-4px", borderRadius: "50%", border: "1.5px solid #C4A97D", opacity: 0.4 }} />
        </div>
      ))}
    </div>
  );
}

function StorybookPreview() {
  return (
    <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: "var(--color-linen)" }}>
      <div
        style={{
          position: "relative",
          width: "90px",
          height: "110px",
        }}
      >
        {/* Page stack depth */}
        <div style={{ position: "absolute", inset: 0, right: "-4px", backgroundColor: "#D4B896", borderRadius: "0 6px 6px 0" }} />
        <div style={{ position: "absolute", inset: 0, right: "-2px", backgroundColor: "#DCC4A8", borderRadius: "0 6px 6px 0" }} />
        {/* Page */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FAF7F4",
            borderRadius: "0 6px 6px 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: "0 auto 0 0", width: "4px", background: "linear-gradient(to right, #D4B89640, transparent)" }} />
          <div className="px-2.5 pt-3 pb-2 flex flex-col h-full justify-center gap-1.5">
            <div style={{ height: "2px", backgroundColor: "var(--color-muted-gold)", width: "20px", marginLeft: "auto", marginRight: "auto" }} />
            <div style={{ height: "36px", backgroundColor: "var(--color-parchment)", borderRadius: "2px" }} />
            <div style={{ height: "2px", backgroundColor: "rgba(42,36,32,0.12)", borderRadius: "1px" }} />
            <div style={{ height: "2px", backgroundColor: "rgba(42,36,32,0.12)", borderRadius: "1px", width: "70%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipeBookPreview() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-2 px-4" style={{ backgroundColor: "#FAF6EF" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "100%",
            height: "22px",
            backgroundColor: i === 0 ? "var(--color-cream)" : "var(--color-parchment)",
            borderRadius: "4px",
            border: "1px solid rgba(196,169,125,0.3)",
            opacity: 1 - i * 0.2,
            display: "flex",
            alignItems: "center",
            paddingLeft: "8px",
            gap: "6px",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-muted-gold)", opacity: 0.7 }} />
          <div style={{ height: "4px", backgroundColor: "rgba(42,36,32,0.2)", borderRadius: "2px", flex: 1, marginRight: "8px" }} />
        </div>
      ))}
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--color-muted-gold)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px" }}>
        <span style={{ color: "white", fontSize: "16px", lineHeight: 1, marginTop: "-1px" }}>+</span>
      </div>
    </div>
  );
}

function InteractiveWebsitePreview() {
  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: "#F5F0EB" }}>
      {/* Browser chrome */}
      <div style={{ height: "20px", backgroundColor: "#E8E0D5", display: "flex", alignItems: "center", paddingLeft: "8px", gap: "4px", borderBottom: "1px solid rgba(196,169,125,0.2)" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: i === 0 ? "#C4A97D" : "rgba(196,169,125,0.4)" }} />
        ))}
      </div>
      {/* Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px" }}>
        {/* Clickable card */}
        <div style={{ width: "80%", height: "28px", backgroundColor: "var(--color-cream)", borderRadius: "6px", border: "1px solid rgba(196,169,125,0.4)", display: "flex", alignItems: "center", paddingLeft: "8px", gap: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-muted-gold)" }} />
          <div style={{ height: "4px", backgroundColor: "rgba(42,36,32,0.18)", borderRadius: "2px", flex: 1, marginRight: "8px" }} />
        </div>
        {/* Cursor dot */}
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-muted-gold)", boxShadow: "0 0 8px rgba(196,169,125,0.5)", alignSelf: "flex-end", marginRight: "20%" }} />
        <div style={{ width: "60%", height: "3px", backgroundColor: "rgba(42,36,32,0.1)", borderRadius: "2px" }} />
        <div style={{ width: "45%", height: "3px", backgroundColor: "rgba(42,36,32,0.08)", borderRadius: "2px" }} />
      </div>
    </div>
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
    description: "A page-turning picture book of your memories together. Photos or pencil sketches.",
    premium: true,
    preview: <StorybookPreview />,
  },
  {
    value: "companion",
    label: "Interactive Scene",
    description: "A hand-drawn scene to explore. Tap objects to uncover memories, one at a time.",
    hidden: true,
    premium: true,
    preview: <CompanionPreview />,
  },
  {
    value: "interactive_website",
    label: "Interactive Website",
    description: "A living gift that grows over time. Choose a template — recipe book, journal, and more coming.",
    premium: true,
    preview: <InteractiveWebsitePreview />,
    subTemplates: [
      {
        value: "recipe_book",
        label: "Recipe Book",
        description: "A shared cookbook you both write together. Add family recipes one by one, forever.",
        preview: <RecipeBookPreview />,
      },
    ],
  },
];

// ─── Template Swatches ────────────────────────────────────

const TEMPLATES: { id: string; label: string; gradient: string; border: string }[] = [
  { id: "warm-linen", label: "Warm Linen", gradient: "linear-gradient(135deg, #F5F0EB, #FAF7F2)", border: "#C4A97D" },
  { id: "soft-sage", label: "Soft Sage", gradient: "linear-gradient(135deg, #F2F5F0, #F8FAF6)", border: "#A8B5A0" },
  { id: "midnight-gold", label: "Midnight", gradient: "linear-gradient(135deg, #1A1714, #242018)", border: "#C4A97D" },
];

// ─── Component ────────────────────────────────────────────

export default function FormatPicker() {
  const {
    creationType,
    outputFormat,
    setOutputFormat,
    templateId,
    setTemplateId,
    illustrationMode,
    setIllustrationMode,
    recipientName,
    setStep,
    creationId,
  } = useCreationStore();

  const searchParams = useSearchParams();
  const showHidden = searchParams.get("showHidden") === "1";

  // Track which category card is expanded (for multi-template types)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    outputFormat && INTERACTIVE_FORMATS.includes(outputFormat) ? "interactive_website" : null
  );

  const visibleFormats = ALL_FORMATS.filter(
    (f) => !(f.giftOnly && creationType === "tribute") && (!f.hidden || showHidden)
  );

  const canContinue = Boolean(outputFormat && templateId);

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
          How should {recipientName ? `${recipientName}'s` : "their"} gift look and feel?
        </motion.p>

        {/* Format grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12"
        >
          {visibleFormats.map((format, i) => {
            const isCategory = !!format.subTemplates;
            const selected = isCategory
              ? INTERACTIVE_FORMATS.includes(outputFormat as OutputFormat)
              : outputFormat === format.value;
            const disabled = !!format.comingSoon;

            return (
              <motion.button
                key={format.value}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: disabled ? 0.45 : 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                onClick={() => {
                  if (disabled) return;
                  if (isCategory) {
                    setExpandedCategory(expandedCategory === format.value ? null : format.value as string);
                    // If only one sub-template, auto-select it
                    if (format.subTemplates?.length === 1) {
                      setOutputFormat(format.subTemplates[0].value);
                    }
                  } else {
                    setExpandedCategory(null);
                    setOutputFormat(format.value as OutputFormat);
                  }
                }}
                disabled={disabled}
                className="text-left rounded-xl relative overflow-hidden"
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
                <div className="h-40 border-b" style={{ borderColor: "var(--color-parchment)" }}>{format.preview}</div>

                {/* Badges */}
                {format.comingSoon && (
                  <span
                    className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--color-parchment)", color: "var(--color-warm-gray)" }}
                  >
                    Coming soon
                  </span>
                )}
                {format.premium && !format.comingSoon && (
                  <span
                    className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--color-muted-gold)", color: "white" }}
                  >
                    Premium
                  </span>
                )}
                <div className="p-4">
                  <h3
                    className="font-serif mb-1"
                    style={{ fontSize: "1rem", color: "var(--color-espresso)" }}
                  >
                    {format.label}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-stone)" }}>
                    {format.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Sub-template picker (shown when a category with multiple templates is expanded) */}
        {expandedCategory && (() => {
          const categoryDef = ALL_FORMATS.find((f) => f.value === expandedCategory);
          if (!categoryDef?.subTemplates) return null;
          return (
            <motion.div
              key="sub-templates"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-10"
            >
              <p className="text-sm text-stone text-center mb-5 font-serif">Choose a template</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categoryDef.subTemplates.map((tmpl) => {
                  const active = outputFormat === tmpl.value;
                  const isDisabled = !!tmpl.comingSoon;
                  return (
                    <button
                      key={tmpl.value}
                      disabled={isDisabled}
                      onClick={() => { if (!isDisabled) setOutputFormat(tmpl.value); }}
                      className="text-left rounded-xl relative overflow-hidden"
                      style={{
                        backgroundColor: "var(--color-cream)",
                        border: "2px solid",
                        borderColor: active ? "var(--color-muted-gold)" : "rgba(196,169,125,0.25)",
                        boxShadow: active ? "var(--shadow-elevated)" : "var(--shadow-card)",
                        transform: active ? "translateY(-3px)" : "none",
                        transition: "border-color 350ms var(--ease-elegant), box-shadow 350ms var(--ease-elegant), transform 350ms var(--ease-elegant)",
                        cursor: isDisabled ? "default" : "pointer",
                        opacity: isDisabled ? 0.5 : 1,
                      }}
                    >
                      <div className="h-32 border-b" style={{ borderColor: "var(--color-parchment)" }}>{tmpl.preview}</div>
                      {tmpl.comingSoon && (
                        <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-parchment)", color: "var(--color-warm-gray)" }}>
                          Coming soon
                        </span>
                      )}
                      <div className="p-3">
                        <h4 className="font-serif mb-1" style={{ fontSize: "0.9rem", color: "var(--color-espresso)" }}>{tmpl.label}</h4>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--color-stone)" }}>{tmpl.description}</p>
                      </div>
                    </button>
                  );
                })}
                {/* Placeholder for upcoming templates */}
                <div
                  className="rounded-xl flex flex-col items-center justify-center gap-2 p-4"
                  style={{ backgroundColor: "var(--color-parchment)", border: "2px dashed rgba(196,169,125,0.3)", minHeight: "160px", opacity: 0.6 }}
                >
                  <span style={{ fontSize: "1.25rem" }}>✦</span>
                  <p className="text-xs text-center font-serif" style={{ color: "var(--color-stone)" }}>More templates coming soon</p>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Template swatches */}
        {outputFormat && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm text-stone text-center mb-5 font-serif">Choose a look</p>
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
                        width: "48px",
                        height: "48px",
                        background: tmpl.gradient,
                        border: "2px solid",
                        borderColor: active ? tmpl.border : "transparent",
                        boxShadow: active ? "var(--shadow-subtle)" : "var(--shadow-card)",
                        opacity: active ? 1 : 0.92,
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

        {/* Illustration mode selector — Storybook only */}
        {outputFormat === "storybook" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm text-stone text-center mb-5 font-serif">Illustration style</p>
            <div className="flex justify-center gap-8">
              {([
                { value: "photos" as const, icon: "📷", label: "Photos only", note: false },
                { value: "mixed" as const, icon: "📷✏️", label: "Photos & Sketches", note: true },
                { value: "sketches" as const, icon: "✏️", label: "Sketches only", note: true },
              ] as const).map((opt) => {
                const active = illustrationMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setIllustrationMode(opt.value)}
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <div
                      className="rounded-xl transition-all duration-300 flex items-center justify-center"
                      style={{
                        width: "72px",
                        height: "52px",
                        backgroundColor: active ? "var(--color-cream)" : "transparent",
                        border: "2px solid",
                        borderColor: active ? "var(--color-muted-gold)" : "var(--color-parchment)",
                        fontSize: "1.125rem",
                      }}
                    >
                      {opt.icon}
                    </div>
                    <span
                      className="text-xs text-center transition-colors duration-300"
                      style={{ color: active ? "var(--color-espresso)" : "var(--color-stone)", maxWidth: "72px" }}
                    >
                      {opt.label}
                    </span>
                    {opt.note && active && (
                      <span className="text-xs text-center" style={{ color: "var(--color-warm-gray)", maxWidth: "120px", fontSize: "0.625rem" }}>
                        AI sketches coming soon — using styled photos for now
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Continue */}
        <div className="flex justify-center">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => {
              if (!canContinue) return;
              if (creationId && outputFormat) {
                updateCreation(creationId, {
                  output_format: outputFormat,
                  template_id: templateId,
                }).catch(() => {});
              }
              if (outputFormat === "recipe_book") {
                setStep("cover");
              } else {
                setStep("customize");
              }
            }}
            disabled={!canContinue}
            aria-disabled={!canContinue}
            className="btn-gold text-base px-10 py-4"
            style={{ opacity: canContinue ? 1 : 0.55, cursor: canContinue ? "pointer" : "not-allowed" }}
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  );
}
