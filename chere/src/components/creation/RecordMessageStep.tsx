"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { AudioMode } from "@/stores/creation-store";
import VoiceRecorder from "@/components/audio/VoiceRecorder";
import { getScene, SCENE_HOTSPOTS } from "@/lib/companion/hotspots";

const MODE_OPTIONS: { value: AudioMode; label: string; description: string; companionOnly?: boolean }[] = [
  {
    value: "dedication",
    label: "Record your voice",
    description: "Leave a short spoken message — plays on the closing screen of the gift.",
  },
  {
    value: "memories",
    label: "Voice memories",
    description: "Record one short clip per object in the scene. Tap an object → hear your voice tell its story.",
    companionOnly: true,
  },
  {
    value: "none",
    label: "Skip audio",
    description: "Keep it text only.",
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
    audioMemoryClips,
    setAudioMemoryClip,
    removeAudioMemoryClip,
    recipientName,
    relationshipType,
    outputFormat,
    creationId,
    setStep,
  } = useCreationStore();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [activeMemorySlotId, setActiveMemorySlotId] = useState<string | null>(null);
  const [memorySuggestions, setMemorySuggestions] = useState<Record<string, string>>({});
  const [memorySuggestionLoading, setMemorySuggestionLoading] = useState<Record<string, boolean>>({});
  const [memorySuggestionFallbackIdx, setMemorySuggestionFallbackIdx] = useState<Record<string, number>>({});

  const isCompanion = outputFormat === "companion";
  const scene = getScene(relationshipType ?? "");
  const hotspots = SCENE_HOTSPOTS[scene];
  const recordedCount = hotspots.filter((hs) => !!audioMemoryClips[hs.id]).length;

  const availableModes = useMemo(() => {
    return MODE_OPTIONS.filter((opt) => (opt.companionOnly ? isCompanion : true));
  }, [isCompanion]);

  function pickPrompt() {
    setPromptIdx((i) => (i + 1) % RECORDING_PROMPTS.length);
  }

  function getFallbackPrompt(slotId: string): string {
    const idx = memorySuggestionFallbackIdx[slotId] ?? Math.abs(slotId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % RECORDING_PROMPTS.length;
    return RECORDING_PROMPTS[idx];
  }

  async function fetchMemorySuggestion(slotId: string, refresh = false) {
    if (!creationId) return;

    setMemorySuggestionLoading((prev) => ({ ...prev, [slotId]: true }));
    try {
      const res = await fetch("/api/ai/recording-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          hotspot_id: slotId,
          refresh,
        }),
      });

      if (!res.ok) throw new Error(`suggestion failed (${res.status})`);

      const data = (await res.json()) as { suggestion?: string };
      if (!data.suggestion) throw new Error("missing suggestion");

      setMemorySuggestions((prev) => ({ ...prev, [slotId]: data.suggestion! }));
    } catch {
      // Silent fallback to existing static prompts.
      setMemorySuggestionFallbackIdx((prev) => ({
        ...prev,
        [slotId]: ((prev[slotId] ?? 0) + 1) % RECORDING_PROMPTS.length,
      }));
      setMemorySuggestions((prev) => ({ ...prev, [slotId]: `Try saying: ${getFallbackPrompt(slotId)}` }));
    } finally {
      setMemorySuggestionLoading((prev) => ({ ...prev, [slotId]: false }));
    }
  }

  async function uploadClip(blob: Blob, durationMs: number, kind: "dedication" | "memory", slotId?: string) {
    if (!creationId) {
      setUploadError("Save your tribute first — we couldn't find a creation ID.");
      return null;
    }
    setUploadError(null);

    const form = new FormData();
    form.append("file", blob, `${kind}-${slotId ?? "dedication"}-${Date.now()}.webm`);
    form.append("creation_id", creationId);
    form.append("kind", kind);
    form.append("duration_ms", String(durationMs));
    if (slotId) form.append("memory_slot_id", slotId);

    const res = await fetch("/api/audio/upload", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Upload failed (${res.status})`);
    }
    return (await res.json()) as {
      id: string;
      storage_path: string;
      transcript: string | null;
      transcript_status: "completed" | "failed" | "pending" | "skipped";
    };
  }

  async function handleSaveDedication(blob: Blob, durationMs: number) {
    const data = await uploadClip(blob, durationMs, "dedication");
    if (!data) return;
    setAudioDedication({
      id: data.id,
      storagePath: data.storage_path,
      durationMs,
      transcript: data.transcript,
      transcriptStatus: data.transcript_status,
    });
  }

  async function handleSaveMemory(slotId: string, blob: Blob, durationMs: number) {
    const data = await uploadClip(blob, durationMs, "memory", slotId);
    if (!data) return;
    setAudioMemoryClip(slotId, {
      id: data.id,
      storagePath: data.storage_path,
      durationMs,
      transcript: data.transcript,
      transcriptStatus: data.transcript_status,
    });
    setActiveMemorySlotId(null);
  }

  function clearDedication() {
    setAudioDedication(null);
  }

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {availableModes.map((opt) => {
            const selected = audioMode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAudioMode(opt.value)}
                className="text-left rounded-xl px-4 py-4 transition-all"
                style={{
                  backgroundColor: "var(--color-cream)",
                  border: "2px solid",
                  borderColor: selected ? "var(--color-muted-gold)" : "transparent",
                  boxShadow: selected ? "var(--shadow-elevated)" : "var(--shadow-card)",
                  transform: selected ? "translateY(-2px)" : "none",
                  cursor: "pointer",
                }}
              >
                <p className="font-serif text-base mb-1" style={{ color: "var(--color-espresso)" }}>
                  {opt.label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-stone)" }}>
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>

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
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-warm-gray)", letterSpacing: "0.08em" }}>
                  Saved
                </p>
                <p className="font-serif text-base" style={{ color: "var(--color-espresso)" }}>
                  Your message is in.
                </p>
                {audioDedication.transcript && (
                  <p className="text-sm text-center mt-1 mb-1 max-w-md" style={{ color: "var(--color-stone)", fontStyle: "italic" }}>
                    &ldquo;{audioDedication.transcript}&rdquo;
                  </p>
                )}
                {audioDedication.transcriptStatus === "failed" && (
                  <p className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
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
                  style={{ background: "none", border: "none", color: "var(--color-stone)", cursor: "pointer" }}
                  aria-label="Show another suggestion"
                >
                  💡 {RECORDING_PROMPTS[promptIdx]}
                  <span style={{ display: "block", fontSize: "0.65rem", color: "var(--color-warm-gray)", marginTop: 4 }}>
                    Tap for another suggestion
                  </span>
                </button>
                <VoiceRecorder onSave={handleSaveDedication} maxDurationMs={60_000} />
                {uploadError && <p className="text-xs" style={{ color: "var(--color-error, #B14545)" }}>{uploadError}</p>}
              </div>
            )}
          </div>
        )}

        {audioMode === "memories" && isCompanion && (
          <div className="mb-10">
            <div className="rounded-2xl px-5 py-5" style={{ backgroundColor: "var(--color-cream)", border: "1px solid var(--color-parchment)" }}>
              <p className="text-sm mb-4" style={{ color: "var(--color-stone)" }}>
                {recordedCount} of {hotspots.length} recorded
              </p>
              <div className="flex flex-col gap-3">
                {hotspots.map((spot) => {
                  const clip = audioMemoryClips[spot.id];
                  const isOpen = activeMemorySlotId === spot.id;
                  return (
                    <div key={spot.id} className="rounded-xl p-3" style={{ border: "1px solid var(--color-parchment)", backgroundColor: "rgba(255,255,255,0.4)" }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-serif text-sm" style={{ color: "var(--color-espresso)" }}>{spot.label}</p>
                          <p className="text-xs mt-1" style={{ color: clip ? "#4B7D4B" : "var(--color-warm-gray)" }}>
                            {clip ? "Recorded" : "Not yet"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (isOpen) {
                                setActiveMemorySlotId(null);
                                return;
                              }
                              setActiveMemorySlotId(spot.id);
                              void fetchMemorySuggestion(spot.id);
                            }}
                            className="text-xs px-3 py-2 rounded-lg"
                            style={{ border: "1px solid var(--color-parchment)", backgroundColor: "#fff", color: "var(--color-espresso)" }}
                          >
                            {clip ? "Re-record" : "Record"}
                          </button>
                          {clip && (
                            <button
                              type="button"
                              onClick={() => {
                                removeAudioMemoryClip(spot.id);
                                if (isOpen) setActiveMemorySlotId(null);
                              }}
                              className="text-xs px-3 py-2 rounded-lg"
                              style={{ border: "1px solid #D7B9B9", backgroundColor: "#fff", color: "#B14545" }}
                            >
                              Discard
                            </button>
                          )}
                        </div>
                      </div>

                      {clip?.transcript && (
                        <p className="text-xs mt-2" style={{ color: "var(--color-stone)", fontStyle: "italic" }}>
                          &ldquo;{clip.transcript}&rdquo;
                        </p>
                      )}

                      {isOpen && (
                        <div className="mt-3">
                          {memorySuggestionLoading[spot.id] ? (
                            <p className="text-xs italic mb-3" style={{ color: "var(--color-warm-gray)" }}>
                              💡 Coming up with an idea...
                            </p>
                          ) : (
                            <div
                              className="mb-3 rounded-lg px-3 py-3"
                              style={{
                                backgroundColor: "var(--color-cream)",
                                border: "1px solid var(--color-parchment)",
                              }}
                            >
                              <p className="text-sm italic font-serif" style={{ color: "var(--color-stone)" }}>
                                💡 {memorySuggestions[spot.id] ?? `Try saying: ${getFallbackPrompt(spot.id)}`}
                              </p>
                              <button
                                type="button"
                                onClick={() => void fetchMemorySuggestion(spot.id, true)}
                                className="text-xs mt-2 underline"
                                style={{ background: "none", border: "none", color: "var(--color-warm-gray)", cursor: "pointer" }}
                              >
                                Suggest another
                              </button>
                            </div>
                          )}
                          <VoiceRecorder onSave={(blob, ms) => handleSaveMemory(spot.id, blob, ms)} maxDurationMs={60_000} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {uploadError && <p className="text-xs mt-3" style={{ color: "var(--color-error, #B14545)" }}>{uploadError}</p>}
            </div>
          </div>
        )}

        {audioMode === "none" && (
          <div className="mb-10 rounded-2xl px-6 py-6 text-center" style={{ backgroundColor: "var(--color-cream)", border: "1px solid var(--color-parchment)" }}>
            <p className="text-sm" style={{ color: "var(--color-stone)" }}>
              No audio. {recipientName ? `${recipientName} will read your tribute.` : "The recipient will read your tribute."}
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <button type="button" onClick={() => setStep("preview")} className="btn-gold text-base px-10 py-4">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
