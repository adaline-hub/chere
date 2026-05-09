"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { RelationshipType } from "@/lib/supabase/types";

interface Pill {
  label: string;
  gridValue: string;
  relType: RelationshipType;
  isPet?: boolean;
}

const PILLS: Pill[] = [
  { label: "Mom", gridValue: "mom", relType: "mom" },
  { label: "Dad", gridValue: "dad", relType: "dad" },
  { label: "My Partner", gridValue: "partner", relType: "partner" },
  { label: "My Pet", gridValue: "pet", relType: "pet", isPet: true },
  { label: "Friend", gridValue: "friend", relType: "friend" },
  { label: "Grandparents", gridValue: "grandparent", relType: "grandparent" },
  { label: "Sibling", gridValue: "sibling", relType: "sibling" },
  { label: "Child", gridValue: "child", relType: "child" },
  { label: "Someone Else", gridValue: "custom", relType: "custom" },
];

export default function RelationshipPicker() {
  const { recipientName, setRecipientName, setRelationshipType, setStep, relationshipType: storeRelType } =
    useCreationStore();

  const [selectedPill, setSelectedPill] = useState<string>(
    storeRelType === "pet_memorial" ? "pet" : (storeRelType ?? "")
  );
  const [petSubtype, setPetSubtype] = useState<"pet" | "pet_memorial" | null>(
    storeRelType === "pet" || storeRelType === "pet_memorial" ? storeRelType : null
  );

  const nameInputRef = useRef<HTMLInputElement>(null);
  const isPetSelected = selectedPill === "pet";
  const showNameInput = selectedPill !== "" && (!isPetSelected || petSubtype !== null);

  const canContinue =
    selectedPill !== "" &&
    (!isPetSelected || petSubtype !== null) &&
    recipientName.trim().length > 0;

  useEffect(() => {
    if (showNameInput) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [showNameInput]);

  function handlePillClick(pill: Pill) {
    if (pill.isPet) {
      if (selectedPill === "pet") {
        setSelectedPill("");
        setPetSubtype(null);
      } else {
        setSelectedPill("pet");
        setPetSubtype(null);
      }
    } else {
      setSelectedPill(pill.gridValue);
      setPetSubtype(null);
    }
  }

  function handleContinue() {
    if (!canContinue) return;
    const finalRelType: RelationshipType = isPetSelected
      ? (petSubtype as RelationshipType)
      : (selectedPill as RelationshipType);
    setRelationshipType(finalRelType);
    setStep("interview");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl text-espresso text-center mb-12"
        >
          Who is this for?
        </motion.h1>

        {/* Relationship grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-3 gap-3 w-full mb-2"
        >
          {PILLS.map((pill) => {
            const isSelected = selectedPill === pill.gridValue;
            return (
              <button
                key={pill.gridValue}
                onClick={() => handlePillClick(pill)}
                className="py-3 px-4 rounded-lg text-sm text-center cursor-pointer transition-all duration-300"
                style={{
                  backgroundColor: isSelected
                    ? "var(--color-espresso)"
                    : "var(--color-cream)",
                  color: isSelected ? "var(--color-cream)" : "var(--color-charcoal)",
                  boxShadow: isSelected
                    ? "var(--shadow-card)"
                    : "var(--shadow-subtle)",
                  border: "1px solid",
                  borderColor: isSelected
                    ? "var(--color-espresso)"
                    : "var(--color-parchment)",
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </motion.div>

        {/* Pet sub-choice */}
        <AnimatePresence>
          {isPetSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-5 pb-2">
                <p className="text-sm text-stone text-center mb-3">
                  Are you celebrating or remembering them?
                </p>
                <div className="flex gap-3 justify-center">
                  {(["pet", "pet_memorial"] as const).map((sub) => {
                    const label =
                      sub === "pet" ? "Celebrating them" : "Remembering them";
                    const isActive = petSubtype === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setPetSubtype(sub)}
                        className="py-2 px-5 rounded-lg text-sm transition-all duration-300 cursor-pointer"
                        style={{
                          backgroundColor: isActive
                            ? "var(--color-espresso)"
                            : "var(--color-cream)",
                          color: isActive ? "var(--color-cream)" : "var(--color-charcoal)",
                          border: "1px solid",
                          borderColor: isActive
                            ? "var(--color-espresso)"
                            : "var(--color-parchment)",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name input */}
        <AnimatePresence>
          {showNameInput && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-8 mb-10"
            >
              <label className="block text-sm text-stone mb-2 text-center">
                What&apos;s their name?
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Their first name"
                className="input text-center"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canContinue) handleContinue();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        <div className="flex justify-center">
          <AnimatePresence>
            {canContinue && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={handleContinue}
                className="btn-gold text-base px-10 py-4"
              >
                Continue
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
