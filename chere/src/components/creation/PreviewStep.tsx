"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCreationStore } from "@/stores/creation-store";

const TEMPLATE_STYLES: Record<string, { bg: string; text: string; accent: string }> = {
  "warm-linen": { bg: "#F5F0EB", text: "#2A2420", accent: "#C4A97D" },
  "soft-sage": { bg: "#F2F5F0", text: "#2A2420", accent: "#A8B5A0" },
  "midnight-gold": { bg: "#1A1714", text: "#F5F0EB", accent: "#C4A97D" },
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
    setStep,
  } = useCreationStore();

  const displayText = editedText ?? generatedText;
  const tmpl = TEMPLATE_STYLES[templateId] ?? TEMPLATE_STYLES["warm-linen"];
  const previewPhotos = photos.slice(0, 3);

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

        {/* Phone frame */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto mb-10"
          style={{ width: "300px" }}
        >
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
                  style={{ width: "80px", height: "18px", backgroundColor: `${tmpl.text}15` }}
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

              {/* Scrollable content */}
              <div className="overflow-y-auto px-6 pb-10" style={{ maxHeight: "520px" }}>
                {/* Header */}
                <div className="text-center pt-4 pb-5">
                  <p
                    className="tracking-[0.25em] uppercase mb-2"
                    style={{ fontSize: "8px", color: tmpl.accent }}
                  >
                    chère
                  </p>
                  {recipientName && (
                    <p
                      className="font-serif leading-tight"
                      style={{ fontSize: "18px", color: tmpl.text }}
                    >
                      For {recipientName}
                    </p>
                  )}
                </div>

                {/* Photos */}
                {previewPhotos.length > 0 && (
                  <div
                    className="mb-5 rounded-xl overflow-hidden"
                    style={{
                      display: "grid",
                      gap: "2px",
                      gridTemplateColumns:
                        previewPhotos.length === 1
                          ? "1fr"
                          : previewPhotos.length === 2
                          ? "1fr 1fr"
                          : "2fr 1fr",
                      gridTemplateRows:
                        previewPhotos.length === 3 ? "1fr 1fr" : undefined,
                    }}
                  >
                    {previewPhotos.map((photo, i) => (
                      <div
                        key={photo.id}
                        className="relative"
                        style={{
                          aspectRatio: "1",
                          gridRow:
                            i === 0 && previewPhotos.length === 3 ? "span 2" : undefined,
                        }}
                      >
                        <Image
                          src={photo.preview}
                          alt={photo.caption || `Photo ${i + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Tribute text */}
                {displayText && (
                  <p
                    className="whitespace-pre-wrap mb-5"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "11px",
                      lineHeight: "1.85",
                      color: tmpl.text,
                      opacity: 0.88,
                    }}
                  >
                    {displayText}
                  </p>
                )}

                {/* Gift moment card */}
                {giftMoments.length > 0 && (
                  <div
                    className="rounded-xl p-4 mb-5"
                    style={{
                      border: `1px solid ${tmpl.accent}50`,
                      backgroundColor: `${tmpl.accent}12`,
                    }}
                  >
                    <p
                      className="tracking-widest uppercase mb-1"
                      style={{ fontSize: "8px", color: tmpl.accent }}
                    >
                      Your gift
                    </p>
                    <p
                      className="font-serif"
                      style={{ fontSize: "11px", color: tmpl.text }}
                    >
                      {giftMoments[0].description}
                    </p>
                    {giftMoments[0].message && (
                      <p
                        className="mt-1"
                        style={{ fontSize: "10px", color: tmpl.text, opacity: 0.65 }}
                      >
                        {giftMoments[0].message}
                      </p>
                    )}
                  </div>
                )}

                {/* Dedication */}
                {dedicationMessage && (
                  <p
                    className="text-center italic mb-5"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "10px",
                      color: tmpl.accent,
                    }}
                  >
                    {dedicationMessage}
                  </p>
                )}

                {/* Watermark */}
                <p
                  className="text-center tracking-[0.2em] uppercase"
                  style={{ fontSize: "7px", color: `${tmpl.text}25` }}
                >
                  made with chère
                </p>
              </div>
            </div>
          </div>

          {outputFormat && (
            <p className="text-center text-xs mt-4" style={{ color: "var(--color-warm-gray)" }}>
              {outputFormat.replace(/_/g, " ")}
            </p>
          )}
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
          <button
            onClick={() => setStep("customize")}
            className="text-sm transition-colors duration-200"
            style={{ color: "var(--color-stone)" }}
          >
            Go back and edit
          </button>
        </motion.div>
      </div>
    </div>
  );
}
