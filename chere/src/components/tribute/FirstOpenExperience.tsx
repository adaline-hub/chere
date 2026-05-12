"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TEMPLATE_STYLES = {
  "warm-linen": { bg: "#F5F0EB", text: "#2A2420", stone: "#8B7D72", accent: "#C4A97D" },
  "soft-sage": { bg: "#F2F5F0", text: "#2A2420", stone: "#7A8C76", accent: "#A8B5A0" },
  "midnight-gold": { bg: "#1A1714", text: "#F5F0EB", stone: "#A09080", accent: "#C4A97D" },
} as const;

interface Props {
  recipientName: string;
  creatorName: string;
  templateId: "warm-linen" | "soft-sage" | "midnight-gold";
  onOpen: () => void;
}

export default function FirstOpenExperience({ recipientName, creatorName, templateId, onOpen }: Props) {
  const [opening, setOpening] = useState(false);
  const tmpl = TEMPLATE_STYLES[templateId] ?? TEMPLATE_STYLES["warm-linen"];

  function handleOpen() {
    setOpening(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        key="opener"
        initial={{ opacity: 1, scale: 1 }}
        animate={opening ? { opacity: 0, scale: 1.02 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        onAnimationComplete={() => { if (opening) onOpen(); }}
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: tmpl.bg, zIndex: 50 }}
      >
        {/* Chère wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: opening ? 0 : undefined }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <motion.p
            initial={{ y: 0 }}
            animate={{ y: -20 }}
            transition={{ delay: 1.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              letterSpacing: "0.25em",
              color: tmpl.accent,
            }}
          >
            Chère
          </motion.p>

          {/* "A gift for you" */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              color: tmpl.stone,
              marginTop: "0.5rem",
            }}
          >
            A gift for {recipientName || "you"}
          </motion.p>

          {/* "from {creatorName}" */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.8 }}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              color: tmpl.text,
              marginTop: "0.25rem",
            }}
          >
            from {creatorName}
          </motion.p>

          {/* Open button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1] }}
            transition={{ delay: 3.0, duration: 0.6 }}
            onClick={handleOpen}
            style={{
              marginTop: "2.5rem",
              fontFamily: "var(--font-serif)",
              fontSize: "1.125rem",
              color: tmpl.accent,
              background: "none",
              border: "none",
              borderBottom: `1px solid ${tmpl.accent}`,
              paddingBottom: "4px",
              cursor: "pointer",
              minHeight: "44px",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ delay: 3.6, duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Open
            </motion.span>
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
