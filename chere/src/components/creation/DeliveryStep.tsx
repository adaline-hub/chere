"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCreationStore } from "@/stores/creation-store";

export default function DeliveryStep() {
  const { recipientName, creationId, shareToken, tier, reactionCamEnabled, setReactionCamEnabled } = useCreationStore();
  const [copied, setCopied] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sendPhase, setSendPhase] = useState<0 | 1 | 2 | 3>(0);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const router = useRouter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const shareUrl = shareToken ? `${appUrl}/g/${shareToken}` : null;
  const displayBase = appUrl.replace(/^https?:\/\//, "");
  const displayUrl = shareToken ? `${displayBase}/g/${shareToken}` : "Saving your creation...";

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSend() {
    if (!recipientEmail || !creationId || sending) return;
    setEmailError(null);
    setSending(true);

    try {
      const res = await fetch("/api/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creationId, method: "email", recipientEmail }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEmailError(
          data.details
            ? `Delivery failed: ${data.details}`
            : "We couldn't send the email. You can copy the link and share it directly."
        );
        setSending(false);
        return;
      }

      setSent(true);
      setSendPhase(1);
      await delay(1000);
      setSendPhase(2);
      await delay(1000);
      setSendPhase(3);
    } catch {
      setEmailError("We couldn't send the email. You can copy the link and share it directly.");
      setSending(false);
    }
  }

  function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence>
          {sendPhase >= 1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="font-serif"
              style={{ fontSize: "3.5rem", color: "var(--color-espresso)" }}
            >
              Sent.
            </motion.p>
          )}
          {sendPhase >= 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mt-4 leading-relaxed"
              style={{ color: "var(--color-stone)", fontSize: "1.0625rem" }}
            >
              Your gift for {recipientName || "them"} is on its way.
            </motion.p>
          )}
          {sendPhase >= 3 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              onClick={() => router.push("/dashboard")}
              className="mt-10 text-sm"
              style={{ color: "var(--color-muted-gold)" }}
            >
              Go to dashboard →
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl text-espresso text-center mb-3"
        >
          Your gift is ready.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-10 leading-relaxed"
        >
          Share this link with {recipientName || "them"} however feels right.
        </motion.p>

        {/* Primary: The Link */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl p-6 mb-4"
          style={{
            backgroundColor: "var(--color-cream)",
            border: "2px solid var(--color-muted-gold)",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          <p className="text-xs mb-3" style={{ color: "var(--color-stone)", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Your tribute link
          </p>
          <div className="flex gap-3 items-center">
            <input
              readOnly
              value={displayUrl}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm"
              style={{
                backgroundColor: "var(--color-parchment)",
                border: "1px solid var(--color-parchment)",
                color: "var(--color-espresso)",
                fontFamily: "var(--font-sans)",
              }}
            />
            <button
              onClick={handleCopy}
              disabled={!shareUrl}
              className="btn-gold text-sm px-5 py-2.5 flex-shrink-0"
              style={{ opacity: shareUrl ? 1 : 0.5 }}
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--color-stone)" }}>
            Text it, DM it, or write it inside a card.
          </p>

          {tier === "free" && (
            <p className="text-xs mt-3 pt-3" style={{ color: "var(--color-warm-gray)", borderTop: "1px solid var(--color-parchment)" }}>
              This link expires in 7 days.{" "}
              <button
                onClick={() => {}}
                className="underline"
                style={{ color: "var(--color-muted-gold)" }}
              >
                Upgrade to keep it permanent →
              </button>
            </p>
          )}
        </motion.div>

        {/* Secondary: Email (collapsible) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl overflow-hidden mb-4"
          style={{ backgroundColor: "var(--color-cream)", border: "1px solid var(--color-parchment)" }}
        >
          <button
            onClick={() => setEmailOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-serif text-base" style={{ color: "var(--color-espresso)" }}>
              Or send by email
            </span>
            <span style={{ color: "var(--color-stone)", fontSize: "0.75rem" }}>
              {emailOpen ? "▲" : "▼"}
            </span>
          </button>

          <AnimatePresence>
            {emailOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden px-5 pb-5"
              >
                <p className="text-xs mb-3" style={{ color: "var(--color-stone)" }}>
                  We&apos;ll send a beautiful email with the link inside.
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => { setRecipientEmail(e.target.value); setEmailError(null); }}
                    placeholder={`${recipientName || "Their"}'s email`}
                    className="input flex-1 text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!recipientEmail || sending}
                    className="btn-gold text-sm px-5 flex-shrink-0"
                    style={{ opacity: recipientEmail && !sending ? 1 : 0.5 }}
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
                {emailError && (
                  <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--color-error)" }}>
                    {emailError}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Reaction Cam toggle — Deluxe only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="rounded-xl px-5 py-4 mb-4"
          style={{
            backgroundColor: "var(--color-cream)",
            border: "1px solid var(--color-parchment)",
            opacity: tier === "deluxe" ? 1 : 0.65,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-base" style={{ color: "var(--color-espresso)" }}>
                Capture their reaction
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-stone)", maxWidth: "260px" }}>
                {tier === "deluxe"
                  ? "We'll ask permission before using their camera. A 15-second clip for your eyes only."
                  : "Available on Deluxe"}
              </p>
            </div>
            <button
              disabled={tier !== "deluxe"}
              onClick={() => tier === "deluxe" && setReactionCamEnabled(!reactionCamEnabled)}
              aria-label="Toggle reaction cam"
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                backgroundColor: reactionCamEnabled && tier === "deluxe" ? "var(--color-muted-gold)" : "var(--color-parchment)",
                border: "none",
                cursor: tier === "deluxe" ? "pointer" : "default",
                position: "relative",
                flexShrink: 0,
                transition: "background-color 200ms",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: reactionCamEnabled && tier === "deluxe" ? "22px" : "3px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-cream)",
                  transition: "left 200ms",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
              />
            </button>
          </div>
        </motion.div>

        {/* Tertiary: QR (coming soon) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl px-5 py-4"
          style={{ backgroundColor: "var(--color-cream)", border: "1px solid var(--color-parchment)", opacity: 0.6 }}
        >
          <p className="font-serif text-base" style={{ color: "var(--color-stone)" }}>
            Print a QR code <span className="text-xs ml-2" style={{ color: "var(--color-warm-gray)" }}>coming soon</span>
          </p>
        </motion.div>

        {/* Done */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex justify-center mt-10"
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-secondary text-base px-10 py-4"
          >
            Done — go to dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
