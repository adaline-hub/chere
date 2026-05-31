"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import StepHeader from "@/components/creation/StepHeader";

type ClueTypeLocal = "text" | "emoji" | "riddle" | "photo";

interface LocalClue {
  id: string;
  clueNumber: number;
  clueType: ClueTypeLocal;
  content: string;
  scheduledAt: string;
}

const CLUE_TYPE_OPTIONS: { value: ClueTypeLocal; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "emoji", label: "Emoji" },
  { value: "riddle", label: "Riddle" },
  { value: "photo", label: "Photo" },
];

const CLUE_PLACEHOLDERS: Record<ClueTypeLocal, (n: number, total: number) => string> = {
  text: (n, total) =>
    n < Math.ceil(total / 2)
      ? "Something vague — a feeling, a season, a color..."
      : "Getting warmer... give a slightly more specific hint.",
  emoji: () => "One emoji that hints without giving it away...",
  riddle: () => "Write a riddle, or we'll generate one for you...",
  photo: () => "",
};

function makeBlankClue(n: number): LocalClue {
  return { id: crypto.randomUUID(), clueNumber: n, clueType: "text", content: "", scheduledAt: "" };
}

export default function ClueBuilder() {
  const { setDripCluesEnabled, setDripClues, setStep } = useCreationStore();

  const [enabled, setEnabled] = useState(false);
  const [clueCount, setClueCount] = useState<number | null>(null);
  const [clues, setClues] = useState<LocalClue[]>([]);
  const [aiNote, setAiNote] = useState(false);

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    if (!next) { setClueCount(null); setClues([]); }
  }

  function handleCountSelect(n: number) {
    setClueCount(n);
    setClues((prev) => {
      const updated: LocalClue[] = [];
      for (let i = 1; i <= n; i++) {
        updated.push(prev.find((c) => c.clueNumber === i) ?? makeBlankClue(i));
      }
      return updated;
    });
  }

  function updateClue(id: string, patch: Partial<LocalClue>) {
    setClues((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function handleContinue() {
    setDripCluesEnabled(enabled);
    if (enabled && clues.length > 0) {
      setDripClues(
        clues.map((c) => ({
          id: c.id,
          clueNumber: c.clueNumber,
          clueType: c.clueType,
          content: c.content,
          scheduledAt: c.scheduledAt || new Date().toISOString(),
        }))
      );
    }
    setStep("format");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl">
        <StepHeader step="clues" title="Want to build some anticipation?" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-10 leading-relaxed"
        >
          Send little clues before the big reveal. One a day, a week, or however you&apos;d like.
        </motion.p>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <button
            role="switch"
            aria-checked={enabled}
            onClick={handleToggle}
            className="relative flex-shrink-0 rounded-full transition-colors duration-400 focus:outline-none"
            style={{
              width: "48px",
              height: "26px",
              backgroundColor: enabled ? "var(--color-espresso)" : "var(--color-parchment)",
              transition: "background-color 400ms var(--ease-elegant)",
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 rounded-full"
              style={{
                width: "22px",
                height: "22px",
                backgroundColor: "var(--color-cream)",
                transform: enabled ? "translateX(22px)" : "translateX(0)",
                transition: "transform 400ms var(--ease-elegant)",
                boxShadow: "var(--shadow-subtle)",
              }}
            />
          </button>
          <span className="text-sm" style={{ color: enabled ? "var(--color-espresso)" : "var(--color-stone)" }}>
            {enabled ? "Send drip clues" : "Skip — reveal right away"}
          </span>
        </motion.div>

        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              {/* Clue count */}
              <div className="mb-8">
                <p className="text-sm text-stone text-center mb-4">How many clues?</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => {
                    const active = clueCount === n;
                    return (
                      <button
                        key={n}
                        onClick={() => handleCountSelect(n)}
                        className="w-10 h-10 rounded-full text-sm transition-all duration-300 cursor-pointer flex items-center justify-center"
                        style={{
                          backgroundColor: active ? "var(--color-espresso)" : "var(--color-cream)",
                          color: active ? "var(--color-cream)" : "var(--color-charcoal)",
                          border: "1px solid",
                          borderColor: active ? "var(--color-espresso)" : "var(--color-parchment)",
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clue cards */}
              <div className="space-y-6 mb-8">
                {clues.map((clue) => (
                  <div
                    key={clue.id}
                    className="rounded-xl p-6"
                    style={{
                      backgroundColor: "var(--color-cream)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <p
                      className="text-xs mb-4 tracking-[0.1em] uppercase"
                      style={{ color: "var(--color-muted-gold)" }}
                    >
                      Clue {clue.clueNumber}
                    </p>

                    {/* Clue type pills */}
                    <div className="flex gap-2 mb-4">
                      {CLUE_TYPE_OPTIONS.map((opt) => {
                        const active = clue.clueType === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => updateClue(clue.id, { clueType: opt.value, content: "" })}
                            className="py-1 px-3 rounded-full text-xs transition-all duration-200 cursor-pointer"
                            style={{
                              backgroundColor: active ? "var(--color-espresso)" : "transparent",
                              color: active ? "var(--color-cream)" : "var(--color-stone)",
                              border: "1px solid",
                              borderColor: active ? "var(--color-espresso)" : "var(--color-parchment)",
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Content input */}
                    {clue.clueType === "photo" ? (
                      <p className="text-sm" style={{ color: "var(--color-warm-gray)" }}>
                        Photo clues coming soon.
                      </p>
                    ) : (
                      <textarea
                        value={clue.content}
                        onChange={(e) => updateClue(clue.id, { content: e.target.value })}
                        placeholder={CLUE_PLACEHOLDERS[clue.clueType](clue.clueNumber, clues.length)}
                        className="textarea"
                        style={{ minHeight: "80px" }}
                      />
                    )}

                    {/* Scheduled date */}
                    <input
                      type="text"
                      value={clue.scheduledAt}
                      onChange={(e) => updateClue(clue.id, { scheduledAt: e.target.value })}
                      placeholder="e.g., 3 days before reveal"
                      className="input mt-3"
                      style={{ fontSize: "0.875rem" }}
                    />
                  </div>
                ))}
              </div>

              {/* Generate button */}
              {clueCount && clueCount > 0 && (
                <div className="flex justify-center mb-8">
                  <button
                    onClick={() => setAiNote(true)}
                    className="btn-secondary text-sm"
                  >
                    Generate clues for me
                  </button>
                </div>
              )}

              {aiNote && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-center mb-6"
                  style={{ color: "var(--color-warm-gray)" }}
                >
                  AI clue generation coming in Phase 5.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-center"
        >
          <button onClick={handleContinue} className="btn-gold text-base px-10 py-4">
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}
