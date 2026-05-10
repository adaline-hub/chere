"use client";

import { motion } from "framer-motion";
import type { TributeCreation } from "@/lib/mock/tribute-data";

const TEMPLATES = {
  "warm-linen": { bg: "#F5F0EB", text: "#2A2420", accent: "#C4A97D", stone: "#8B7D72", surface: "#EDE7DF" },
  "soft-sage": { bg: "#F2F5F0", text: "#2A2420", accent: "#A8B5A0", stone: "#7A8C76", surface: "#E5EAE3" },
  "midnight-gold": { bg: "#1A1714", text: "#F5F0EB", accent: "#C4A97D", stone: "#A09080", surface: "#232019" },
} as const;

type TemplateDef = { bg: string; text: string; accent: string; stone: string; surface: string };

function PhotoBlock({ url, caption, tmpl }: { url: string; caption: string; tmpl: TemplateDef }) {
  return (
    <div className="w-full">
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{
          aspectRatio: "4/3",
          background: url
            ? `url(${url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${tmpl.surface}, ${tmpl.accent}30)`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        }}
      />
      {caption && (
        <p
          className="text-center mt-3 text-sm"
          style={{ fontFamily: "var(--font-sans)", color: tmpl.stone }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

function isQuote(para: string) {
  return para.trim().startsWith('"');
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 as const },
  transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

export default function ScrollytellingRenderer({ creation }: { creation: TributeCreation }) {
  const tmpl = TEMPLATES[creation.templateId] ?? TEMPLATES["warm-linen"];
  const paragraphs = creation.generatedText.split(/\n\n+/).filter((p) => p.trim());
  const photos = creation.photos.filter(() => true); // keep all, graceful empty

  // Interleave: after every 2 text paragraphs, insert a photo
  const sections: Array<{ kind: "text"; content: string } | { kind: "photo"; index: number }> = [];
  let photoIndex = 0;
  paragraphs.forEach((para, i) => {
    sections.push({ kind: "text", content: para });
    if ((i + 1) % 2 === 0 && photoIndex < photos.length) {
      sections.push({ kind: "photo", index: photoIndex++ });
    }
  });
  while (photoIndex < photos.length) {
    sections.push({ kind: "photo", index: photoIndex++ });
  }

  const firstPara = paragraphs[0] ?? "";
  const remainingSections = sections.slice(1); // first para is the hero

  return (
    <div style={{ backgroundColor: tmpl.bg, minHeight: "100vh" }}>
      {/* Hero section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-center px-8"
        style={{ minHeight: "100vh" }}
      >
        <p
          className="text-center leading-relaxed max-w-2xl"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            color: tmpl.text,
            lineHeight: 1.5,
          }}
        >
          {firstPara}
        </p>
      </motion.section>

      {/* Remaining sections */}
      <div className="pb-24">
        {remainingSections.map((section, i) => {
          if (section.kind === "photo") {
            const photo = photos[section.index];
            if (!photo) return null;
            return (
              <motion.section
                key={`photo-${section.index}`}
                {...fadeUp}
                className="px-4 md:px-12 py-16 max-w-2xl mx-auto"
              >
                <PhotoBlock url={photo.url} caption={photo.caption} tmpl={tmpl} />
              </motion.section>
            );
          }

          const para = section.content;
          const quote = isQuote(para);

          return (
            <motion.section
              key={`text-${i}`}
              {...fadeUp}
              className="mx-auto py-12 px-8"
              style={{ maxWidth: "640px" }}
            >
              {quote ? (
                <blockquote
                  style={{
                    borderLeft: `3px solid ${tmpl.accent}`,
                    paddingLeft: "1.25rem",
                    fontStyle: "italic",
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.125rem",
                    lineHeight: 1.75,
                    color: tmpl.text,
                  }}
                >
                  {para}
                </blockquote>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.125rem",
                    lineHeight: 1.85,
                    color: tmpl.text,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {para}
                </p>
              )}
            </motion.section>
          );
        })}

        {/* Gift moment */}
        {creation.giftMoment && (
          <motion.section
            {...fadeUp}
            className="mx-auto py-12 px-8 max-w-xl"
          >
            <p
              className="text-center mb-4"
              style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", color: tmpl.accent, letterSpacing: "0.1em" }}
            >
              And one more thing...
            </p>
            <div
              className="rounded-xl p-6"
              style={{
                border: `1px solid ${tmpl.accent}50`,
                backgroundColor: `${tmpl.accent}0D`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: tmpl.text }}>
                {creation.giftMoment.description}
              </p>
              {creation.giftMoment.message && (
                <p className="mt-2 text-sm" style={{ color: tmpl.stone }}>
                  {creation.giftMoment.message}
                </p>
              )}
            </div>
          </motion.section>
        )}

        {/* Dedication */}
        {creation.dedicationMessage && (
          <motion.section
            {...fadeUp}
            className="text-center py-16 px-8"
          >
            <p
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: "1.5rem",
                color: tmpl.accent,
              }}
            >
              {creation.dedicationMessage}
            </p>
          </motion.section>
        )}

        {/* Footer */}
        <footer className="text-center pt-12 pb-16 px-8">
          <div
            className="mx-auto mb-8"
            style={{
              height: "1px",
              maxWidth: "120px",
              backgroundColor: tmpl.accent,
              opacity: 0.4,
            }}
          />
          {creation.tier === "free" && (
            <p
              className="text-xs mb-3"
              style={{ fontFamily: "var(--font-sans)", color: tmpl.stone }}
            >
              Made with Chère
            </p>
          )}
          <a
            href="https://chere.app"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.875rem",
              color: tmpl.accent,
            }}
          >
            Make one for someone you love →
          </a>
        </footer>
      </div>
    </div>
  );
}
