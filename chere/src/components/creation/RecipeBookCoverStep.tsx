"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCreationStore } from "@/stores/creation-store";
import StepHeader from "@/components/creation/StepHeader";

const INTRO_CHAR_LIMIT = 500;

export default function RecipeBookCoverStep() {
  const {
    creationId,
    recipeBookCoverFile,
    setRecipeBookCoverFile,
    recipeBookCoverPath,
    setRecipeBookCoverPath,
    recipeBookIntro,
    setRecipeBookIntro,
    recipeBookBannerHeader,
    setRecipeBookBannerHeader,
    recipeBookBannerSubheader,
    setRecipeBookBannerSubheader,
    setStep,
  } = useCreationStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeBookCoverFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null);
      return;
    }
    const next = URL.createObjectURL(recipeBookCoverFile);
    setPreviewUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [recipeBookCoverFile]);

  function handleFile(file: File | null) {
    if (!file) return;
    setRecipeBookCoverFile(file);
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  }

  async function handleContinue() {
    if (!creationId) {
      setError("Save your creation first, then try again.");
      return;
    }

    setError(null);

    if (recipeBookCoverFile) {
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", recipeBookCoverFile);
        form.append("creation_id", creationId);

        const res = await fetch("/api/recipes/upload-cover", {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");

        setRecipeBookCoverPath(data.path as string);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save cover");
        return;
      } finally {
        setUploading(false);
      }
    }

    if (!recipeBookCoverFile && !recipeBookCoverPath) {
      setRecipeBookCoverPath(null);
    }

    setStep("payment");
  }

  const introLength = recipeBookIntro.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl">
        <StepHeader step="cover" title="A little intro to your book" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-10 leading-relaxed max-w-xl mx-auto"
        >
          A cover photo and a few words from you — the first thing they&apos;ll see when they open it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className="rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer mb-8"
          style={{
            backgroundColor: isDraggingOver ? "var(--color-parchment)" : "var(--color-cream)",
            border: `2px dashed ${isDraggingOver ? "var(--color-muted-gold)" : "var(--color-parchment)"}`,
            minHeight: "240px",
            transition: "background-color 300ms var(--ease-elegant), border-color 300ms var(--ease-elegant)",
          }}
        >
          {previewUrl ? (
            <div className="relative w-full max-w-lg h-56 rounded-lg overflow-hidden" style={{ boxShadow: "var(--shadow-photo)" }}>
              <Image src={previewUrl} alt="Recipe book cover preview" fill unoptimized className="object-cover" />
            </div>
          ) : (
            <>
              <p className="text-sm text-center" style={{ color: "var(--color-warm-gray)" }}>
                Drop a cover photo here or <span style={{ color: "var(--color-muted-gold)" }}>tap to browse</span>
              </p>
              <p className="text-xs mt-2" style={{ color: "var(--color-stone)" }}>
                Optional
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <label className="block font-serif text-base mb-2" style={{ color: "var(--color-espresso)" }}>
            Why this book?
          </label>
          <textarea
            value={recipeBookIntro}
            onChange={(e) => setRecipeBookIntro(e.target.value.slice(0, INTRO_CHAR_LIMIT))}
            placeholder="e.g. Mom — your recipes are the smell of my childhood. Let's keep them somewhere safe."
            className="textarea w-full"
            style={{ minHeight: "170px", lineHeight: 1.7, fontSize: "0.9375rem" }}
          />
          <p className="text-xs mt-2" style={{ color: "var(--color-warm-gray)" }}>
            {introLength}/{INTRO_CHAR_LIMIT}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-8"
        >
          <label className="block font-serif text-base mb-1" style={{ color: "var(--color-espresso)" }}>
            Tribute header <span className="text-xs font-sans" style={{ color: "var(--color-stone)" }}>(optional)</span>
          </label>
          <p className="text-xs mb-2" style={{ color: "var(--color-warm-gray)" }}>
            A short dedication shown at the top of the book — e.g. &ldquo;For Mom&rdquo;
          </p>
          <input
            type="text"
            value={recipeBookBannerHeader}
            onChange={(e) => setRecipeBookBannerHeader(e.target.value.slice(0, 80))}
            placeholder="For Mom"
            maxLength={80}
            className="input w-full"
          />
          <p className="text-xs mt-1 text-right" style={{ color: "var(--color-warm-gray)" }}>
            {recipeBookBannerHeader.length}/80
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-8"
        >
          <label className="block font-serif text-base mb-1" style={{ color: "var(--color-espresso)" }}>
            Tribute note <span className="text-xs font-sans" style={{ color: "var(--color-stone)" }}>(optional)</span>
          </label>
          <p className="text-xs mb-2" style={{ color: "var(--color-warm-gray)" }}>
            A paragraph beneath the header — a tribute that stays visible on the book homepage.
          </p>
          <textarea
            value={recipeBookBannerSubheader}
            onChange={(e) => setRecipeBookBannerSubheader(e.target.value)}
            placeholder="Every recipe in here is one you taught me, in the order you taught it…"
            className="textarea w-full"
            style={{ minHeight: "120px", lineHeight: 1.7, fontSize: "0.9375rem" }}
          />
        </motion.div>

        {error && (
          <p className="text-sm text-center mb-6" style={{ color: "var(--color-error, #B14545)" }}>
            {error}
          </p>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={uploading}
            className="btn-gold text-base px-10 py-4"
            style={{ opacity: uploading ? 0.75 : 1, cursor: uploading ? "wait" : "pointer" }}
          >
            {uploading ? "Saving cover..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
