"use client";

import { useRecipientAudio } from "@/lib/audio/useRecipientAudio";

export default function RecipientMuteButton({ hasAudio }: { hasAudio?: boolean }) {
  const { muted, toggle } = useRecipientAudio();

  if (!hasAudio) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      title={muted ? "Unmute audio" : "Mute audio"}
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 95,
        width: "36px",
        height: "36px",
        borderRadius: "999px",
        border: "1px solid rgba(196,169,125,0.38)",
        backgroundColor: "rgba(250,247,244,0.88)",
        backdropFilter: "blur(6px)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.9rem",
        color: "#5A4E48",
      }}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
