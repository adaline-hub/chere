"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { WizardStep } from "@/stores/creation-store";
import TypeSelector from "@/components/creation/TypeSelector";
import RelationshipPicker from "@/components/creation/RelationshipPicker";
import InterviewFlow from "@/components/creation/InterviewFlow";

const STEP_ORDER: WizardStep[] = [
  "type", "relationship", "interview", "gift", "photos",
  "clues", "format", "customize", "preview", "payment", "deliver",
];

const PREV_STEP: Partial<Record<WizardStep, WizardStep>> = {
  relationship: "type",
  interview: "relationship",
  gift: "interview",
  photos: "interview",
  clues: "photos",
  format: "clues",
  customize: "format",
  preview: "customize",
  payment: "preview",
};

export default function CreatePage() {
  const { currentStep, setStep } = useCreationStore();

  const stepIndex = STEP_ORDER.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;
  const prevStep = PREV_STEP[currentStep];

  function renderStep() {
    switch (currentStep) {
      case "type":
        return <TypeSelector />;
      case "relationship":
        return <RelationshipPicker />;
      case "interview":
        return <InterviewFlow />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <p className="font-serif text-2xl text-charcoal">Coming soon.</p>
            <p className="text-sm text-stone">This step is on its way.</p>
          </div>
        );
    }
  }

  return (
    <main className="min-h-screen bg-linen">
      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: "2px", backgroundColor: "var(--color-parchment)" }}
      >
        <motion.div
          className="h-full"
          style={{ backgroundColor: "var(--color-muted-gold)" }}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      {/* Back button */}
      <AnimatePresence>
        {prevStep && (
          <motion.button
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setStep(prevStep)}
            className="fixed top-5 left-6 z-40 flex items-center gap-1.5 text-sm text-stone hover:text-espresso transition-colors duration-300"
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Step content with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
