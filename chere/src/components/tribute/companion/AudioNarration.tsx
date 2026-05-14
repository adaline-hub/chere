"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RING_R = 18;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

function selectVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.name === "Samantha") ??
    voices.find((v) => v.name.includes("UK English Female")) ??
    voices.find((v) => v.lang === "en-GB" && v.name.toLowerCase().includes("female")) ??
    voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null
  );
}

export default function AudioNarration({
  text,
  tier,
  paused,
}: {
  text: string;
  tier: string;
  paused: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showGate, setShowGate] = useState(false);
  const idxRef = useRef(0);
  const gateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPremium = tier === "premium" || tier === "deluxe";
  const sentences = text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];

  useEffect(() => {
    if (!playing) return;
    if (paused) {
      window.speechSynthesis?.pause();
    } else {
      window.speechSynthesis?.resume();
    }
  }, [paused, playing]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function speakFrom(idx: number) {
    if (idx >= sentences.length) {
      setPlaying(false);
      setProgress(1);
      return;
    }
    const utt = new SpeechSynthesisUtterance(sentences[idx]);
    const voice = selectVoice();
    if (voice) utt.voice = voice;
    utt.rate = 0.85;
    utt.pitch = 1.0;
    utt.onend = () => {
      idxRef.current = idx + 1;
      setProgress((idx + 1) / sentences.length);
      speakFrom(idx + 1);
    };
    window.speechSynthesis.speak(utt);
  }

  function startNarration() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    idxRef.current = 0;
    setProgress(0);
    // Wait for voices to load if needed
    const go = () => { speakFrom(0); setPlaying(true); };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = go;
    } else {
      go();
    }
  }

  function stopNarration() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setProgress(0);
  }

  function handleClick() {
    if (!isPremium) {
      setShowGate(true);
      if (gateTimer.current) clearTimeout(gateTimer.current);
      gateTimer.current = setTimeout(() => setShowGate(false), 3200);
      return;
    }
    if (playing) {
      stopNarration();
    } else {
      startNarration();
    }
  }

  const dashOffset = CIRCUMFERENCE - CIRCUMFERENCE * progress;

  return (
    <div style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem", zIndex: 20 }}>
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

      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.92 }}
        aria-label={playing ? "Stop narration" : "Listen to this tribute"}
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
          opacity: isPremium ? 1 : 0.72,
        }}
      >
        {/* Progress ring */}
        {isPremium && (
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
          // Animated sound bars
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
          // Speaker icon
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 6.5H2a1 1 0 00-1 1v3a1 1 0 001 1h2l4 3V3.5L4 6.5z" fill="#C4A97D" />
            <path d="M11.5 6.5c.7.7 1 1.5 1 2.5s-.3 1.8-1 2.5" stroke="#C4A97D" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 4c1.4 1.4 2 3 2 5s-.6 3.6-2 5" stroke="#C4A97D" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}
