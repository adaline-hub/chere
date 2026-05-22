"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "idle" | "countdown" | "recording" | "review";

interface VoiceRecorderProps {
  maxDurationMs?: number;
  soft?: number; // 0..1 portion of max where we start nudging to wrap up
  helperText?: string;
  onSave: (blob: Blob, durationMs: number) => Promise<void>;
}

const DEFAULT_MAX = 60_000;

function fmt(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceRecorder({
  maxDurationMs = DEFAULT_MAX,
  soft = 0.5,
  helperText = "Tap to record. Speak naturally.",
  onSave,
}: VoiceRecorderProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const blobRef = useRef<Blob | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (cdRef.current) {
      clearInterval(cdRef.current);
      cdRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopAll, [stopAll]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function requestMic(): Promise<MediaStream | null> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Recording isn't supported in this browser.");
      return null;
    }
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError") setError("Microphone access denied. Enable it in your browser settings.");
      else if (name === "NotFoundError") setError("No microphone found.");
      else setError("Couldn't access the microphone.");
      return null;
    }
  }

  async function startCountdown() {
    setError(null);
    const stream = await requestMic();
    if (!stream) return;
    streamRef.current = stream;
    setPhase("countdown");
    setCountdown(3);
    let n = 3;
    cdRef.current = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        if (cdRef.current) clearInterval(cdRef.current);
        cdRef.current = null;
        beginRecording(stream);
      } else {
        setCountdown(n);
      }
    }, 800);
  }

  function beginRecording(stream: MediaStream) {
    chunksRef.current = [];
    const supports = (t: string) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t);
    const mimeType = supports("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : supports("audio/webm")
      ? "audio/webm"
      : supports("audio/mp4")
      ? "audio/mp4"
      : "";
    let rec: MediaRecorder;
    try {
      rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      setError("Audio recording isn't supported on this device.");
      setPhase("idle");
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const type = rec.mimeType || "audio/webm";
      const recordedBlob = new Blob(chunksRef.current, { type });
      blobRef.current = recordedBlob;
      setAudioUrl(URL.createObjectURL(recordedBlob));
      setPhase("review");
      stream.getTracks().forEach((t) => t.stop());
    };
    recorderRef.current = rec;
    rec.start();
    startedAtRef.current = Date.now();
    setPhase("recording");
    setElapsedMs(0);
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setElapsedMs(elapsed);
      if (elapsed >= maxDurationMs) stopRecording();
    }, 50);
  }

  function stopRecording() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function discard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    blobRef.current = null;
    setAudioUrl(null);
    setElapsedMs(0);
    setPhase("idle");
  }

  async function commit() {
    if (!blobRef.current) return;
    setSaving(true);
    try {
      await onSave(blobRef.current, elapsedMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the recording.");
      setSaving(false);
    }
  }

  const softLimit = elapsedMs > maxDurationMs * soft;

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="rounded-2xl px-6 py-8 flex flex-col items-center"
        style={{
          backgroundColor: "var(--color-cream)",
          border: "1px solid var(--color-parchment)",
        }}
      >
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4"
            >
              <button
                type="button"
                onClick={startCountdown}
                aria-label="Start recording"
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 84,
                  height: 84,
                  backgroundColor: "var(--color-muted-gold)",
                  color: "var(--color-cream)",
                  boxShadow: "0 10px 24px rgba(196,169,125,0.35)",
                  cursor: "pointer",
                  border: "none",
                  fontSize: "1.5rem",
                }}
              >
                <span aria-hidden="true">●</span>
              </button>
              <p
                className="text-sm text-center"
                style={{ color: "var(--color-stone)" }}
              >
                {helperText}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-warm-gray)" }}
              >
                Up to {Math.floor(maxDurationMs / 1000)} seconds
              </p>
            </motion.div>
          )}

          {phase === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.p
                key={countdown}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1.0, opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "4rem",
                  color: "var(--color-muted-gold)",
                  lineHeight: 1,
                }}
              >
                {countdown}
              </motion.p>
              <p className="text-sm" style={{ color: "var(--color-stone)" }}>
                Get ready...
              </p>
            </motion.div>
          )}

          {phase === "recording" && (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-5"
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1], opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: "#D85050",
                  display: "block",
                  marginTop: 12,
                }}
              />
              <p
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "2rem",
                  color: softLimit ? "var(--color-muted-gold)" : "var(--color-espresso)",
                  lineHeight: 1,
                  transition: "color 350ms ease",
                }}
              >
                {fmt(elapsedMs)}
              </p>
              <button
                type="button"
                onClick={stopRecording}
                aria-label="Stop recording"
                className="rounded-full px-6 py-3 text-sm"
                style={{
                  backgroundColor: "var(--color-espresso)",
                  color: "var(--color-cream)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Stop
              </button>
              <p
                className="text-xs"
                style={{ color: softLimit ? "var(--color-muted-gold)" : "var(--color-warm-gray)" }}
              >
                {softLimit
                  ? `Wrap up soon (${Math.max(0, Math.ceil((maxDurationMs - elapsedMs) / 1000))}s left)`
                  : "Recording…"}
              </p>
            </motion.div>
          )}

          {phase === "review" && audioUrl && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "var(--color-warm-gray)", letterSpacing: "0.08em" }}
              >
                Listen back
              </p>
              <audio
                controls
                src={audioUrl}
                className="w-full"
                style={{ maxWidth: "100%" }}
              />
              <p
                className="text-xs tabular-nums"
                style={{ color: "var(--color-stone)" }}
              >
                {fmt(elapsedMs)}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={discard}
                  disabled={saving}
                  className="text-sm px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--color-stone)",
                    border: "1px solid var(--color-parchment)",
                    cursor: saving ? "default" : "pointer",
                  }}
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={startCountdown}
                  disabled={saving}
                  className="text-sm px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--color-espresso)",
                    border: "1px solid var(--color-parchment)",
                    cursor: saving ? "default" : "pointer",
                  }}
                >
                  Re-record
                </button>
                <button
                  type="button"
                  onClick={commit}
                  disabled={saving}
                  className="btn-gold text-sm px-5 py-2"
                  style={{ cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? "Saving…" : "Keep"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p
            className="mt-4 text-xs text-center"
            style={{ color: "var(--color-error, #B14545)" }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
