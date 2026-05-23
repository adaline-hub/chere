"use client";

import type { CSSProperties } from "react";
import type { WalkthroughState } from "@/lib/walkthrough/useWalkthrough";

export default function WalkthroughBar({
  state,
  progress,
  step,
  totalSteps,
  onToggle,
  onRestart,
  onExit,
}: {
  state: WalkthroughState;
  progress: number;
  step: number;
  totalSteps: number;
  onToggle: () => void;
  onRestart: () => void;
  onExit: () => void;
}) {
  const playing = state === "playing";

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "1rem",
        transform: "translateX(-50%)",
        width: "min(680px, calc(100vw - 2rem))",
        zIndex: 90,
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(250,247,244,0.88)",
        border: "1px solid rgba(196,169,125,0.35)",
        borderRadius: "999px",
        padding: "0.6rem 0.8rem",
        boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto",
        gap: "0.7rem",
        alignItems: "center",
      }}
    >
      <button onClick={onToggle} aria-label={playing ? "Pause" : "Play"} style={pillBtnStyle}>
        {playing ? "❚❚" : "▶"}
      </button>
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "#6A5D56" }}>
          Step {Math.min(step + 1, totalSteps)} of {totalSteps}
        </p>
        <div style={{ marginTop: "0.3rem", height: "4px", borderRadius: "999px", backgroundColor: "rgba(139,125,114,0.24)", overflow: "hidden" }}>
          <div style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%`, height: "100%", backgroundColor: "#C4A97D" }} />
        </div>
      </div>
      <button onClick={onRestart} aria-label="Restart" style={pillBtnStyle}>⟲</button>
      <button onClick={onExit} aria-label="Exit auto-play" style={pillBtnStyle}>✕</button>
    </div>
  );
}

const pillBtnStyle: CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "rgba(255,255,255,0.8)",
  color: "#5A4E48",
  cursor: "pointer",
  fontSize: "0.9rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
