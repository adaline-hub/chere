"use client";

import { useState } from "react";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TributeCreation } from "@/lib/mock/tribute-data";
import type { WalkthroughProps } from "@/lib/walkthrough/types";

const TEMPLATES = {
  "warm-linen": { bg: "#F5F0EB", text: "#2A2420", accent: "#C4A97D", stone: "#8B7D72", envelope: "#EDE7DF", flap: "#DDD4C8" },
  "soft-sage": { bg: "#F2F5F0", text: "#2A2420", accent: "#A8B5A0", stone: "#7A8C76", envelope: "#E5EAE3", flap: "#D5DDD2" },
  "midnight-gold": { bg: "#1A1714", text: "#F5F0EB", accent: "#C4A97D", stone: "#A09080", envelope: "#252019", flap: "#1E1B15" },
} as const;

type Phase = "sealed" | "opening" | "letter";

export default function LoveLetterRenderer({
  creation,
  preview,
  walkthrough,
}: {
  creation: TributeCreation;
  preview?: boolean;
} & WalkthroughProps) {
  const tmpl = TEMPLATES[creation.templateId] ?? TEMPLATES["warm-linen"];
  const [phase, setPhase] = useState<Phase>(preview ? "letter" : "sealed");
  const letterRef = useRef<HTMLDivElement | null>(null);
  const [showDedicationAudio, setShowDedicationAudio] = useState(false);

  const creatorInitial = creation.creatorName.charAt(0).toUpperCase();
  const paragraphs = creation.generatedText.split(/\n\n+/).filter((p) => p.trim());
  const photoCount = Math.min(creation.photos.length, 4);
  // Distribute photos evenly through paragraphs
  const photoInsertions = new Map<number, number>();
  for (let k = 0; k < photoCount; k++) {
    const paraIdx = Math.floor(((k + 1) * paragraphs.length) / (photoCount + 1));
    photoInsertions.set(paraIdx, k);
  }

  async function handleOpen() {
    if (phase !== "sealed") return;
    setPhase("opening");
    await delay(1400);
    setPhase("letter");
  }

  function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  useEffect(() => {
    if (!walkthrough?.active || walkthrough.paused) return;
    if (phase === "sealed") {
      const t = window.setTimeout(() => {
        walkthrough.onAdvance();
        handleOpen();
      }, 1500);
      return () => window.clearTimeout(t);
    }
  }, [phase, walkthrough?.active, walkthrough?.paused]);

  useEffect(() => {
    if (!walkthrough?.active || walkthrough.paused || phase !== "letter") return;
    const root = letterRef.current;
    if (!root) return;
    const words = creation.generatedText.trim().split(/\s+/).filter(Boolean).length;
    const durationMs = Math.max(12000, (words / 60) * 60_000);
    const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
    const pxPerMs = maxScroll <= 0 ? 0 : maxScroll / durationMs;
    let rafId = 0;
    let lastTs = performance.now();
    let beatAt = 0;
    const tick = (ts: number) => {
      const dt = ts - lastTs;
      lastTs = ts;
      if (pxPerMs > 0 && root.scrollTop < maxScroll) root.scrollTop = Math.min(maxScroll, root.scrollTop + pxPerMs * dt);
      if (ts - beatAt > 6000) {
        beatAt = ts;
        walkthrough.onAdvance();
      }
      if (root.scrollTop >= maxScroll - 4) {
        if (creation.audio?.dedicationUrl) setShowDedicationAudio(true);
        else walkthrough.onComplete();
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [creation.audio?.dedicationUrl, creation.generatedText, phase, walkthrough?.active, walkthrough?.paused]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: tmpl.bg }}
    >
      <AnimatePresence mode="wait">
        {phase !== "letter" ? (
          /* ── Envelope phase ── */
          <motion.div
            key="envelope"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            {/* Envelope wrapper */}
            <div
              style={{ perspective: "800px", width: "320px" }}
              onClick={handleOpen}
            >
              <div
                className="relative cursor-pointer"
                style={{ width: "320px", height: "220px" }}
              >
                {/* Envelope body */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    backgroundColor: tmpl.envelope,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />

                {/* Bottom triangle (V-shape inside envelope) */}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: "110px",
                    clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                    backgroundColor: `${tmpl.flap}CC`,
                    borderRadius: "0 0 8px 8px",
                  }}
                />

                {/* Left triangle */}
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{
                    width: "160px",
                    clipPath: "polygon(0 0, 0 100%, 100% 50%)",
                    backgroundColor: `${tmpl.flap}99`,
                  }}
                />

                {/* Right triangle */}
                <div
                  className="absolute right-0 top-0 bottom-0"
                  style={{
                    width: "160px",
                    clipPath: "polygon(100% 0, 100% 100%, 0 50%)",
                    backgroundColor: `${tmpl.flap}99`,
                  }}
                />

                {/* Flap (animated) */}
                <motion.div
                  className="absolute top-0 left-0 right-0"
                  style={{
                    height: "110px",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    backgroundColor: tmpl.flap,
                    transformOrigin: "top center",
                    zIndex: 10,
                  }}
                  animate={phase === "opening" ? { rotateX: -180, opacity: 0 } : { rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Wax seal */}
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: tmpl.accent,
                      top: "calc(50% + 8px)",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "0.9375rem",
                        color: "#FAF7F4",
                        fontWeight: 500,
                      }}
                    >
                      {creatorInitial}
                    </span>
                  </div>
                </motion.div>

                {/* Letter peeking out during opening */}
                {phase === "opening" && (
                  <motion.div
                    className="absolute left-4 right-4 rounded-md"
                    style={{ backgroundColor: "#FAF7F4", bottom: "12px" }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "140px", opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  />
                )}
              </div>
            </div>

            {/* Prompt */}
            <motion.p
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-8 text-sm"
              style={{ fontFamily: "var(--font-serif)", color: tmpl.stone }}
            >
              Tap to open
            </motion.p>
          </motion.div>
        ) : (
          /* ── Letter phase ── */
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            ref={letterRef}
            className="min-h-screen pb-24 texture-linen"
            style={{ backgroundColor: "#FAF7F4", position: "relative", overflowY: "auto", height: "100vh" }}
          >
            {/* Notebook margin line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "60px",
                width: "1px",
                backgroundColor: "var(--color-soft-rose, #D4B8AE)",
                opacity: 0.3,
                pointerEvents: "none",
              }}
            />
            <div
              className="mx-auto pt-16 pb-8"
              style={{
                maxWidth: "620px",
                paddingLeft: "max(2rem, calc(2rem + 24px))",
                paddingRight: "2rem",
                marginLeft: "max(2rem, 10vw)",
                marginRight: "auto",
              }}
            >
              {/* Paragraphs + photos interleaved evenly */}
              {paragraphs.map((para, i) => (
                <div key={i}>
                  <p
                    className="mb-6 text-left"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: "1.125rem",
                      lineHeight: 1.7,
                      color: "#2A2420",
                    }}
                  >
                    {para}
                  </p>
                  {photoInsertions.has(i) && creation.photos[photoInsertions.get(i)!] && (
                    <PolaroidPhoto
                      photo={creation.photos[photoInsertions.get(i)!]}
                      rotation={[-2, 1.5, -1.5, 2][photoInsertions.get(i)! % 4]}
                    />
                  )}
                </div>
              ))}

              {/* Gift moment */}
              {creation.giftMoment && (
                <div
                  className="my-10 rounded-xl p-6"
                  style={{
                    border: `1px solid ${tmpl.accent}50`,
                    backgroundColor: `${tmpl.accent}0D`,
                  }}
                >
                  <p
                    className="mb-2"
                    style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", color: tmpl.accent }}
                  >
                    And one more thing...
                  </p>
                  <p style={{ fontFamily: "var(--font-hand)", fontSize: "1.25rem", color: tmpl.text }}>
                    {creation.giftMoment.description}
                  </p>
                </div>
              )}

              {/* Dedication */}
              {creation.dedicationMessage && (
                <p
                  className="mt-10 mb-4"
                  style={{
                    fontFamily: "var(--font-hand)",
                    fontSize: "1.625rem",
                    color: tmpl.accent,
                  }}
                >
                  {creation.dedicationMessage}
                </p>
              )}

              {/* Footer */}
              <div className="mt-16 pt-8 text-center" style={{ borderTop: `1px solid ${tmpl.accent}30` }}>
                {creation.tier === "free" && (
                  <p className="text-xs mb-2" style={{ color: tmpl.stone, fontFamily: "var(--font-sans)" }}>
                    Made with Chère
                  </p>
                )}
                <a
                  href="https://chere.app"
                  style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", color: tmpl.accent }}
                >
                  Make one for someone you love →
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showDedicationAudio && creation.audio?.dedicationUrl && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(42,36,32,0.28)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: "rgba(250,247,244,0.96)", borderRadius: "999px", padding: "0.55rem 0.9rem", boxShadow: "0 6px 24px rgba(0,0,0,0.2)" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#5A4E48" }}>A message for you</span>
            <audio autoPlay src={creation.audio.dedicationUrl} onEnded={() => walkthrough?.onComplete()} preload="auto" />
          </div>
        </div>
      )}
    </div>
  );
}

function PolaroidPhoto({
  photo,
  rotation,
}: {
  photo: { url: string; caption: string };
  rotation: number;
}) {
  return (
    <div
      className="mx-auto my-8"
      style={{
        width: "200px",
        transform: `rotate(${rotation}deg)`,
        backgroundColor: "white",
        padding: "8px 8px 28px 8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.07)",
        borderRadius: "2px",
      }}
    >
      <div
        style={{
          width: "184px",
          height: "150px",
          background: photo.url
            ? `url(${photo.url}) center/cover no-repeat`
            : "linear-gradient(135deg, #FAF7F4, #EDE7DF)",
          backgroundSize: "cover",
          borderRadius: "1px",
        }}
      />
      <p
        className="text-center mt-2"
        style={{
          fontFamily: "var(--font-hand)",
          fontSize: "0.875rem",
          color: "#5A4E48",
        }}
      >
        {photo.caption}
      </p>
    </div>
  );
}
