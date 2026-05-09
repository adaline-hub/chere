"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCreationStore } from "@/stores/creation-store";

export default function PhotoUploader() {
  const {
    photos,
    addPhotos,
    removePhoto,
    updatePhotoCaption,
    reorderPhotos,
    tier,
    creationType,
    setStep,
  } = useCreationStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef(-1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const isGiftOnly = creationType === "gift_reveal";

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const base = photos.length;
    const newPhotos = Array.from(fileList).map((file, i) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      sortOrder: base + i,
    }));
    addPhotos(newPhotos);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleContinue() {
    if (creationType === "tribute") {
      setStep("format");
    } else {
      setStep("clues");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl text-espresso text-center mb-3"
        >
          Add your photos
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-stone text-center mb-10 leading-relaxed max-w-md mx-auto"
        >
          {isGiftOnly
            ? "Add a photo or two to make the reveal feel personal."
            : "The ones that tell the story. Kitchen chaos, birthday mornings, that one vacation photo everyone argues about."}
        </motion.p>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className="rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer mb-8"
          style={{
            backgroundColor: isDraggingOver ? "var(--color-parchment)" : "var(--color-cream)",
            border: `2px dashed ${isDraggingOver ? "var(--color-muted-gold)" : "var(--color-parchment)"}`,
            minHeight: "160px",
            transition: "background-color 300ms var(--ease-elegant), border-color 300ms var(--ease-elegant)",
          }}
        >
          <span
            className="block mb-3 text-3xl"
            style={{ color: "var(--color-warm-gray)" }}
          >
            ◻
          </span>
          <p className="text-sm text-center" style={{ color: "var(--color-warm-gray)" }}>
            Drop photos here or{" "}
            <span style={{ color: "var(--color-muted-gold)" }}>tap to browse</span>
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </motion.div>

        {/* Thumbnail grid */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"
          >
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => { dragIndexRef.current = index; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndexRef.current >= 0 && dragIndexRef.current !== index) {
                    reorderPhotos(dragIndexRef.current, index);
                  }
                  dragIndexRef.current = -1;
                }}
                className="relative group"
              >
                <div
                  className="relative aspect-square rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                  style={{ boxShadow: "var(--shadow-photo)" }}
                >
                  <Image
                    src={photo.preview}
                    alt={photo.caption || `Photo ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                    aria-label="Remove photo"
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      backgroundColor: "rgba(42,36,32,0.75)",
                      color: "var(--color-cream)",
                    }}
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                  placeholder="Add a caption..."
                  className="mt-2 w-full text-xs outline-none bg-transparent pb-1"
                  style={{
                    color: "var(--color-charcoal)",
                    borderBottom: "1px solid var(--color-parchment)",
                    caretColor: "var(--color-muted-gold)",
                  }}
                />
              </div>
            ))}
          </motion.div>
        )}

        {tier === "free" && photos.length > 0 && (
          <p className="text-xs text-center mb-6" style={{ color: "var(--color-warm-gray)" }}>
            Free tier: up to 5 photos
          </p>
        )}

        {/* Continue */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center"
          >
            <button onClick={handleContinue} className="btn-gold text-base px-10 py-4">
              Continue
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
