"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      setEmail(data.user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.user.id)
        .single();
      setDisplayName(profile?.display_name ?? "");
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase
        .from("profiles")
        .upsert({ id: data.user.id, display_name: displayName.trim(), email })
        .eq("id", data.user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="px-6 md:px-10 py-10 max-w-lg mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-serif text-3xl mb-10"
        style={{ color: "var(--color-espresso)" }}
      >
        Settings
      </motion.h1>

      <motion.form
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSave}
        className="rounded-xl p-6 flex flex-col gap-6"
        style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium" style={{ color: "var(--color-stone)" }}>
            Display name
          </label>
          {loading ? (
            <div className="h-10 rounded" style={{ backgroundColor: "var(--color-parchment)", animation: "pulse 2s ease-in-out infinite" }} />
          ) : (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="input"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium" style={{ color: "var(--color-stone)" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="input"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          />
          <p className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
            Email cannot be changed here.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="btn-gold py-3 text-sm"
          style={{ opacity: saving || loading ? 0.6 : 1 }}
        >
          {saved ? "Saved." : saving ? "Saving..." : "Save changes"}
        </button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 flex justify-center"
      >
        <button
          onClick={handleSignOut}
          className="text-sm transition-colors duration-200"
          style={{ color: "var(--color-stone)" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--color-espresso)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-stone)")}
        >
          Sign out
        </button>
      </motion.div>
    </main>
  );
}
