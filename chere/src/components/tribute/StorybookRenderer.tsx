"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TributeCreation } from "@/lib/mock/tribute-data";
import type { WalkthroughProps } from "@/lib/walkthrough/types";

const TEMPLATES = {
  "warm-linen": { bg: "#F5F0EB", text: "#2A2420", accent: "#C4A97D", stone: "#8B7D72", page: "#FAF7F4", spine: "#D4B896" },
  "soft-sage": { bg: "#F2F5F0", text: "#2A2420", accent: "#A8B5A0", stone: "#7A8C76", page: "#F8FBF6", spine: "#C5D0C2" },
  "midnight-gold": { bg: "#1A1714", text: "#F5F0EB", accent: "#C4A97D", stone: "#A09080", page: "#252019", spine: "#3A3226" },
} as const;

type TemplateDef = (typeof TEMPLATES)[keyof typeof TEMPLATES];
type IllustrationMode = "photos" | "mixed" | "sketches";
type PhotoData = { url: string; caption: string };

const SKETCH_FILTER = "grayscale(0.7) contrast(0.85) brightness(1.1) sepia(0.15)";

function photoStyle(mode: IllustrationMode, hasReal: boolean): React.CSSProperties {
  if (mode === "sketches") return { filter: SKETCH_FILTER };
  if (mode === "mixed" && !hasReal) return { filter: SKETCH_FILTER };
  return {};
}

type Spread =
  | { kind: "title" }
  | { kind: "content"; paragraph: string; photo: PhotoData | null; hasReal: boolean; num: number }
  | { kind: "dedication" }
  | { kind: "back" };

function buildSpreads(creation: TributeCreation): Spread[] {
  const out: Spread[] = [{ kind: "title" }];
  const paras = creation.generatedText.split(/\n\n+/).filter((p) => p.trim());
  const photos = [...creation.photos];
  let pi = 0;
  let num = 1;
  paras.forEach((para) => {
    const hasReal = pi < photos.length;
    const photo = hasReal ? { url: photos[pi].url, caption: photos[pi].caption } : null;
    if (hasReal) pi++;
    out.push({ kind: "content", paragraph: para, photo, hasReal, num: num++ });
  });
  while (pi < photos.length) {
    out.push({ kind: "content", paragraph: "", photo: { url: photos[pi].url, caption: photos[pi].caption }, hasReal: true, num: num++ });
    pi++;
  }
  if (creation.dedicationMessage) out.push({ kind: "dedication" });
  out.push({ kind: "back" });
  return out;
}

type MPage = { si: number; side: "left" | "right" | "full" };

function buildMobilePages(spreads: Spread[]): MPage[] {
  const pages: MPage[] = [];
  spreads.forEach((s, i) => {
    if (s.kind !== "content") { pages.push({ si: i, side: "full" }); return; }
    if (s.photo) pages.push({ si: i, side: "left" });
    if (s.paragraph) pages.push({ si: i, side: "right" });
  });
  return pages;
}

function DropCap({ text, tmpl }: { text: string; tmpl: TemplateDef }) {
  if (!text) return null;
  return (
    <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", lineHeight: 1.85, color: tmpl.text, margin: 0 }}>
      <span
        style={{
          float: "left",
          fontSize: "2.75rem",
          lineHeight: 0.82,
          fontFamily: "var(--font-serif)",
          color: tmpl.accent,
          marginRight: "0.12em",
          marginTop: "0.08em",
        }}
      >
        {text[0]}
      </span>
      {text.slice(1)}
    </p>
  );
}

function Monogram({ letter, tmpl }: { letter: string; tmpl: TemplateDef }) {
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: tmpl.page }}>
      <div style={{ border: `1px solid ${tmpl.accent}45`, padding: "2.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "36px", height: "1px", backgroundColor: tmpl.accent, opacity: 0.5 }} />
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "5rem", color: tmpl.accent, lineHeight: 1 }}>{letter}</span>
        <div style={{ width: "36px", height: "1px", backgroundColor: tmpl.accent, opacity: 0.5 }} />
      </div>
    </div>
  );
}

function PhotoPane({
  photo, hasReal, mode, tmpl,
}: {
  photo: PhotoData | null; hasReal: boolean; mode: IllustrationMode; tmpl: TemplateDef;
}) {
  if (!photo) return <Monogram letter="·" tmpl={tmpl} />;
  const imgSt = photoStyle(mode, hasReal);
  return (
    <div style={{ height: "100%", backgroundColor: tmpl.bg, padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "0.5rem", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
        {photo.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={photo.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...imgSt }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${tmpl.bg}, ${tmpl.accent}40)`, ...imgSt }} />
        )}
        <div style={{ position: "absolute", inset: 0, borderRadius: "0.5rem", background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.07) 100%)" }} />
        {photo.caption && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.4rem 0.75rem", backgroundColor: `${tmpl.page}DD`, textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.6875rem", color: tmpl.stone, fontStyle: "italic", margin: 0 }}>{photo.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TextPane({ paragraph, num, tmpl }: { paragraph: string; num: number; tmpl: TemplateDef }) {
  return (
    <div style={{ height: "100%", backgroundColor: tmpl.page, padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
      {paragraph ? (
        <DropCap text={paragraph} tmpl={tmpl} />
      ) : (
        <div style={{ flex: 1, background: `linear-gradient(135deg, ${tmpl.bg}, ${tmpl.accent}18)`, borderRadius: "0.5rem" }} />
      )}
      <p style={{ marginTop: "auto", paddingTop: "1.5rem", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.6875rem", color: tmpl.stone }}>{num}</p>
    </div>
  );
}

function TitleLeft({ creation, mode, tmpl }: { creation: TributeCreation; mode: IllustrationMode; tmpl: TemplateDef }) {
  const first = creation.photos[0];
  if (first) return <PhotoPane photo={{ url: first.url, caption: first.caption }} hasReal mode={mode} tmpl={tmpl} />;
  return <Monogram letter={(creation.recipientName[0] ?? "C").toUpperCase()} tmpl={tmpl} />;
}

function TitleRight({ creation, tmpl }: { creation: TributeCreation; tmpl: TemplateDef }) {
  return (
    <div style={{ height: "100%", backgroundColor: tmpl.page, padding: "2.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ width: "40px", height: "1px", backgroundColor: tmpl.accent, opacity: 0.45, marginBottom: "1.5rem" }} />
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: tmpl.accent, lineHeight: 1.2, margin: "0 0 0.75rem" }}>{creation.recipientName}</p>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.9375rem", color: tmpl.stone, fontStyle: "italic", margin: "0 0 2rem" }}>A story of memories</p>
      <div style={{ width: "40px", height: "1px", backgroundColor: tmpl.accent, opacity: 0.45, marginBottom: "2rem" }} />
      {creation.creatorName && (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: tmpl.stone }}>{creation.creatorName}</p>
      )}
    </div>
  );
}

function DedicationLeft({ creation, mode, tmpl }: { creation: TributeCreation; mode: IllustrationMode; tmpl: TemplateDef }) {
  const last = creation.photos[creation.photos.length - 1];
  if (last) return <PhotoPane photo={{ url: last.url, caption: last.caption }} hasReal mode={mode} tmpl={tmpl} />;
  return <Monogram letter="✦" tmpl={tmpl} />;
}

function DedicationRight({ creation, tmpl }: { creation: TributeCreation; tmpl: TemplateDef }) {
  return (
    <div style={{ height: "100%", backgroundColor: tmpl.page, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ width: "32px", height: "1px", backgroundColor: tmpl.accent, opacity: 0.4, marginBottom: "1.5rem" }} />
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.25rem", color: tmpl.accent, lineHeight: 1.6, margin: 0 }}>{creation.dedicationMessage}</p>
    </div>
  );
}

function BackPage({ tmpl }: { tmpl: TemplateDef }) {
  return (
    <div style={{ height: "100%", backgroundColor: tmpl.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", textAlign: "center", padding: "2rem" }}>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", color: tmpl.stone, margin: 0 }}>Made with Chère</p>
      <a href="https://chere.app" style={{ fontFamily: "var(--font-serif)", fontSize: "0.9375rem", color: tmpl.accent }}>
        Make one for someone you love →
      </a>
    </div>
  );
}

// ─── Left page content per spread kind ───────────────────────────────────────

function SpreadLeft({ spread, creation, mode, tmpl }: { spread: Spread; creation: TributeCreation; mode: IllustrationMode; tmpl: TemplateDef }) {
  if (spread.kind === "title") return <TitleLeft creation={creation} mode={mode} tmpl={tmpl} />;
  if (spread.kind === "dedication") return <DedicationLeft creation={creation} mode={mode} tmpl={tmpl} />;
  if (spread.kind === "back") return <BackPage tmpl={tmpl} />;
  return <PhotoPane photo={spread.photo} hasReal={spread.hasReal} mode={mode} tmpl={tmpl} />;
}

function SpreadRight({ spread, creation, tmpl }: { spread: Spread; creation: TributeCreation; tmpl: TemplateDef }) {
  if (spread.kind === "title") return <TitleRight creation={creation} tmpl={tmpl} />;
  if (spread.kind === "dedication") return <DedicationRight creation={creation} tmpl={tmpl} />;
  if (spread.kind === "back") return <BackPage tmpl={tmpl} />;
  return <TextPane paragraph={spread.paragraph} num={spread.num} tmpl={tmpl} />;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const leftFade = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const rightFold = {
  enter: (dir: number) => ({ rotateY: dir > 0 ? 90 : -90, opacity: 0.5 }),
  center: { rotateY: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: (dir: number) => ({ rotateY: dir > 0 ? -90 : 90, opacity: 0.5, transition: { duration: 0.35, ease: "easeIn" as const } }),
};

const mobileSlide = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.3 } }),
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function StorybookRenderer({
  creation,
  illustrationMode = "photos",
  preview = false,
  forceMobile = false,
  walkthrough,
}: {
  creation: TributeCreation;
  illustrationMode?: IllustrationMode;
  preview?: boolean;
  forceMobile?: boolean;
} & WalkthroughProps) {
  const tmpl = TEMPLATES[creation.templateId] ?? TEMPLATES["warm-linen"];
  const spreads = buildSpreads(creation);
  const mobilePages = buildMobilePages(spreads);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMobile, setIsMobile] = useState(forceMobile);
  const [showDedicationAudio, setShowDedicationAudio] = useState(false);
  const pointerStart = { x: 0 };

  useEffect(() => {
    if (forceMobile) {
      setIsMobile(true);
      return;
    }
    const check = () => setIsMobile(window.innerWidth < 768 && window.innerHeight < 500);
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, [forceMobile]);

  const total = isMobile ? mobilePages.length : spreads.length;

  function navigate(next: number) {
    if (next < 0 || next >= total) return;
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  }

  function handlePointerDown(e: React.PointerEvent) { pointerStart.x = e.clientX; }
  function handlePointerUp(e: React.PointerEvent) {
    if (preview || walkthrough?.active) return;
    const dx = e.clientX - pointerStart.x;
    if (Math.abs(dx) > 40) navigate(dx < 0 ? current + 1 : current - 1);
  }

  useEffect(() => {
    if (!walkthrough?.active || walkthrough.paused) return;
    if (current >= total - 1) {
      if (creation.audio?.dedicationUrl) setShowDedicationAudio(true);
      else walkthrough.onComplete();
      return;
    }
    const t = window.setTimeout(() => {
      navigate(current + 1);
      walkthrough.onAdvance();
    }, 5000);
    return () => window.clearTimeout(t);
  }, [creation.audio?.dedicationUrl, current, total, walkthrough?.active, walkthrough?.paused]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tmpl.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "1rem" : "2rem 1.5rem",
        userSelect: "none",
      }}
    >
      {isMobile ? (
        // ── Mobile: single page ──────────────────────────────────────────────
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "380px",
            aspectRatio: "3/4",
            overflow: "hidden",
            borderRadius: "0.5rem",
            boxShadow: "4px 4px 0 2px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.18)",
            touchAction: "none",
          }}
          onPointerDown={preview ? undefined : handlePointerDown}
          onPointerUp={preview ? undefined : handlePointerUp}
        >
          {/* Page edge shadows */}
          <div style={{ position: "absolute", inset: "0 auto 0 0", width: "5px", background: "linear-gradient(to right, rgba(0,0,0,0.1), transparent)", zIndex: 10, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: "0 0 0 auto", width: "5px", background: "linear-gradient(to left, rgba(0,0,0,0.1), transparent)", zIndex: 10, pointerEvents: "none" }} />
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={mobileSlide}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ position: "absolute", inset: 0 }}
            >
              {(() => {
                const mp = mobilePages[current];
                const spread = spreads[mp.si];
                if (mp.side === "left") return <SpreadLeft spread={spread} creation={creation} mode={illustrationMode} tmpl={tmpl} />;
                if (mp.side === "right") return <SpreadRight spread={spread} creation={creation} tmpl={tmpl} />;
                // full: title / dedication / back — show combined
                return (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: "0 0 45%" }}><SpreadLeft spread={spread} creation={creation} mode={illustrationMode} tmpl={tmpl} /></div>
                    <div style={{ flex: 1 }}><SpreadRight spread={spread} creation={creation} tmpl={tmpl} /></div>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        // ── Desktop: open book ───────────────────────────────────────────────
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "780px",
            aspectRatio: "4/3",
            display: "flex",
            borderRadius: "4px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
            touchAction: "none",
          }}
          onPointerDown={preview ? undefined : handlePointerDown}
          onPointerUp={preview ? undefined : handlePointerUp}
        >
          {/* Left page */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: "4px 0 0 4px" }}>
            {/* Outer left edge shadow */}
            <div style={{ position: "absolute", inset: "0 auto 0 0", width: "8px", background: "linear-gradient(to right, rgba(0,0,0,0.13), transparent)", zIndex: 10, pointerEvents: "none" }} />
            <AnimatePresence mode="wait">
              <motion.div key={`l-${current}`} variants={leftFade} initial="enter" animate="center" exit="exit" style={{ position: "absolute", inset: 0 }}>
                <SpreadLeft spread={spreads[current]} creation={creation} mode={illustrationMode} tmpl={tmpl} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Spine */}
          <div style={{ width: "4px", flexShrink: 0, background: `linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0.04), rgba(0,0,0,0.18))` }} />

          {/* Right page — 3D flip */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: "0 4px 4px 0", perspective: "1200px" }}>
            {/* Outer right edge shadow */}
            <div style={{ position: "absolute", inset: "0 0 0 auto", width: "8px", background: "linear-gradient(to left, rgba(0,0,0,0.13), transparent)", zIndex: 10, pointerEvents: "none" }} />
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`r-${current}`}
                custom={direction}
                variants={rightFold}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ position: "absolute", inset: 0, transformOrigin: "left center" }}
              >
                <SpreadRight spread={spreads[current]} creation={creation} tmpl={tmpl} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginTop: "1.5rem" }}>
        <button
          type="button"
          onClick={preview ? undefined : () => navigate(current - 1)}
          disabled={current === 0}
          aria-label="Previous"
          style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: current === 0 ? `${tmpl.stone}40` : tmpl.accent, background: "none", border: "none", cursor: current === 0 ? "default" : "pointer", transition: "color 200ms" }}
        >←</button>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: tmpl.stone }}>
          {current + 1} / {total}
        </p>
        <button
          type="button"
          onClick={preview ? undefined : () => navigate(current + 1)}
          disabled={current === total - 1}
          aria-label="Next"
          style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: current === total - 1 ? `${tmpl.stone}40` : tmpl.accent, background: "none", border: "none", cursor: current === total - 1 ? "default" : "pointer", transition: "color 200ms" }}
        >→</button>
      </div>

      {current === 0 && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }}
          style={{ marginTop: "0.5rem", fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: tmpl.stone }}
        >
          {isMobile ? "Swipe to turn pages" : "Click arrows or tap the sides to turn pages"}
        </motion.p>
      )}
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
