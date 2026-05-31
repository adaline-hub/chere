"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCreationStore } from "@/stores/creation-store";
import { uploadPhoto } from "@/lib/supabase/storage";
import StepHeader from "@/components/creation/StepHeader";

export default function PhotoUploader() {
  const {
    photos,
    addPhotos,
    removePhoto,
    updatePhotoCaption,
    reorderPhotos,
    tier,
    creationType,
    creationId,
    setStep,
  } = useCreationStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef(-1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadHint, setUploadHint] = useState<string | null>(null);
  // Upload state per photo: 'uploading' | 'done' | 'error'
  const [uploadState, setUploadState] = useState<Record<string, "uploading" | "done" | "error">>({});

  const isGiftOnly = creationType === "gift_reveal";

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const limit = tier === "free" ? 5 : Number.POSITIVE_INFINITY;
    const remaining = Math.max(0, limit - photos.length);
    if (remaining === 0) {
      setUploadHint("Free tier allows up to 5 photos. Upgrade for more.");
      return;
    }

    const incoming = Array.from(fileList);
    const accepted = incoming.slice(0, remaining);
    if (accepted.length < incoming.length) {
      setUploadHint("Some photos were skipped. Free tier allows up to 5 photos.");
    } else {
      setUploadHint(null);
    }

    const base = photos.length;
    const newPhotos = accepted.map((file, i) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      sortOrder: base + i,
    }));
    addPhotos(newPhotos);

    // Upload each photo to Supabase Storage in the background
    if (creationId) {
      newPhotos.forEach((photo, i) => {
        setUploadState((s) => ({ ...s, [photo.id]: "uploading" }));
        uploadPhoto(creationId, photo.file, photo.id, photos.length + i)
          .then(() => setUploadState((s) => ({ ...s, [photo.id]: "done" })))
          .catch(() => setUploadState((s) => ({ ...s, [photo.id]: "error" })));
      });
    }
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
        <StepHeader step="photos" title="Add your photos" />

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
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="mb-3" style={{ color: "var(--color-warm-gray)" }}>
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M3 16l4.5-4.5 3 3 3-3 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
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

                  {/* Upload progress bar */}
                  {uploadState[photo.id] === "uploading" && (
                    <div className="absolute bottom-0 left-0 right-0" style={{ height: "3px", backgroundColor: "rgba(0,0,0,0.2)" }}>
                      <div
                        className="h-full"
                        style={{
                          backgroundColor: "var(--color-muted-gold)",
                          animation: "pulse 1.2s ease-in-out infinite",
                          width: "60%",
                        }}
                      />
                    </div>
                  )}
                  {uploadState[photo.id] === "error" && (
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-1">
                      <span className="text-xs px-1 rounded" style={{ backgroundColor: "rgba(192,57,43,0.85)", color: "white" }}>
                        Upload failed
                      </span>
                    </div>
                  )}
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

        {uploadHint && (
          <p className="text-xs text-center mb-6" style={{ color: "var(--color-warm-gray)" }}>
            {uploadHint}
          </p>
        )}

        {photos.length >= 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-center mb-6"
            style={{ color: "var(--color-muted-gold)" }}
          >
            Want more photos and no watermark? You'll see upgrade options before you send.
          </motion.p>
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
