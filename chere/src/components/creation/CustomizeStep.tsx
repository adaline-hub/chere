"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";

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
  const hasGenerated = useRef(false);

  async function generate() {
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
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = (await res.json()) as { text: string };
      setGeneratedText(data.text);
      setEditedText(null);
    } catch {
      setError("Something went wrong. Let's try again.");
    } finally {
      setIsGenerating(false);
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
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl text-espresso text-center mb-3"
        >
          {isGenerating ? "Writing your tribute..." : "Here's what we wrote"}
        </motion.h1>

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
              {/* Animated gold scanning line */}
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

              {/* Rotating message */}
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
                  <button onClick={generate} className="btn-secondary text-sm">
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

                  {/* Text editor */}
                  <textarea
                    value={displayText}
                    onChange={(e) => setEditedText(e.target.value)}
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
                    <button
                      onClick={generate}
                      className="text-xs transition-colors duration-200"
                      style={{ color: "var(--color-stone)" }}
                    >
                      Regenerate ↺
                    </button>
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

                  {/* Continue */}
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
    </div>
  );
}
