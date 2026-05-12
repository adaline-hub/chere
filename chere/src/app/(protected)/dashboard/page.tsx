"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCreations } from "@/hooks/useDashboard";
import CreationCard from "@/components/dashboard/CreationCard";

function SkeletonCard() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: "var(--color-cream)", boxShadow: "var(--shadow-card)", borderLeft: "4px solid var(--color-parchment)" }}
    >
      <div className="p-5 flex flex-col gap-3">
        <div
          className="h-5 rounded"
          style={{ width: "60%", backgroundColor: "var(--color-parchment)", animation: "pulse 2s ease-in-out infinite" }}
        />
        <div
          className="h-3 rounded"
          style={{ width: "35%", backgroundColor: "var(--color-parchment)", animation: "pulse 2s ease-in-out infinite" }}
        />
        <div className="flex justify-between items-center pt-2">
          <div
            className="h-3 rounded"
            style={{ width: "25%", backgroundColor: "var(--color-parchment)", animation: "pulse 2s ease-in-out infinite" }}
          />
          <div
            className="h-3 rounded"
            style={{ width: "18%", backgroundColor: "var(--color-parchment)", animation: "pulse 2s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { creations, loading } = useCreations();

  return (
    <main className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-3xl"
          style={{ color: "var(--color-espresso)" }}
        >
          My Chères
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Link href="/create" className="btn-gold text-sm px-5 py-2.5">
            + Create new
          </Link>
        </motion.div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : creations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center text-center py-24"
        >
          <p
            className="font-serif text-2xl mb-3"
            style={{ color: "var(--color-espresso)" }}
          >
            Nothing here yet.
          </p>
          <p className="mb-8 leading-relaxed" style={{ color: "var(--color-stone)" }}>
            Start with someone you love.
          </p>
          <Link href="/create" className="btn-gold px-8 py-3">
            Create your first Chère
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {creations.map((creation, i) => (
            <motion.div
              key={creation.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <CreationCard creation={creation} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
