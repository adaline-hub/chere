"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { WizardStep } from "@/stores/creation-store";
import type { CreationType, RelationshipType } from "@/lib/supabase/types";
import AppHeader from "@/components/shared/AppHeader";
import TypeSelector from "@/components/creation/TypeSelector";
import RelationshipPicker from "@/components/creation/RelationshipPicker";
import InterviewFlow from "@/components/creation/InterviewFlow";
import PhotoUploader from "@/components/creation/PhotoUploader";
import GiftDescriber from "@/components/creation/GiftDescriber";
import ClueBuilder from "@/components/creation/ClueBuilder";
import FormatPicker from "@/components/creation/FormatPicker";
import CustomizeStep from "@/components/creation/CustomizeStep";
import RecordMessageStep from "@/components/creation/RecordMessageStep";
import PreviewStep from "@/components/creation/PreviewStep";
import PaymentStep from "@/components/creation/PaymentStep";
import DeliveryStep from "@/components/creation/DeliveryStep";
import { useAutoSave } from "@/hooks/useAutoSave";

const VALID_CREATION_TYPES: CreationType[] = ["tribute", "gift_reveal", "combined"];
const VALID_RELATIONSHIP_TYPES: RelationshipType[] = [
  "mom", "dad", "partner", "pet", "pet_memorial", "friend", "grandparent", "sibling", "child", "custom",
];

// ─── Flow Logic ──────────────────────────────────────────

function getStepFlow(creationType: CreationType | null): WizardStep[] {
  const base: WizardStep[] = ["type", "relationship"];
  const tail: WizardStep[] = ["customize", "audio", "preview", "payment", "deliver"];

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
  useAutoSave();
  const { currentStep, setStep, creationType, setCreationType, setRelationshipType, setRecipientName } = useCreationStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forParam = params.get("for");
    const nameParam = params.get("name");
    const typeParam = params.get("type");

    if (nameParam) setRecipientName(nameParam);
    if (typeParam && VALID_CREATION_TYPES.includes(typeParam as CreationType)) {
      setCreationType(typeParam as CreationType);
    }
    if (forParam && VALID_RELATIONSHIP_TYPES.includes(forParam as RelationshipType)) {
      setRelationshipType(forParam as RelationshipType);
      setCreationType("tribute");
      setStep("relationship");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      case "customize":
        return <CustomizeStep />;
      case "audio":
        return <RecordMessageStep />;
      case "preview":
        return <PreviewStep />;
      case "payment":
        return <PaymentStep />;
      case "deliver":
        return <DeliveryStep />;
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
    <main className="min-h-screen bg-linen" style={{ paddingTop: "56px" }}>
      <AppHeader />

      {/* Progress bar — sits below the 56px AppHeader */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: "56px", height: "2px", backgroundColor: "var(--color-parchment)" }}
      >
        <motion.div
          className="h-full"
          style={{ backgroundColor: "var(--color-muted-gold)" }}
          initial={false}
          animate={{ width: `${Math.max(0, progress)}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      {/* Back button — below AppHeader */}
      <AnimatePresence>
        {prevStep && (
          <motion.button
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setStep(prevStep)}
            className="fixed left-6 z-40 flex items-center gap-1.5 text-sm text-stone hover:text-espresso transition-colors duration-300"
            style={{ top: "72px" }}
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
