"use client";

import { use, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore, type WizardStep } from "@/stores/creation-store";
import type { CreationType } from "@/lib/supabase/types";
import { getCreationById } from "@/lib/supabase/creations";
import { useAutoSave } from "@/hooks/useAutoSave";
import TypeSelector from "@/components/creation/TypeSelector";
import RelationshipPicker from "@/components/creation/RelationshipPicker";
import InterviewFlow from "@/components/creation/InterviewFlow";
import PhotoUploader from "@/components/creation/PhotoUploader";
import GiftDescriber from "@/components/creation/GiftDescriber";
import ClueBuilder from "@/components/creation/ClueBuilder";
import FormatPicker from "@/components/creation/FormatPicker";
import CustomizeStep from "@/components/creation/CustomizeStep";
import PreviewStep from "@/components/creation/PreviewStep";
import PaymentStep from "@/components/creation/PaymentStep";
import DeliveryStep from "@/components/creation/DeliveryStep";

function getStepFlow(creationType: CreationType | null): WizardStep[] {
  const base: WizardStep[] = ["type", "relationship"];
  const tail: WizardStep[] = ["customize", "preview", "payment", "deliver"];
  if (creationType === "gift_reveal") return [...base, "gift", "photos", "clues", "format", ...tail];
  if (creationType === "combined") return [...base, "interview", "gift", "photos", "clues", "format", ...tail];
  return [...base, "interview", "photos", "format", ...tail];
}

export default function ResumeCreationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const store = useCreationStore();
  useAutoSave();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (store.creationId === id) { setLoading(false); return; }

    getCreationById(id).then((creation) => {
      if (creation) {
        store.setCreationId(creation.id);
        store.setCreationType(creation.type);
        store.setRelationshipType(creation.relationship_type);
        store.setRecipientName(creation.recipient_name);
        if (creation.interview_answers) {
          Object.entries(creation.interview_answers).forEach(([k, v]) =>
            store.setInterviewAnswer(k, v as string)
          );
        }
        if (creation.output_format) store.setOutputFormat(creation.output_format);
        if (creation.template_id) store.setTemplateId(creation.template_id);
        if (creation.generated_text) store.setGeneratedText(creation.generated_text);
        if (creation.generated_text_edited) store.setEditedText(creation.generated_text_edited);
        if (creation.dedication_message) store.setDedicationMessage(creation.dedication_message);
        if (creation.tier) store.setTier(creation.tier);
        // Resume at customize if text exists, otherwise photos
        store.setStep(creation.generated_text ? "customize" : "photos");
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const { currentStep, setStep, creationType } = store;
  const flow = getStepFlow(creationType);
  const stepIndex = flow.indexOf(currentStep);
  const progress = ((stepIndex + 1) / flow.length) * 100;
  const prevStep = stepIndex > 0 ? flow[stepIndex - 1] : undefined;

  if (loading) {
    return (
      <main className="min-h-screen bg-linen flex items-center justify-center">
        <p className="text-sm text-stone">Loading your Chère...</p>
      </main>
    );
  }

  function renderStep() {
    switch (currentStep) {
      case "type": return <TypeSelector />;
      case "relationship": return <RelationshipPicker />;
      case "interview": return <InterviewFlow />;
      case "gift": return <GiftDescriber />;
      case "photos": return <PhotoUploader />;
      case "clues": return <ClueBuilder />;
      case "format": return <FormatPicker />;
      case "customize": return <CustomizeStep />;
      case "preview": return <PreviewStep />;
      case "payment": return <PaymentStep />;
      case "deliver": return <DeliveryStep />;
      default: return null;
    }
  }

  return (
    <main className="min-h-screen bg-linen">
      <div className="fixed top-0 left-0 right-0 z-50" style={{ height: "2px", backgroundColor: "var(--color-parchment)" }}>
        <motion.div className="h-full" style={{ backgroundColor: "var(--color-muted-gold)" }}
          initial={false} animate={{ width: `${Math.max(0, progress)}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} />
      </div>
      <AnimatePresence>
        {prevStep && (
          <motion.button key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onClick={() => setStep(prevStep)}
            className="fixed top-5 left-6 z-40 flex items-center gap-1.5 text-sm text-stone hover:text-espresso transition-colors duration-300">
            <span aria-hidden="true">←</span><span>Back</span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
