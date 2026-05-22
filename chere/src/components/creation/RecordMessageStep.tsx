"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { AudioMode } from "@/stores/creation-store";
import VoiceRecorder from "@/components/audio/VoiceRecorder";

const MODE_OPTIONS: { value: AudioMode; label: string; description: string; available: boolean }[] = [
  {
    value: "dedication",
    label: "Record your voice",
    description: "Leave a short spoken message — plays on the closing screen of the gift.",
    available: true,
  },
  {
    value: "tts",
    label: "AI narration",
    description: "A warm AI voice reads your tribute. No recording needed.",
    available: true,
  },
  {
    value: "none",
    label: "Skip audio",
    description: "Keep it text only.",
    available: true,
  },
];

const RECORDING_PROMPTS = [
  "Try saying what you wish you'd told them more often.",
  "Tell them what they mean to you, in one breath.",
  "Open with their name. Then say the first thing that comes to mind.",
  "Say one thing the words on the page can't quite capture.",
];

export default function RecordMessageStep() {
  const {
    audioMode,
    setAudioMode,
    audioDedication,
    setAudioDedication,
    recipientName,
    creationId,
    setStep,
  } = useCreationStore();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [ttsStatus, setTtsStatus] = useState<"idle" | "generating" | "ready" | "error">("idle");
  const ttsRequestedFor = useRef<string | null>(null);

  function pickPrompt() {
    setPromptIdx((i) => (i + 1) % RECORDING_PROMPTS.length);
  }

  async function handleSave(blob: Blob, durationMs: number) {
    if (!creationId) {
      setUploadError("Save your tribute first — we couldn't find a creation ID.");
      return;
    }
    setUploadError(null);

    const form = new FormData();
    form.append("file", blob, `dedication-${Date.now()}.webm`);
    form.append("creation_id", creationId);
    form.append("kind", "dedication");
    form.append("duration_ms", String(durationMs));

    const res = await fetch("/api/audio/upload", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Upload failed (${res.status})`);
    }
    const data = (await res.json()) as {
      id: string;
      storage_path: string;
      transcript: string | null;
      transcript_status: "completed" | "failed" | "pending" | "skipped";
    };

    setAudioDedication({
      id: data.id,
      storagePath: data.storage_path,
      durationMs,
      transcript: data.transcript,
      transcriptStatus: data.transcript_status,
    });
  }

  function clearDedication() {
    setAudioDedication(null);
  }

  // Auto-generate MiniMax TTS once the user picks the AI narration mode, so
  // the audio URL exists by the time they reach the preview/recipient view.
  useEffect(() => {
    if (audioMode !== "tts") return;
    if (!creationId) return;
    if (ttsRequestedFor.current === creationId) return;
    ttsRequestedFor.current = creationId;
    setTtsStatus("generating");
    fetch("/api/audio/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creationId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          setTtsStatus("error");
          return;
        }
        await res.json();
        setTtsStatus("ready");
      })
      .catch(() => setTtsStatus("error"));
  }, [audioMode, creationId]);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-24">
      <div className="w-full max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl text-espresso text-center mb-3"
        >
          Record a message
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-10 leading-relaxed"
        >
          Give {recipientName || "them"} your voice. They&apos;ll hear it before they see the gift.
        </motion.p>

        {/* Mode picker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {MODE_OPTIONS.map((opt) => {
            const selected = audioMode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAudioMode(opt.value)}
                disabled={!opt.available}
                className="text-left rounded-xl px-4 py-4 transition-all"
                style={{
                  backgroundColor: "var(--color-cream)",
                  border: "2px solid",
                  borderColor: selected ? "var(--color-muted-gold)" : "transparent",
                  boxShadow: selected ? "var(--shadow-elevated)" : "var(--shadow-card)",
                  transform: selected ? "translateY(-2px)" : "none",
                  cursor: opt.available ? "pointer" : "default",
                  opacity: opt.available ? 1 : 0.5,
                }}
              >
                <p
                  className="font-serif text-base mb-1"
                  style={{ color: "var(--color-espresso)" }}
                >
                  {opt.label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-stone)" }}>
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Mode-specific body */}
        {audioMode === "dedication" && (
          <div className="mb-10">
            {audioDedication ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-6 py-6 flex flex-col gap-3 items-center"
                style={{
                  backgroundColor: "var(--color-cream)",
                  border: "1px solid var(--color-parchment)",
                }}
              >
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: "var(--color-warm-gray)", letterSpacing: "0.08em" }}
                >
                  Saved
                </p>
                <p
                  className="font-serif text-base"
                  style={{ color: "var(--color-espresso)" }}
                >
                  Your message is in.
                </p>
                {audioDedication.transcript && (
                  <p
                    className="text-sm text-center mt-1 mb-1 max-w-md"
                    style={{ color: "var(--color-stone)", fontStyle: "italic" }}
                  >
                    &ldquo;{audioDedication.transcript}&rdquo;
                  </p>
                )}
                {audioDedication.transcriptStatus === "failed" && (
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-warm-gray)" }}
                  >
                    Transcript couldn&apos;t be generated, but your audio is saved.
                  </p>
                )}
                <button
                  type="button"
                  onClick={clearDedication}
                  className="text-sm mt-2 underline"
                  style={{ color: "var(--color-stone)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Record a different one
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={pickPrompt}
                  className="text-sm italic text-center max-w-md"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-stone)",
                    cursor: "pointer",
                  }}
                  aria-label="Show another suggestion"
                >
                  💡 {RECORDING_PROMPTS[promptIdx]}
                  <span style={{ display: "block", fontSize: "0.65rem", color: "var(--color-warm-gray)", marginTop: 4 }}>
                    Tap for another suggestion
                  </span>
                </button>
                <VoiceRecorder onSave={handleSave} maxDurationMs={60_000} />
                {uploadError && (
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-error, #B14545)" }}
                  >
                    {uploadError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {audioMode === "tts" && (
          <div
            className="mb-10 rounded-2xl px-6 py-6 text-center"
            style={{
              backgroundColor: "var(--color-cream)",
              border: "1px solid var(--color-parchment)",
            }}
          >
            <p
              className="font-serif text-base mb-2"
              style={{ color: "var(--color-espresso)" }}
            >
              AI narration selected
            </p>
            <p
              className="text-sm mb-3"
              style={{ color: "var(--color-stone)" }}
            >
              A natural voice will read your tribute aloud.
            </p>
            <p
              className="text-xs"
              style={{
                color:
                  ttsStatus === "ready"
                    ? "var(--color-sage-green, #6BA38A)"
                    : ttsStatus === "error"
                    ? "var(--color-error, #B14545)"
                    : "var(--color-warm-gray)",
              }}
            >
              {ttsStatus === "generating" && "Generating narration..."}
              {ttsStatus === "ready" && "✓ Narration ready"}
              {ttsStatus === "error" && "Couldn't generate narration. We'll try again at preview."}
              {ttsStatus === "idle" && "Preparing..."}
            </p>
          </div>
        )}

        {audioMode === "none" && (
          <div
            className="mb-10 rounded-2xl px-6 py-6 text-center"
            style={{
              backgroundColor: "var(--color-cream)",
              border: "1px solid var(--color-parchment)",
            }}
          >
            <p
              className="text-sm"
              style={{ color: "var(--color-stone)" }}
            >
              No audio. {recipientName ? `${recipientName} will read your tribute.` : "The recipient will read your tribute."}
            </p>
          </div>
        )}

        {/* Continue */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setStep("preview")}
            className="btn-gold text-base px-10 py-4"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
