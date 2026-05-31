"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import StepHeader from "@/components/creation/StepHeader";

const LOADING_MESSAGES = [
  "Reading your memories...",
  "Finding the words...",
  "Listening to your story...",
  "Crafting something just for them...",
];

const TEMPLATES = [
  { id: "warm-linen", label: "Warm Linen", bg: "#F5F0EB" },
  { id: "soft-sage", label: "Soft Sage", bg: "#F2F5F0" },
  { id: "midnight-gold", label: "Midnight Gold", bg: "#1A1714" },
];

const TONE_OPTIONS = [
  { value: "default", label: "As written" },
  { value: "playful", label: "More playful" },
  { value: "poetic", label: "More poetic" },
  { value: "concise", label: "Shorter & sweeter" },
] as const;

type Tone = (typeof TONE_OPTIONS)[number]["value"];

export default function CustomizeStep() {
  const {
    relationshipType,
    recipientName,
    interviewAnswers,
    photos,
    tier,
    generatedText,
    setGeneratedText,
    editedText,
    setEditedText,
    dedicationMessage,
    setDedicationMessage,
    templateId,
    setTemplateId,
    isGenerating,
    setIsGenerating,
    setStep,
  } = useCreationStore();

  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [selectedTone, setSelectedTone] = useState<Tone>("default");
  const [pendingTone, setPendingTone] = useState<Tone | null>(null);
  const hasGenerated = useRef(false);
  const toneCacheRef = useRef<Record<string, string>>({});

  function hydrateFromCache(tone: Tone) {
    const cachedText = toneCacheRef.current[tone];
    if (!cachedText) return false;
    setGeneratedText(cachedText);
    setEditedText(null);
    setSelectedTone(tone);
    return true;
  }

  async function generate(tone: Tone = "default") {
    if (hydrateFromCache(tone)) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relationshipType,
          recipientName,
          interviewAnswers,
          photoDescriptions: photos.map((p) => p.caption).filter(Boolean),
          tier,
          tone,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = (await res.json()) as { text: string };
      toneCacheRef.current[tone] = data.text;
      setGeneratedText(data.text);
      setEditedText(null);
      setSelectedTone(tone);
    } catch {
      setError("Something went wrong. Let's try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleToneSelect(tone: Tone) {
    if (tone === selectedTone) return;
    if (hydrateFromCache(tone)) return;
    if (editedText) {
      setPendingTone(tone);
    } else {
      generate(tone);
    }
  }

  function confirmRegenerate() {
    if (pendingTone) {
      generate(pendingTone);
      setPendingTone(null);
    }
  }

  useEffect(() => {
    if (!hasGenerated.current && !generatedText) {
      hasGenerated.current = true;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const displayText = editedText ?? generatedText;
  const wordCount = displayText.split(/\s+/).filter(Boolean).length;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl">
        <StepHeader
          step="customize"
          title={isGenerating ? "Writing your tribute..." : "Here's what we wrote"}
        />

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center mt-16 gap-10"
            >
              <div
                className="relative w-48 overflow-hidden"
                style={{ height: "1px", backgroundColor: "var(--color-parchment)" }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 w-24"
                  style={{ backgroundColor: "var(--color-muted-gold)" }}
                  animate={{ x: ["-96px", "192px"] }}
                  transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
                />
              </div>

              <div style={{ height: "24px" }} className="overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-sm text-stone text-center"
                  >
                    {LOADING_MESSAGES[messageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {error ? (
                <div className="flex flex-col items-center mt-12 gap-5">
                  <p className="text-sm text-center" style={{ color: "var(--color-warm-gray)" }}>
                    {error}
                  </p>
                  <button onClick={() => generate(selectedTone)} className="btn-secondary text-sm">
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-stone text-center mb-8 leading-relaxed"
                  >
                    Edit it until it sounds like you.
                  </motion.p>

                  <textarea
                    value={displayText}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      toneCacheRef.current[selectedTone] = nextValue;
                      setEditedText(nextValue);
                    }}
                    className="textarea w-full mb-2"
                    style={{
                      minHeight: "280px",
                      fontFamily: "var(--font-serif)",
                      lineHeight: "1.8",
                      fontSize: "0.9375rem",
                    }}
                  />
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
                      {wordCount} words
                    </span>
                  </div>

                  {/* Tone selection */}
                  <div className="mb-8">
                    <p
                      className="font-serif text-sm text-center mb-4"
                      style={{ color: "var(--color-espresso)" }}
                    >
                      Try a different tone
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {TONE_OPTIONS.map((opt) => {
                        const active = selectedTone === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleToneSelect(opt.value)}
                            className="text-sm px-4 py-2 rounded-full transition-all duration-200"
                            style={{
                              backgroundColor: active ? "var(--color-espresso)" : "var(--color-parchment)",
                              color: active ? "var(--color-cream)" : "var(--color-espresso)",
                              border: "1px solid",
                              borderColor: active ? "var(--color-espresso)" : "var(--color-parchment)",
                            }}
                            onMouseEnter={(e) => {
                              if (!active) {
                                e.currentTarget.style.borderColor = "var(--color-warm-gray)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!active) {
                                e.currentTarget.style.borderColor = "var(--color-parchment)";
                              }
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dedication */}
                  <div className="mb-8">
                    <label className="block text-xs mb-2" style={{ color: "var(--color-stone)" }}>
                      Add a dedication (optional)
                    </label>
                    <input
                      type="text"
                      value={dedicationMessage}
                      onChange={(e) => setDedicationMessage(e.target.value)}
                      placeholder={`For ${recipientName || "you"}, with everything I have.`}
                      className="input"
                    />
                  </div>

                  {/* Music — placeholder */}
                  <div
                    className="rounded-xl p-5 mb-8"
                    style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-card)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "var(--color-stone)" }}>
                      Background music
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
                      Curated soundscapes coming soon.
                    </p>
                  </div>

                  {/* Template swatches */}
                  <div className="mb-10">
                    <p className="text-sm text-stone text-center mb-5">Template</p>
                    <div className="flex justify-center gap-6">
                      {TEMPLATES.map((tmpl) => {
                        const active = templateId === tmpl.id;
                        return (
                          <button
                            key={tmpl.id}
                            onClick={() => setTemplateId(tmpl.id)}
                            className="flex flex-col items-center gap-2 cursor-pointer"
                          >
                            <div
                              className="rounded-full transition-all duration-300"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: tmpl.bg,
                                border: "3px solid",
                                borderColor: active ? "var(--color-muted-gold)" : "transparent",
                                boxShadow: active
                                  ? "0 0 0 1px var(--color-muted-gold)"
                                  : "var(--shadow-card)",
                              }}
                            />
                            <span
                              className="text-xs transition-colors duration-300"
                              style={{
                                color: active ? "var(--color-espresso)" : "var(--color-stone)",
                              }}
                            >
                              {tmpl.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {displayText.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="flex justify-center"
                    >
                      <button
                        onClick={() => setStep("preview")}
                        className="btn-gold text-base px-10 py-4"
                      >
                        Preview
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation dialog — shown when regenerating over manual edits */}
      <AnimatePresence>
        {pendingTone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-6"
            style={{ backgroundColor: "rgba(42,36,32,0.5)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-2xl p-8"
              style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-card)" }}
            >
              <p
                className="font-serif text-lg text-center mb-2"
                style={{ color: "var(--color-espresso)" }}
              >
                Replace your edits?
              </p>
              <p
                className="text-sm text-center mb-8"
                style={{ color: "var(--color-stone)" }}
              >
                You&apos;ve made edits. Switching tones will replace them.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmRegenerate} className="btn-gold w-full">
                  Switch tone
                </button>
                <button
                  onClick={() => setPendingTone(null)}
                  className="text-sm text-center transition-colors duration-200"
                  style={{ color: "var(--color-stone)" }}
                >
                  Keep my edits
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
