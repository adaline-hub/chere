"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TributeCreation } from "@/lib/mock/tribute-data";

const TEMPLATES = {
  "warm-linen": {
    bg: "#F5F0EB",
    text: "#2A2420",
    accent: "#C4A97D",
    stone: "#8B7D72",
    page: "#FAF7F4",
    spine: "#D4B896",
  },
  "soft-sage": {
    bg: "#F2F5F0",
    text: "#2A2420",
    accent: "#A8B5A0",
    stone: "#7A8C76",
    page: "#F8FBF6",
    spine: "#C5D0C2",
  },
  "midnight-gold": {
    bg: "#1A1714",
    text: "#F5F0EB",
    accent: "#C4A97D",
    stone: "#A09080",
    page: "#252019",
    spine: "#3A3226",
  },
} as const;

type TemplateDef = {
  bg: string;
  text: string;
  accent: string;
  stone: string;
  page: string;
  spine: string;
};

type Page =
  | { kind: "cover" }
  | { kind: "text"; content: string; pageNum: number }
  | { kind: "photo"; url: string; caption: string; pageNum: number }
  | { kind: "dedication"; message: string }
  | { kind: "back" };

function buildPages(creation: TributeCreation): Page[] {
  const pages: Page[] = [{ kind: "cover" }];
  const paras = creation.generatedText.split(/\n\n+/).filter((p) => p.trim());
  const photos = [...creation.photos];
  let photoIdx = 0;
  let pageNum = 1;

  paras.forEach((para) => {
    pages.push({ kind: "text", content: para, pageNum: pageNum++ });
    if (photoIdx < photos.length) {
      const p = photos[photoIdx++];
      pages.push({ kind: "photo", url: p.url, caption: p.caption, pageNum: pageNum++ });
    }
  });

  while (photoIdx < photos.length) {
    const p = photos[photoIdx++];
    pages.push({ kind: "photo", url: p.url, caption: p.caption, pageNum: pageNum++ });
  }

  if (creation.dedicationMessage) {
    pages.push({ kind: "dedication", message: creation.dedicationMessage });
  }
  pages.push({ kind: "back" });
  return pages;
}

const SKETCH_STYLE: React.CSSProperties = {
  filter: "grayscale(1) contrast(1.15) brightness(1.04) sepia(0.12)",
};

function PageContent({
  page,
  creation,
  tmpl,
  illustrationMode,
}: {
  page: Page;
  creation: TributeCreation;
  tmpl: TemplateDef;
  illustrationMode: "photos" | "sketches";
}) {
  switch (page.kind) {
    case "cover":
      return (
        <div
          className="h-full flex flex-col items-center justify-center px-8 text-center"
          style={{ background: `linear-gradient(160deg, ${tmpl.page} 60%, ${tmpl.bg} 100%)` }}
        >
          <div className="w-10 h-px mb-8" style={{ backgroundColor: tmpl.accent }} />
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", color: tmpl.accent, lineHeight: 1.2 }}>
            {creation.recipientName}
          </p>
          <p
            className="mt-4"
            style={{ fontFamily: "var(--font-serif)", fontSize: "0.9375rem", color: tmpl.stone, fontStyle: "italic" }}
          >
            a story told by {creation.creatorName || "someone who loves you"}
          </p>
          <div className="w-10 h-px mt-8" style={{ backgroundColor: tmpl.accent }} />
        </div>
      );

    case "text":
      return (
        <div className="h-full px-8 py-10 flex flex-col justify-center" style={{ backgroundColor: tmpl.page }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.0625rem",
              lineHeight: 1.85,
              color: tmpl.text,
            }}
          >
            {page.content}
          </p>
          <p
            className="mt-auto pt-6 text-right"
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", color: tmpl.stone }}
          >
            {page.pageNum}
          </p>
        </div>
      );

    case "photo":
      return (
        <div className="h-full relative overflow-hidden" style={{ backgroundColor: tmpl.bg }}>
          <div
            className="absolute inset-4 rounded-lg overflow-hidden"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
          >
            {page.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.url}
                alt={page.caption || ""}
                className="w-full h-full object-cover"
                style={illustrationMode === "sketches" ? SKETCH_STYLE : undefined}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${tmpl.bg}, ${tmpl.accent}40)`,
                  ...(illustrationMode === "sketches" ? SKETCH_STYLE : {}),
                }}
              />
            )}
          </div>
          {page.caption && (
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-2.5 text-center"
              style={{ backgroundColor: tmpl.page }}
            >
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.8125rem",
                  color: tmpl.stone,
                  fontStyle: "italic",
                }}
              >
                {page.caption}
              </p>
            </div>
          )}
        </div>
      );

    case "dedication":
      return (
        <div
          className="h-full flex flex-col items-center justify-center px-8 text-center"
          style={{ backgroundColor: tmpl.page }}
        >
          <p
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: "1.5rem",
              color: tmpl.accent,
              lineHeight: 1.6,
            }}
          >
            {page.message}
          </p>
        </div>
      );

    case "back":
      return (
        <div
          className="h-full flex flex-col items-center justify-center px-8 text-center gap-4"
          style={{ backgroundColor: tmpl.bg }}
        >
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", color: tmpl.stone }}>
            Made with Chère
          </p>
          <a
            href="https://chere.app"
            style={{ fontFamily: "var(--font-serif)", fontSize: "0.9375rem", color: tmpl.accent }}
          >
            Make one for someone you love →
          </a>
        </div>
      );
  }
}

export default function StorybookRenderer({
  creation,
  illustrationMode = "photos",
}: {
  creation: TributeCreation;
  illustrationMode?: "photos" | "sketches";
}) {
  const tmpl = TEMPLATES[creation.templateId] ?? TEMPLATES["warm-linen"];
  const pages = buildPages(creation);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const pointerStart = useRef({ x: 0 });

  function goNext() {
    if (current < pages.length - 1) {
      setDirection(1);
      setCurrent((c) => c + 1);
    }
  }
  function goPrev() {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    pointerStart.current = { x: e.clientX };
  }
  function handlePointerUp(e: React.PointerEvent) {
    const dx = e.clientX - pointerStart.current.x;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    } else {
      const half = (e.currentTarget as HTMLElement).clientWidth / 2;
      if (e.clientX > half) goNext();
      else goPrev();
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-10 px-6"
      style={{ backgroundColor: tmpl.bg, userSelect: "none" }}
    >
      {/* Book */}
      <div
        style={{
          position: "relative",
          width: "min(340px, 88vw)",
          aspectRatio: "3/4",
          cursor: "pointer",
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Page stack illusion (depth) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            right: "-4px",
            backgroundColor: `${tmpl.spine}80`,
            borderRadius: "0 12px 12px 0",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            right: "-2px",
            backgroundColor: `${tmpl.spine}60`,
            borderRadius: "0 12px 12px 0",
          }}
        />

        {/* Page */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "0 12px 12px 0",
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.12)",
          }}
        >
          {/* Spine shadow */}
          <div
            style={{
              position: "absolute",
              inset: "0 auto 0 0",
              zIndex: 10,
              width: "20px",
              background: `linear-gradient(to right, ${tmpl.spine}40, transparent)`,
              pointerEvents: "none",
            }}
          />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ position: "absolute", inset: 0 }}
            >
              <PageContent
                page={pages[current]}
                creation={creation}
                tmpl={tmpl}
                illustrationMode={illustrationMode}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-8 mt-6">
        <button
          onClick={goPrev}
          disabled={current === 0}
          aria-label="Previous page"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.25rem",
            color: current === 0 ? `${tmpl.stone}40` : tmpl.accent,
            border: "none",
            background: "none",
            cursor: current === 0 ? "default" : "pointer",
            transition: "color 200ms ease",
          }}
        >
          ←
        </button>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: tmpl.stone }}>
          {current + 1} / {pages.length}
        </p>
        <button
          onClick={goNext}
          disabled={current === pages.length - 1}
          aria-label="Next page"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.25rem",
            color: current === pages.length - 1 ? `${tmpl.stone}40` : tmpl.accent,
            border: "none",
            background: "none",
            cursor: current === pages.length - 1 ? "default" : "pointer",
            transition: "color 200ms ease",
          }}
        >
          →
        </button>
      </div>

      {current === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-2 text-xs"
          style={{ color: tmpl.stone, fontFamily: "var(--font-sans)" }}
        >
          Tap to turn pages
        </motion.p>
      )}
    </div>
  );
}
