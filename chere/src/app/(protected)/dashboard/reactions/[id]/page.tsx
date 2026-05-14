"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface ReactionVideo {
  path: string;
  url: string;
  recordedAt: string;
}

export default function ReactionsPage() {
  const { id: creationId } = useParams<{ id: string }>();
  const router = useRouter();
  const [videos, setVideos] = useState<ReactionVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientName, setRecipientName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: creation } = await supabase
        .from("creations")
        .select("recipient_name")
        .eq("id", creationId)
        .single();
      if (creation) setRecipientName(creation.recipient_name as string);

      const { data: interactions } = await supabase
        .from("recipient_interactions")
        .select("content, created_at")
        .eq("creation_id", creationId)
        .eq("interaction_type", "reaction")
        .order("created_at", { ascending: false });

      if (!interactions?.length) { setLoading(false); return; }

      const resolved = await Promise.all(
        interactions.map(async (row) => {
          const path = row.content as string;
          const { data } = await supabase.storage
            .from("reactions")
            .createSignedUrl(path, 3600);
          return {
            path,
            url: data?.signedUrl ?? "",
            recordedAt: row.created_at as string,
          };
        })
      );
      setVideos(resolved.filter((v) => v.url));
      setLoading(false);
    }
    load();
  }, [creationId]);

  async function handleDelete(path: string) {
    if (!confirm("Delete this reaction video? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.storage.from("reactions").remove([path]);
    await supabase
      .from("recipient_interactions")
      .delete()
      .eq("creation_id", creationId)
      .eq("content", path);
    setVideos((prev) => prev.filter((v) => v.path !== path));
  }

  return (
    <main className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/dashboard")}
        style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--color-muted-gold)", background: "none", border: "none", cursor: "pointer", marginBottom: "1.5rem" }}
      >
        ← Dashboard
      </button>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-3xl mb-2"
        style={{ color: "var(--color-espresso)" }}
      >
        {recipientName ? `${recipientName}'s reaction` : "Reaction"}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 text-sm leading-relaxed"
        style={{ color: "var(--color-stone)" }}
      >
        The moment they opened your gift.
      </motion.p>

      {loading && (
        <div style={{ color: "var(--color-stone)", fontFamily: "var(--font-sans)", fontSize: "0.875rem" }}>
          Loading...
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ backgroundColor: "var(--color-cream)", border: "1px solid var(--color-parchment)" }}
        >
          <p className="font-serif text-lg mb-2" style={{ color: "var(--color-espresso)" }}>
            No reaction yet.
          </p>
          <p className="text-sm" style={{ color: "var(--color-stone)" }}>
            When they record their reaction, it will appear here.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {videos.map((v, i) => (
          <motion.div
            key={v.path}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-card)" }}
          >
            <video
              src={v.url}
              controls
              playsInline
              style={{ width: "100%", display: "block", maxHeight: "500px", backgroundColor: "#000" }}
            />
            <div className="px-5 py-4 flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--color-stone)", fontFamily: "var(--font-sans)" }}>
                Recorded {new Date(v.recordedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <button
                onClick={() => handleDelete(v.path)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "var(--color-stone)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
