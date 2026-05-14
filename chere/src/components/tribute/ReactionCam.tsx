"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Phase = "consent" | "recording" | "uploading" | "done" | "declined";

export default function ReactionCam({
  creationId,
  recipientName,
}: {
  creationId: string;
  recipientName: string;
}) {
  const [phase, setPhase] = useState<Phase>("consent");
  const [timeLeft, setTimeLeft] = useState(15);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function handleConsent() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 320 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = handleRecordingStop;
      recorder.start(1000); // collect data every second
      recorderRef.current = recorder;

      setPhase("recording");
      setTimeLeft(15);
      countdownRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            stopRecording();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch {
      // Camera unavailable or permission denied — continue without cam
      setPhase("declined");
    }
  }

  function stopRecording() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function handleRecordingStop() {
    setPhase("uploading");
    const blob = new Blob(chunksRef.current, { type: "video/webm" });

    try {
      const supabase = createClient();
      const path = `creations/${creationId}/reactions/${Date.now()}.webm`;

      await supabase.storage.from("reactions").upload(path, blob, {
        contentType: "video/webm",
        upsert: false,
      });

      await supabase.from("recipient_interactions").insert({
        creation_id: creationId,
        interaction_type: "reaction",
        content: path,
      });

      fetch("/api/notify-reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creationId, recipientName }),
      }).catch(() => {});
    } catch {
      // Upload failure — silent, don't disrupt the experience
    }

    setPhase("done");
    setShowConfirmation(true);
    confirmTimer.current = setTimeout(() => setShowConfirmation(false), 3200);
  }

  // After declined or done, render nothing (let the tribute show through)
  if (phase === "declined" || (phase === "done" && !showConfirmation)) return null;

  return (
    <AnimatePresence mode="wait">
      {phase === "consent" && (
        <motion.div
          key="consent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(250,247,244,0.97)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{ maxWidth: "380px", width: "100%" }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#F5EDE0",
                border: "1.5px solid #C4A97D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.75rem",
                fontSize: "1.5rem",
              }}
            >
              🎁
            </div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.4375rem",
                color: "#2A2420",
                lineHeight: 1.4,
                marginBottom: "0.875rem",
              }}
            >
              The person who made this would love to see your reaction.
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9375rem",
                color: "#8B7D72",
                lineHeight: 1.65,
                marginBottom: "2rem",
              }}
            >
              Can we use your camera for a few seconds? It&apos;s just for them — only they can see it.
            </p>
            <button
              onClick={handleConsent}
              style={{
                display: "block",
                width: "100%",
                padding: "0.9375rem 1.5rem",
                backgroundColor: "#C4A97D",
                color: "#FAF7F4",
                border: "none",
                borderRadius: "0.625rem",
                fontFamily: "var(--font-serif)",
                fontSize: "1rem",
                cursor: "pointer",
                marginBottom: "1rem",
                transition: "opacity 150ms",
              }}
            >
              Sure, let&apos;s do it
            </button>
            <button
              onClick={() => setPhase("declined")}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                color: "#8B7D72",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              No thanks
            </button>
          </motion.div>
        </motion.div>
      )}

      {phase === "recording" && (
        <motion.div
          key="pip"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 60 }}
        >
          <div style={{ position: "relative", width: "80px" }}>
            <video
              ref={videoRef}
              muted
              playsInline
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2.5px solid #C4A97D",
                display: "block",
                transform: "scaleX(-1)", // mirror front cam
              }}
            />
            {/* Countdown badge */}
            <div
              style={{
                position: "absolute",
                top: "-6px",
                right: "-4px",
                width: "24px",
                height: "24px",
                backgroundColor: "#C4A97D",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.6rem",
                  color: "#FAF7F4",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {timeLeft}
              </span>
            </div>
            {/* Stop button */}
            <button
              onClick={stopRecording}
              style={{
                position: "absolute",
                bottom: "-26px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "none",
                border: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "0.625rem",
                color: "#8B7D72",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Stop
            </button>
          </div>
        </motion.div>
      )}

      {showConfirmation && (
        <motion.div
          key="confirmation"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 70,
            backgroundColor: "rgba(250,247,244,0.96)",
            borderRadius: "2rem",
            padding: "0.5rem 1.375rem",
            backdropFilter: "blur(6px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            whiteSpace: "nowrap",
          }}
        >
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "#2A2420", margin: 0 }}>
            Reaction captured. They&apos;re going to love it.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
