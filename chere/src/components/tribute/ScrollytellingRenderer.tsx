"use client";

import { motion } from "framer-motion";
import type { TributeCreation } from "@/lib/mock/tribute-data";

const TEMPLATES = {
  "warm-linen":    { bg: "#F5F0EB", text: "#2A2420", accent: "#C4A97D", stone: "#8B7D72", surface: "#EDE7DF" },
  "soft-sage":     { bg: "#F2F5F0", text: "#2A2420", accent: "#A8B5A0", stone: "#7A8C76", surface: "#E5EAE3" },
  "midnight-gold": { bg: "#1A1714", text: "#F5F0EB", accent: "#C4A97D", stone: "#A09080", surface: "#232019" },
} as const;

type TemplateDef = { bg: string; text: string; accent: string; stone: string; surface: string };

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 as const },
  transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const fadeIn = {
  initial: { opacity: 0, scale: 0.97 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.1 as const },
  transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

function Divider({ tmpl }: { tmpl: TemplateDef }) {
  return (
    <div className="flex items-center justify-center py-2">
      <div style={{ width: "80px", height: "1px", backgroundColor: tmpl.accent, opacity: 0.35 }} />
    </div>
  );
}

function PhotoSection({ photo, tmpl }: { photo: { url: string; caption: string }; tmpl: TemplateDef }) {
  return (
    <motion.section {...fadeIn} className="px-4 md:px-8 py-10">
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 12px 48px rgba(0,0,0,0.14), 0 3px 10px rgba(0,0,0,0.07)",
        }}
      >
        {photo.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.caption || ""}
            style={{
              width: "100%",
              maxHeight: "70vh",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "340px",
              background: `linear-gradient(135deg, ${tmpl.surface}, ${tmpl.accent}30)`,
            }}
          />
        )}
      </div>
      {photo.caption && (
        <p
          className="text-center mt-4"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8125rem",
            color: tmpl.stone,
            maxWidth: "480px",
            margin: "0.75rem auto 0",
          }}
        >
          {photo.caption}
        </p>
      )}
    </motion.section>
  );
}

function TextSection({ para, tmpl }: { para: string; tmpl: TemplateDef }) {
  const isQuote = para.trim().startsWith('"');
  return (
    <motion.section
      {...fadeUp}
      className="mx-auto px-8 py-14"
      style={{ maxWidth: "600px" }}
    >
      {isQuote ? (
        <blockquote
          style={{
            borderLeft: `3px solid ${tmpl.accent}66`,
            paddingLeft: "1.5rem",
            fontStyle: "italic",
            fontFamily: "var(--font-serif)",
            fontSize: "1.375rem",
            lineHeight: 1.7,
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
}

export default function ScrollytellingRenderer({ creation }: { creation: TributeCreation }) {
  const tmpl = TEMPLATES[creation.templateId] ?? TEMPLATES["warm-linen"];
  const paragraphs = creation.generatedText.split(/\n\n+/).filter((p) => p.trim());
  const photos = creation.photos;

  // Interleave: every 2 paragraphs, insert a photo
  type Section =
    | { kind: "text"; content: string }
    | { kind: "photo"; photo: { url: string; caption: string } };

  const sections: Section[] = [];
  let photoIndex = 0;
  paragraphs.forEach((para, i) => {
    sections.push({ kind: "text", content: para });
    if ((i + 1) % 2 === 0 && photoIndex < photos.length) {
      sections.push({ kind: "photo", photo: photos[photoIndex++] });
    }
  });
  while (photoIndex < photos.length) {
    sections.push({ kind: "photo", photo: photos[photoIndex++] });
  }

  const heroText = paragraphs[0] ?? "";
  const bodySections = sections.slice(1);

  return (
    <div style={{ backgroundColor: tmpl.bg, minHeight: "100vh" }}>
      {/* Hero — full viewport */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.85 }}
        className="relative flex flex-col items-center justify-center px-8"
        style={{ minHeight: "100vh", paddingTop: "20%" }}
      >
        <p
          className="text-center max-w-2xl"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.75rem, 4.5vw, 2.375rem)",
            lineHeight: 1.5,
            color: tmpl.text,
          }}
        >
          {heroText}
        </p>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 flex flex-col items-center gap-1"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ width: "1px", height: "32px", backgroundColor: tmpl.accent, opacity: 0.4 }} />
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `6px solid ${tmpl.accent}`,
              opacity: 0.4,
            }}
          />
        </motion.div>
      </motion.section>

      {/* Body */}
      <div className="pb-24">
        {bodySections.map((section, i) => {
          const prev = bodySections[i - 1];
          const needsDivider =
            i > 0 &&
            prev !== undefined &&
            section.kind !== prev.kind;

          return (
            <div key={i}>
              {needsDivider && (
                <div className="mx-auto" style={{ maxWidth: "600px", padding: "0 2rem" }}>
                  <Divider tmpl={tmpl} />
                </div>
              )}
              {section.kind === "photo" ? (
                <PhotoSection photo={section.photo} tmpl={tmpl} />
              ) : (
                <TextSection para={section.content} tmpl={tmpl} />
              )}
            </div>
          );
        })}

        {/* Gift moment */}
        {creation.giftMoment && (
          <>
            <div className="mx-auto" style={{ maxWidth: "600px", padding: "0 2rem" }}>
              <Divider tmpl={tmpl} />
            </div>
            <motion.section {...fadeUp} className="mx-auto py-12 px-8" style={{ maxWidth: "520px" }}>
              <p
                className="text-center mb-5"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.875rem",
                  color: tmpl.accent,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                And one more thing...
              </p>
              <div
                className="rounded-xl p-6"
                style={{
                  border: `1px solid ${tmpl.accent}50`,
                  backgroundColor: `${tmpl.accent}0D`,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  borderTop: `3px solid ${tmpl.accent}`,
                }}
              >
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", lineHeight: 1.7, color: tmpl.text }}>
                  {creation.giftMoment.description}
                </p>
                {creation.giftMoment.message && (
                  <p className="mt-3 text-sm italic" style={{ color: tmpl.stone }}>
                    {creation.giftMoment.message}
                  </p>
                )}
              </div>
            </motion.section>
          </>
        )}

        {/* Dedication */}
        {creation.dedicationMessage && (
          <motion.section {...fadeUp} className="text-center px-8" style={{ paddingTop: "6rem", paddingBottom: "3rem" }}>
            <p
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: "1.5rem",
                color: tmpl.accent,
                lineHeight: 1.6,
              }}
            >
              {creation.dedicationMessage}
            </p>
          </motion.section>
        )}

        {/* Footer */}
        <footer className="text-center pt-10 pb-16 px-8">
          <Divider tmpl={tmpl} />
          <div className="mt-8 space-y-3">
            {creation.tier === "free" && (
              <p className="text-xs" style={{ fontFamily: "var(--font-serif)", color: tmpl.stone }}>
                Made with{" "}
                <a href="https://chere.app" style={{ color: tmpl.accent }}>Chère</a>
              </p>
            )}
            <a
              href="https://chere.app/create"
              style={{ fontFamily: "var(--font-serif)", fontSize: "0.9375rem", color: tmpl.accent, display: "block" }}
            >
              Make one for someone you love →
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
