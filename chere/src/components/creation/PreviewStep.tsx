"use client";

import { motion, MotionConfig } from "framer-motion";
import { useState } from "react";
import { useCreationStore } from "@/stores/creation-store";
import StepHeader from "@/components/creation/StepHeader";
import ScrollytellingRenderer from "@/components/tribute/ScrollytellingRenderer";
import MemoryWrappedRenderer from "@/components/tribute/MemoryWrappedRenderer";
import LoveLetterRenderer from "@/components/tribute/LoveLetterRenderer";
import StorybookRenderer from "@/components/tribute/StorybookRenderer";
import CompanionRenderer from "@/components/tribute/CompanionRenderer";
import WalkthroughBar from "@/components/audio/WalkthroughBar";
import { useWalkthrough } from "@/lib/walkthrough/useWalkthrough";
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
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">(
    () => (typeof window !== "undefined" && window.innerWidth <= 768 ? "mobile" : "desktop")
  );
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);

  const previewCreation: TributeCreation = {
    id: creationId ?? "preview",
    recipientName: recipientName ?? "",
    creatorName: "",
    type: (creationType ?? "tribute") as TributeCreation["type"],
    relationshipType: relationshipType ?? "",
    outputFormat: (outputFormat ?? "scrollytelling") as TributeCreation["outputFormat"],
    templateId: (templateId ?? "warm-linen") as TributeCreation["templateId"],
    tier: "starter",
    generatedText: displayText ?? "",
    dedicationMessage: dedicationMessage ?? "",
    photos: photos.map((p) => ({ id: p.id, url: p.preview, caption: p.caption ?? "" })),
    giftMoment:
      giftMoments.length > 0
        ? {
            description: giftMoments[0].description,
            message: giftMoments[0].message ?? "",
            revealStyle: "card",
          }
        : null,
    musicTrackId: null,
  };

  // Debug: log what MemoryWrapped preview receives
  if (outputFormat === "memory_wrapped") {
    console.log("[PreviewStep] MemoryWrapped data:", {
      text: displayText?.substring(0, 80),
      recipientName,
      photosCount: photos.length,
      dedicationMessage: dedicationMessage?.substring(0, 40),
    });
  }

  const walkthroughSteps = Math.max(1, previewCreation.generatedText.split(/\n\n+/).filter((p) => p.trim()).length + previewCreation.photos.length + 2);
  const walkthrough = useWalkthrough(walkthroughSteps);

  function renderFormat(preview = false, walkthroughActive = false) {
    const markComplete = () => {
      for (let i = 0; i < walkthrough.totalSteps; i++) walkthrough.next();
    };
    const walkthroughProps = walkthroughActive
      ? {
          walkthrough: {
            active: true,
            paused: walkthrough.state !== "playing",
            onAdvance: walkthrough.next,
            onComplete: markComplete,
          },
        }
      : undefined;
    switch (outputFormat) {
      case "memory_wrapped":
        return <MemoryWrappedRenderer creation={previewCreation} preview={preview} {...walkthroughProps} />;
      case "love_letter":
        return <LoveLetterRenderer creation={previewCreation} preview={preview} {...walkthroughProps} />;
      case "storybook":
        return <StorybookRenderer creation={previewCreation} illustrationMode={illustrationMode} preview={preview} forceMobile={previewMode === "mobile"} {...walkthroughProps} />;
      case "companion":
        return <CompanionRenderer creation={previewCreation} preview={preview} {...walkthroughProps} />;
      default:
        return <ScrollytellingRenderer creation={previewCreation} {...walkthroughProps} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-24 overflow-y-auto">
      <div className="w-full max-w-xl">
        <StepHeader step="preview" title="Here's their gift" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-10 leading-relaxed"
        >
          This is what {recipientName || "they"} will see when they open it.
        </motion.p>

        {/* Mobile / Desktop toggle */}
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
            {(["mobile", "desktop"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewMode(mode)}
                className="px-4 py-1.5 rounded-full text-sm transition-all duration-200 capitalize"
                style={
                  previewMode === mode
                    ? { backgroundColor: "var(--color-espresso)", color: "var(--color-cream)" }
                    : {
                        backgroundColor: "transparent",
                        border: "1px solid var(--color-parchment)",
                        color: "var(--color-stone)",
                      }
                }
              >
                {mode}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Preview frame */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto mb-2"
          style={previewMode === "mobile" ? { width: "300px" } : { width: "720px", maxWidth: "90vw" }}
        >
          {previewMode === "mobile" ? (
            <div
              className="rounded-[2.5rem] overflow-hidden"
              style={{
                padding: "3px",
                background: "linear-gradient(135deg, #D4B896 0%, #C4A97D 50%, #A08060 100%)",
                boxShadow: "0 32px 64px rgba(42,36,32,0.25), 0 8px 16px rgba(42,36,32,0.12)",
              }}
            >
              <div className="rounded-[2.25rem] overflow-hidden" style={{ backgroundColor: tmpl.bg }}>
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

                {/* Scaled renderer */}
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
                boxShadow: "0 24px 52px rgba(42,36,32,0.18), 0 6px 14px rgba(42,36,32,0.10)",
              }}
            >
              {/* Browser chrome */}
              <div
                className="h-7 px-4 flex items-center justify-center relative"
                style={{ backgroundColor: "var(--color-parchment)" }}
              >
                <div className="absolute left-4 flex gap-2">
                  {["var(--color-error)", "var(--color-muted-gold)", "var(--color-sage-green)"].map((c, i) => (
                    <span
                      key={i}
                      className="rounded-full"
                      style={{ width: "12px", height: "12px", backgroundColor: c }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: "11px", color: "var(--color-warm-gray)" }}>
                  {shareToken ? `chere.app/g/${shareToken}` : "chere.app/g/..."}
                </span>
              </div>

              <div style={{ overflowY: "auto", maxHeight: "560px", paddingTop: "32px", backgroundColor: "var(--color-cream)" }}>
                <MotionConfig reducedMotion="always">
                  {renderFormat(true)}
                </MotionConfig>
              </div>
            </div>
          )}
        </motion.div>

        <p
          className="text-center mb-8"
          style={{ fontSize: "0.75rem", color: "var(--color-warm-gray)" }}
        >
          This is a preview. Your recipient&apos;s experience will adapt to their screen.
        </p>
        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={() => {
              walkthrough.restart();
              setShowWalkthroughModal(true);
            }}
            className="rounded-full px-5 py-2 text-sm"
            style={{ backgroundColor: "rgba(250,247,244,0.95)", border: "1px solid rgba(196,169,125,0.45)", color: "#5A4E48" }}
          >
            ▶ Preview full experience
          </button>
        </div>

        {/* Actions — always visible outside the frame */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col gap-4"
          style={{ marginTop: "2rem" }}
        >
          <button
            onClick={() => setStep("payment")}
            className="btn-gold text-base py-4 w-full"
          >
            This is perfect
          </button>
          <button
            onClick={() => setStep("customize")}
            className="w-full text-left rounded-xl p-4 transition-all duration-200 hover:shadow-md"
            style={{ backgroundColor: "#F5F0EB", border: "1px solid #D4B896" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C4A97D"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D4B896"; }}
          >
            <p className="font-serif text-espresso text-base mb-1">✎ Edit writing</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-stone)" }}>
              Change the tone, wording, or add your own edits
            </p>
          </button>
        </motion.div>
      </div>
      {showWalkthroughModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 120, backgroundColor: "#111" }}>
          {renderFormat(false, true)}
          <WalkthroughBar
            state={walkthrough.state}
            progress={walkthrough.progress}
            step={walkthrough.step}
            totalSteps={walkthrough.totalSteps}
            onToggle={walkthrough.toggle}
            onRestart={walkthrough.restart}
            onExit={() => setShowWalkthroughModal(false)}
          />
        </div>
      )}
    </div>
  );
}
