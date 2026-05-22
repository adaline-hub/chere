"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RING_R = 18;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

interface AudioNarrationProps {
  audioUrl: string | null;
  tier: string;
  paused: boolean;
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
}

export default function AudioNarration({
  audioUrl,
  tier,
  paused,
  muted: mutedProp,
  onMutedChange,
}: AudioNarrationProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showGate, setShowGate] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const muted = mutedProp ?? localMuted;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPremium = tier === "premium" || tier === "deluxe";
  const hasAudio = !!audioUrl;

  // Pause when a memory card opens, resume when it closes.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !playing) return;
    if (paused) el.pause();
    else el.play().catch(() => setPlaying(false));
  }, [paused, playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  function toggleMuted() {
    const next = !muted;
    if (onMutedChange) onMutedChange(next);
    else setLocalMuted(next);
  }

  function handleTimeUpdate() {
    const el = audioRef.current;
    if (!el || !el.duration || !isFinite(el.duration)) return;
    setProgress(el.currentTime / el.duration);
  }

  function handleEnded() {
    setPlaying(false);
    setProgress(1);
  }

  function handleClick() {
    if (!isPremium) {
      setShowGate(true);
      if (gateTimer.current) clearTimeout(gateTimer.current);
      gateTimer.current = setTimeout(() => setShowGate(false), 3200);
      return;
    }
    const el = audioRef.current;
    if (!el || !hasAudio) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }

  const dashOffset = CIRCUMFERENCE - CIRCUMFERENCE * progress;

  // Hide entirely if not premium AND no audio. Premium without audio still shows
  // a disabled button so the user knows narration exists conceptually.
  if (!hasAudio && isPremium) return null;

  return (
    <div style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem", zIndex: 20, display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <AnimatePresence>
        {showGate && (
          <motion.div
            key="gate"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: 0,
              width: "188px",
              backgroundColor: "rgba(250,247,244,0.96)",
              borderRadius: "0.5rem",
              padding: "0.5rem 0.875rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              backdropFilter: "blur(4px)",
            }}
          >
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#8B7D72", margin: 0, lineHeight: 1.5 }}>
              Audio narration is available on Premium.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.92 }}
        aria-label={playing ? "Pause narration" : "Play narration"}
        style={{
          position: "relative",
          width: "44px",
          height: "44px",
          background: "rgba(250,247,244,0.92)",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isPremium && hasAudio ? 1 : 0.7,
        }}
      >
        {isPremium && hasAudio && (
          <svg
            width="44"
            height="44"
            style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
          >
            <circle
              cx="22"
              cy="22"
              r={RING_R}
              fill="none"
              stroke="#C4A97D"
              strokeWidth="2"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
        )}

        {playing ? (
          <div style={{ display: "flex", gap: "2.5px", alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{ width: "3px", backgroundColor: "#6BA38A", borderRadius: "1.5px" }}
                animate={{ height: [6, 13, 6] }}
                transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
              />
            ))}
          </div>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 6.5H2a1 1 0 00-1 1v3a1 1 0 001 1h2l4 3V3.5L4 6.5z" fill="#C4A97D" />
            <path d="M11.5 6.5c.7.7 1 1.5 1 2.5s-.3 1.8-1 2.5" stroke="#C4A97D" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 4c1.4 1.4 2 3 2 5s-.6 3.6-2 5" stroke="#C4A97D" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </svg>
        )}
      </motion.button>

      {/* Mute toggle — sits next to play button, always visible when narration is active */}
      {playing && (
        <motion.button
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleMuted}
          aria-label={muted ? "Unmute narration" : "Mute narration"}
          style={{
            width: "36px",
            height: "36px",
            background: "rgba(250,247,244,0.92)",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8B7D72",
            fontSize: "0.85rem",
          }}
        >
          {muted ? "🔇" : "🔊"}
        </motion.button>
      )}
    </div>
  );
}
