"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { WizardStep } from "@/stores/creation-store";
import type { CreationType } from "@/lib/supabase/types";
import TypeSelector from "@/components/creation/TypeSelector";
import RelationshipPicker from "@/components/creation/RelationshipPicker";
import InterviewFlow from "@/components/creation/InterviewFlow";
import PhotoUploader from "@/components/creation/PhotoUploader";
import GiftDescriber from "@/components/creation/GiftDescriber";
import ClueBuilder from "@/components/creation/ClueBuilder";
import FormatPicker from "@/components/creation/FormatPicker";

// ─── Flow Logic ──────────────────────────────────────────

function getStepFlow(creationType: CreationType | null): WizardStep[] {
  const base: WizardStep[] = ["type", "relationship"];
  const tail: WizardStep[] = ["customize", "preview", "payment", "deliver"];

  if (creationType === "gift_reveal") {
    return [...base, "gift", "photos", "clues", "format", ...tail];
  }
  if (creationType === "combined") {
    return [...base, "interview", "gift", "photos", "clues", "format", ...tail];
  }
  // tribute or null (default to tribute path)
  return [...base, "interview", "photos", "format", ...tail];
}

// ─── Page ────────────────────────────────────────────────

export default function CreatePage() {
  const { currentStep, setStep, creationType } = useCreationStore();

  const flow = getStepFlow(creationType);
  const stepIndex = flow.indexOf(currentStep);
  const progress = ((stepIndex + 1) / flow.length) * 100;
  const prevStep = stepIndex > 0 ? flow[stepIndex - 1] : undefined;

  function renderStep() {
    switch (currentStep) {
      case "type":
        return <TypeSelector />;
      case "relationship":
        return <RelationshipPicker />;
      case "interview":
        return <InterviewFlow />;
      case "gift":
        return <GiftDescriber />;
      case "photos":
        return <PhotoUploader />;
      case "clues":
        return <ClueBuilder />;
      case "format":
        return <FormatPicker />;
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
          animate={{ width: `${Math.max(0, progress)}%` }}
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
