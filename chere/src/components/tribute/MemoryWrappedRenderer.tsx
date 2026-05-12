"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TributeCreation } from "@/lib/mock/tribute-data";

const TEMPLATES = {
  "warm-linen": { bg: "#F5F0EB", text: "#2A2420", accent: "#C4A97D", stone: "#8B7D72", surface: "#EDE7DF", card: "#FAF7F4" },
  "soft-sage": { bg: "#F2F5F0", text: "#2A2420", accent: "#A8B5A0", stone: "#7A8C76", surface: "#E5EAE3", card: "#F5F8F3" },
  "midnight-gold": { bg: "#1A1714", text: "#F5F0EB", accent: "#C4A97D", stone: "#A09080", surface: "#232019", card: "#201D1A" },
} as const;

type Card =
  | { kind: "title" }
  | { kind: "stat"; count: number }
  | { kind: "text"; content: string }
  | { kind: "quote"; content: string }
  | { kind: "photo"; url: string; caption: string }
  | { kind: "dedication"; message: string }
  | { kind: "cta" };

function buildCards(creation: TributeCreation): Card[] {
  const memoryCount = Object.keys(creation).length; // rough proxy
  const cards: Card[] = [{ kind: "title" }, { kind: "stat", count: memoryCount }];
  const paras = creation.generatedText.split(/\n\n+/).filter((p) => p.trim());
  const photos = [...creation.photos];
  let photoIndex = 0;

  paras.forEach((para, i) => {
    if (para.trim().startsWith('"')) {
      cards.push({ kind: "quote", content: para.trim() });
    } else {
      cards.push({ kind: "text", content: para.trim() });
    }
    if (i % 2 === 1 && photoIndex < photos.length) {
      const p = photos[photoIndex++];
      cards.push({ kind: "photo", url: p.url, caption: p.caption });
    }
  });

  while (photoIndex < photos.length) {
    const p = photos[photoIndex++];
    cards.push({ kind: "photo", url: p.url, caption: p.caption });
  }

  if (creation.dedicationMessage) {
    cards.push({ kind: "dedication", message: creation.dedicationMessage });
  }
  cards.push({ kind: "cta" });
  return cards;
}

type TemplateDef = { bg: string; text: string; accent: string; stone: string; surface: string; card: string };

function CardContent({
  card,
  creation,
  tmpl,
}: {
  card: Card;
  creation: TributeCreation;
  tmpl: TemplateDef;
}) {
  switch (card.kind) {
    case "title":
      return (
        <div
          className="flex flex-col items-center justify-center h-full text-center px-8"
          style={{ background: `radial-gradient(ellipse at center, ${tmpl.card} 60%, ${tmpl.surface} 100%)` }}
        >
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", color: tmpl.accent, lineHeight: 1.2 }}>
            {creation.recipientName}
          </p>
          <p className="mt-3" style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: tmpl.stone }}>
            from {creation.creatorName}
          </p>
        </div>
      );

    case "stat":
      return (
        <div
          className="flex flex-col items-center justify-center h-full text-center px-8"
          style={{ background: `radial-gradient(ellipse at center, ${tmpl.card} 60%, ${tmpl.surface} 100%)` }}
        >
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "3.5rem", color: tmpl.accent, lineHeight: 1 }}>
            {creation.photos.length + 1}
          </p>
          <p className="mt-2" style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: tmpl.stone }}>
            memories shared
          </p>
        </div>
      );

    case "text":
      return (
        <div className="flex flex-col justify-center h-full px-7 py-8">
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.0625rem",
              lineHeight: 1.8,
              color: tmpl.text,
            }}
          >
            {card.content}
          </p>
        </div>
      );

    case "quote":
      return (
        <div className="flex flex-col justify-center h-full px-7 py-8">
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              lineHeight: 1.65,
              color: tmpl.accent,
              fontStyle: "italic",
            }}
          >
            {card.content}
          </p>
        </div>
      );

    case "photo":
      return (
        <div className="h-full relative overflow-hidden rounded-[1rem]">
          <div
            className="absolute inset-0"
            style={{
              background: card.url
                ? `url(${card.url}) center/cover no-repeat`
                : `linear-gradient(135deg, ${tmpl.surface}, ${tmpl.accent}40)`,
            }}
          />
          {card.caption && (
            <div
              className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
              }}
            >
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "#FAF7F4" }}>
                {card.caption}
              </p>
            </div>
          )}
        </div>
      );

    case "dedication":
      return (
        <div className="flex flex-col items-center justify-center h-full px-7 text-center">
          <p
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: "1.625rem",
              color: tmpl.accent,
              lineHeight: 1.5,
            }}
          >
            {card.message}
          </p>
        </div>
      );

    case "cta":
      return (
        <div className="flex flex-col items-center justify-center h-full px-7 text-center gap-4">
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

export default function MemoryWrappedRenderer({ creation }: { creation: TributeCreation }) {
  const tmpl = TEMPLATES[creation.templateId] ?? TEMPLATES["warm-linen"];
  const cards = buildCards(creation);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const pointerStart = useRef({ x: 0 });

  function goNext() {
    if (current < cards.length - 1) {
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
    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    } else {
      const half = (e.currentTarget as HTMLDivElement).clientWidth / 2;
      if (e.clientX > half) goNext();
      else goPrev();
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: tmpl.bg, userSelect: "none" }}
    >
      {/* Card stack */}
      <div
        className="relative overflow-hidden"
        style={{
          width: "min(380px, 92vw)",
          aspectRatio: "3/4",
          borderRadius: "1rem",
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          backgroundColor: tmpl.card,
          touchAction: "none",
          cursor: "pointer",
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <CardContent card={cards[current]} creation={creation} tmpl={tmpl} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-5">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            style={{
              width: i === current ? "20px" : "6px",
              height: "6px",
              borderRadius: "3px",
              backgroundColor: i === current ? tmpl.accent : `${tmpl.stone}60`,
              transition: "all 300ms ease",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* Tap hint (first card only) */}
      {current === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-3 text-xs"
          style={{ color: tmpl.stone, fontFamily: "var(--font-sans)" }}
        >
          Tap to continue
        </motion.p>
      )}
    </div>
  );
}
