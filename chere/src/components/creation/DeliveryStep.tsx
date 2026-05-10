"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCreationStore } from "@/stores/creation-store";

type DeliveryMethod = "email" | "link" | "qr";

export default function DeliveryStep() {
  const { recipientName, creationId, scheduledRevealAt, setScheduledRevealAt } =
    useCreationStore();

  const [method, setMethod] = useState<DeliveryMethod>("email");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [schedule, setSchedule] = useState<"now" | "later">("now");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendPhase, setSendPhase] = useState<0 | 1 | 2 | 3>(0);
  const router = useRouter();

  const shareLink = creationId
    ? `chere.app/g/${creationId.slice(0, 8)}`
    : "chere.app/g/...";

  async function handleCopy() {
    await navigator.clipboard.writeText(`https://${shareLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSend() {
    setSent(true);
    setSendPhase(1);
    await delay(1000);
    setSendPhase(2);
    await delay(1000);
    setSendPhase(3);
  }

  function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  const METHODS: { id: DeliveryMethod; icon: string; label: string; desc: string }[] = [
    {
      id: "email",
      icon: "✉",
      label: "Send by email",
      desc: "We'll send a beautiful email with a link to their gift.",
    },
    {
      id: "link",
      icon: "◈",
      label: "Copy a link",
      desc: "Share it yourself — text it, DM it, or write it in a card.",
    },
    {
      id: "qr",
      icon: "⬛",
      label: "Print a QR code",
      desc: "Perfect for tucking into a birthday card or gift box.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {sent ? (
            /* ── Success screen ── */
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center text-center"
              style={{ minHeight: "60vh" }}
            >
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
            </motion.div>
          ) : (
            /* ── Delivery form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-serif text-3xl text-espresso text-center mb-3"
              >
                Time to send your gift
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-stone text-center mb-10 leading-relaxed"
              >
                Choose how {recipientName || "they"} will receive it.
              </motion.p>

              {/* Delivery method cards */}
              <div className="space-y-3 mb-8">
                {METHODS.map((m) => {
                  const active = method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className="w-full text-left rounded-xl p-5"
                      style={{
                        backgroundColor: "var(--color-cream)",
                        border: "2px solid",
                        borderColor: active ? "var(--color-muted-gold)" : "transparent",
                        boxShadow: active ? "var(--shadow-elevated)" : "var(--shadow-card)",
                        transform: active ? "translateY(-2px)" : "none",
                        transition:
                          "border-color 300ms var(--ease-elegant), box-shadow 300ms var(--ease-elegant), transform 300ms var(--ease-elegant)",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className="text-xl mt-0.5 flex-shrink-0"
                          style={{ color: active ? "var(--color-muted-gold)" : "var(--color-warm-gray)" }}
                        >
                          {m.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-serif text-base mb-1"
                            style={{ color: "var(--color-espresso)" }}
                          >
                            {m.label}
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--color-stone)" }}>
                            {m.desc}
                          </p>

                          {/* Email input */}
                          {active && m.id === "email" && (
                            <motion.input
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                              type="email"
                              value={recipientEmail}
                              onChange={(e) => setRecipientEmail(e.target.value)}
                              placeholder={`${recipientName || "Their"}'s email`}
                              className="input mt-3"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}

                          {/* Share link */}
                          {active && m.id === "link" && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="flex gap-2 mt-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                readOnly
                                value={shareLink}
                                className="input flex-1 text-xs"
                                style={{ fontFamily: "var(--font-sans)" }}
                              />
                              <button
                                onClick={handleCopy}
                                className="btn-secondary text-xs px-4 flex-shrink-0"
                              >
                                {copied ? "Copied!" : "Copy"}
                              </button>
                            </motion.div>
                          )}

                          {/* QR placeholder */}
                          {active && m.id === "qr" && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="text-xs mt-3"
                              style={{ color: "var(--color-warm-gray)" }}
                            >
                              QR code generation coming soon.
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Scheduling */}
              <div className="mb-10">
                <p className="text-sm text-stone text-center mb-4">
                  When should they receive it?
                </p>
                <div className="flex justify-center gap-3">
                  {(["now", "later"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSchedule(opt);
                        if (opt === "now") setScheduledRevealAt(null);
                      }}
                      className="py-2 px-5 rounded-full text-sm transition-all duration-300"
                      style={{
                        backgroundColor:
                          schedule === opt
                            ? "var(--color-espresso)"
                            : "var(--color-cream)",
                        color:
                          schedule === opt
                            ? "var(--color-cream)"
                            : "var(--color-charcoal)",
                        border: "1px solid",
                        borderColor:
                          schedule === opt
                            ? "var(--color-espresso)"
                            : "var(--color-parchment)",
                      }}
                    >
                      {opt === "now" ? "Right now" : "Schedule for later"}
                    </button>
                  ))}
                </div>

                {schedule === "later" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.35 }}
                    className="mt-4 overflow-hidden"
                  >
                    <input
                      type="datetime-local"
                      value={scheduledRevealAt ?? ""}
                      onChange={(e) => setScheduledRevealAt(e.target.value || null)}
                      className="input mx-auto"
                      style={{ maxWidth: "280px", display: "block" }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Send button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex justify-center"
              >
                <button
                  onClick={handleSend}
                  className="btn-gold text-base px-12 py-4 w-full md:w-auto"
                >
                  Send your Chère
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
