"use client";

import { motion, MotionConfig } from "framer-motion";
import { useState } from "react";
import { useCreationStore } from "@/stores/creation-store";
import ScrollytellingRenderer from "@/components/tribute/ScrollytellingRenderer";
import MemoryWrappedRenderer from "@/components/tribute/MemoryWrappedRenderer";
import LoveLetterRenderer from "@/components/tribute/LoveLetterRenderer";
import StorybookRenderer from "@/components/tribute/StorybookRenderer";
import CompanionRenderer from "@/components/tribute/CompanionRenderer";
import type { TributeCreation } from "@/lib/mock/tribute-data";

const TEMPLATE_STYLES: Record<string, { bg: string; accent: string }> = {
  "warm-linen": { bg: "#F5F0EB", accent: "#C4A97D" },
  "soft-sage": { bg: "#F2F5F0", accent: "#A8B5A0" },
  "midnight-gold": { bg: "#1A1714", accent: "#C4A97D" },
};

export default function PreviewStep() {
  const {
    recipientName,
    editedText,
    generatedText,
    dedicationMessage,
    photos,
    giftMoments,
    templateId,
    outputFormat,
    illustrationMode,
    creationId,
    creationType,
    relationshipType,
    shareToken,
    setStep,
  } = useCreationStore();

  const displayText = editedText ?? generatedText;
  const tmpl = TEMPLATE_STYLES[templateId ?? "warm-linen"] ?? TEMPLATE_STYLES["warm-linen"];
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");

  const previewCreation: TributeCreation = {
    id: creationId ?? "preview",
    recipientName: recipientName ?? "",
    creatorName: "",
    type: (creationType ?? "tribute") as TributeCreation["type"],
    relationshipType: relationshipType ?? "",
    outputFormat: (outputFormat ?? "scrollytelling") as TributeCreation["outputFormat"],
    templateId: (templateId ?? "warm-linen") as TributeCreation["templateId"],
    tier: "standard",
    generatedText: displayText ?? "",
    dedicationMessage: dedicationMessage ?? "",
    photos: photos.map((p) => ({ id: p.id, url: p.preview, caption: p.caption ?? "" })),
    giftMoment:
      giftMoments.length > 0
        ? {
            description: giftMoments[0].description,
            message: giftMoments[0].message ?? "",
            revealStyle: "standard",
          }
        : null,
    musicTrackId: null,
  };

  function renderFormat(preview = false) {
    switch (outputFormat) {
      case "memory_wrapped":
        return <MemoryWrappedRenderer creation={previewCreation} preview={preview} />;
      case "love_letter":
        return <LoveLetterRenderer creation={previewCreation} preview={preview} />;
      case "storybook":
        return <StorybookRenderer creation={previewCreation} illustrationMode={illustrationMode} />;
      case "companion":
        return <CompanionRenderer creation={previewCreation} preview={preview} />;
      default:
        return <ScrollytellingRenderer creation={previewCreation} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl text-espresso text-center mb-3"
        >
          Here&apos;s their gift
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-10 leading-relaxed"
        >
          This is what {recipientName || "they"} will see when they open it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="mb-5 flex justify-center"
        >
          <div
            className="inline-flex items-center rounded-full p-1 gap-1"
            style={{ border: "1px solid var(--color-parchment)" }}
          >
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className="px-4 py-1.5 rounded-full text-sm transition-all duration-200"
              style={
                previewMode === "mobile"
                  ? { backgroundColor: "var(--color-espresso)", color: "var(--color-cream)" }
                  : {
                      backgroundColor: "transparent",
                      border: "1px solid var(--color-parchment)",
                      color: "var(--color-stone)",
                    }
              }
            >
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className="px-4 py-1.5 rounded-full text-sm transition-all duration-200"
              style={
                previewMode === "desktop"
                  ? { backgroundColor: "var(--color-espresso)", color: "var(--color-cream)" }
                  : {
                      backgroundColor: "transparent",
                      border: "1px solid var(--color-parchment)",
                      color: "var(--color-stone)",
                    }
              }
            >
              Desktop
            </button>
          </div>
        </motion.div>

        {/* Preview frame */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto mb-4"
          style={
            previewMode === "mobile"
              ? { width: "300px" }
              : { width: "720px", maxWidth: "90vw" }
          }
        >
          {previewMode === "mobile" ? (
            <div
              className="rounded-[2.5rem] overflow-hidden"
              style={{
                padding: "3px",
                background: "linear-gradient(135deg, #D4B896 0%, #C4A97D 50%, #A08060 100%)",
                boxShadow:
                  "0 32px 64px rgba(42,36,32,0.25), 0 8px 16px rgba(42,36,32,0.12)",
              }}
            >
              <div
                className="rounded-[2.25rem] overflow-hidden"
                style={{ backgroundColor: tmpl.bg }}
              >
                {/* Status bar stub */}
                <div
                  className="flex items-center justify-between px-6 pt-4 pb-2"
                  style={{ backgroundColor: tmpl.bg }}
                >
                  <span style={{ fontSize: "10px", color: tmpl.accent, fontVariantNumeric: "tabular-nums" }}>
                    9:41
                  </span>
                  <div
                    className="rounded-full"
                    style={{ width: "80px", height: "18px", backgroundColor: `${tmpl.accent}15` }}
                  />
                  <div className="flex gap-0.5 items-end">
                    {[3, 5, 7].map((h, i) => (
                      <div
                        key={i}
                        className="rounded-sm"
                        style={{ width: "3px", height: `${h}px`, backgroundColor: tmpl.accent }}
                      />
                    ))}
                  </div>
                </div>

                {/* Format-specific renderer — scaled to fit phone frame */}
                <div style={{ overflow: "hidden", height: "520px", position: "relative", backgroundColor: "var(--color-cream)" }}>
                  <MotionConfig reducedMotion="always">
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "154%",
                        transform: "scale(0.65)",
                        transformOrigin: "top left",
                      }}
                    >
                      {renderFormat(true)}
                    </div>
                  </MotionConfig>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid var(--color-parchment)",
                backgroundColor: tmpl.bg,
                boxShadow:
                  "0 24px 52px rgba(42,36,32,0.18), 0 6px 14px rgba(42,36,32,0.10)",
              }}
            >
              <div
                className="h-7 px-4 flex items-center justify-center relative"
                style={{ backgroundColor: "var(--color-parchment)" }}
              >
                <div className="absolute left-4 flex gap-2">
                  <span
                    className="rounded-full"
                    style={{ width: "12px", height: "12px", backgroundColor: "var(--color-error)" }}
                  />
                  <span
                    className="rounded-full"
                    style={{ width: "12px", height: "12px", backgroundColor: "var(--color-muted-gold)" }}
                  />
                  <span
                    className="rounded-full"
                    style={{ width: "12px", height: "12px", backgroundColor: "var(--color-sage-green)" }}
                  />
                </div>
                <span style={{ fontSize: "11px", color: "var(--color-warm-gray)" }}>
                  {shareToken ? `chere.app/g/${shareToken}` : "chere.app/g/..."}
                </span>
              </div>

              {/* Format-specific renderer */}
              <div style={{ overflowY: "auto", maxHeight: "560px", paddingTop: "32px", backgroundColor: "var(--color-cream)" }}>
                <MotionConfig reducedMotion="always">
                  {renderFormat(true)}
                </MotionConfig>
              </div>
            </div>
          )}

          <p
            className="text-center mt-3"
            style={{ fontSize: "0.75rem", color: "var(--color-warm-gray)" }}
          >
            This is a preview. Your recipient&apos;s experience will adapt to their screen.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <button onClick={() => setStep("payment")} className="btn-gold text-base px-10 py-4">
            This is perfect
          </button>
          <div className="w-full flex gap-3">
            <button
              onClick={() => setStep("customize")}
              className="flex-1 text-left rounded-xl p-4 transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: "#F5F0EB",
                border: "1px solid #D4B896",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#C4A97D";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#D4B896";
              }}
            >
              <p className="font-serif text-espresso text-base mb-1">✎ Edit writing</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-stone)" }}>
                Change the tone, wording, or add your own edits
              </p>
            </button>
            <button
              onClick={() => setStep("format")}
              className="flex-1 text-left rounded-xl p-4 transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: "#F5F0EB",
                border: "1px solid #D4B896",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#C4A97D";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#D4B896";
              }}
            >
              <p className="font-serif text-espresso text-base mb-1">◐ Change style</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-stone)" }}>
                Try a different format or template
              </p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
