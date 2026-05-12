"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useOccasions } from "@/hooks/useDashboard";

const OCCASION_TYPES = [
  "Birthday",
  "Anniversary",
  "Mother's Day",
  "Father's Day",
  "Graduation",
  "Holiday",
  "Wedding",
  "Other",
];

function daysUntil(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const occasion = new Date(dateStr + "T00:00:00");
  const diff = Math.round((occasion.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 0) return `In ${diff} day${diff !== 1 ? "s" : ""}`;
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-col gap-1.5">
        <div className="h-4 rounded" style={{ width: "120px", backgroundColor: "var(--color-parchment)", animation: "pulse 2s ease-in-out infinite" }} />
        <div className="h-3 rounded" style={{ width: "80px", backgroundColor: "var(--color-parchment)", animation: "pulse 2s ease-in-out infinite" }} />
      </div>
      <div className="h-4 rounded" style={{ width: "70px", backgroundColor: "var(--color-parchment)", animation: "pulse 2s ease-in-out infinite" }} />
    </div>
  );
}

export default function OccasionsPage() {
  const { occasions, loading, addOccasion, removeOccasion } = useOccasions();

  const [name, setName] = useState("");
  const [type, setType] = useState(OCCASION_TYPES[0]);
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) return;
    setSaving(true);
    await addOccasion({ recipient_name: name.trim(), occasion_type: type, occasion_date: date });
    setName("");
    setDate("");
    setType(OCCASION_TYPES[0]);
    setSaving(false);
  }

  return (
    <main className="px-6 md:px-10 py-10 max-w-2xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-serif text-3xl mb-2"
        style={{ color: "var(--color-espresso)" }}
      >
        Occasions
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-10 leading-relaxed"
        style={{ color: "var(--color-stone)" }}
      >
        Never forget the moments that matter.
      </motion.p>

      {/* Add form */}
      <motion.form
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        onSubmit={handleAdd}
        className="rounded-xl p-6 mb-8 flex flex-col gap-4"
        style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--color-espresso)" }}>
          Add an occasion
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Who is it for?"
            className="input"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input"
            style={{ cursor: "pointer" }}
          >
            {OCCASION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input flex-1"
            required
          />
          <button
            type="submit"
            disabled={saving || !name.trim() || !date}
            className="btn-gold px-6 py-2.5 text-sm flex-shrink-0"
            style={{ opacity: saving || !name.trim() || !date ? 0.5 : 1 }}
          >
            {saving ? "Saving..." : "Add"}
          </button>
        </div>
      </motion.form>

      {/* Occasion list */}
      {loading ? (
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-card)" }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="px-6"
              style={{ borderBottom: i < 2 ? "1px solid var(--color-parchment)" : "none" }}
            >
              <SkeletonRow />
            </div>
          ))}
        </div>
      ) : occasions.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-10 text-sm"
          style={{ color: "var(--color-warm-gray)" }}
        >
          No occasions yet. Add one above.
        </motion.p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-card)" }}
        >
          {occasions.map((occasion, i) => (
            <div
              key={occasion.id}
              className="px-6 flex items-center justify-between gap-4"
              style={{
                paddingTop: "1rem",
                paddingBottom: "1rem",
                borderBottom: i < occasions.length - 1 ? "1px solid var(--color-parchment)" : "none",
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-serif text-base leading-snug" style={{ color: "var(--color-espresso)" }}>
                  {occasion.recipient_name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-stone)" }}>
                  {occasion.occasion_type} · {new Date(occasion.occasion_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-muted-gold)" }}
                >
                  {daysUntil(occasion.occasion_date)}
                </span>
                <Link
                  href={`/create?name=${encodeURIComponent(occasion.recipient_name)}`}
                  className="text-xs"
                  style={{ color: "var(--color-stone)" }}
                  title="Create a Chère"
                >
                  Create a Chère →
                </Link>
                <button
                  onClick={() => removeOccasion(occasion.id)}
                  aria-label="Remove occasion"
                  className="text-xs transition-colors duration-200"
                  style={{ color: "var(--color-parchment)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#B44046")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-parchment)")}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
