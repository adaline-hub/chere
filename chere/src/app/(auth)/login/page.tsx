"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/callback?redirect=${encodeURIComponent(redirectTo)}`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: callbackUrl },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p
            className="font-serif text-2xl mb-4"
            style={{ color: "var(--color-espresso)" }}
          >
            Check your email
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-stone)" }}>
            We sent you a link — no password needed.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="font-serif text-3xl text-center mb-8"
            style={{ color: "var(--color-espresso)" }}
          >
            Sign in to Chère
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="input"
              autoFocus
              autoComplete="email"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-center"
                style={{ color: "var(--color-error, #C0392B)" }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </form>

          <p
            className="text-center text-sm mt-6 leading-relaxed"
            style={{ color: "var(--color-warm-gray)" }}
          >
            We&apos;ll send you a link — no password needed.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-linen)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-serif text-2xl tracking-wide"
            style={{ color: "var(--color-espresso)" }}
          >
            Chère
          </Link>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
