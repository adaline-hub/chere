"use client";

import { use, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore, type WizardStep } from "@/stores/creation-store";
import type { CreationType, OutputFormat } from "@/lib/supabase/types";
import { getCreationById } from "@/lib/supabase/creations";
import { useAutoSave } from "@/hooks/useAutoSave";
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
import WizardStepIndicator from "@/components/creation/WizardStepIndicator";

function getStepFlow(creationType: CreationType | null, outputFormat: OutputFormat | null): WizardStep[] {
  const base: WizardStep[] = ["type", "relationship"];

  if (outputFormat === "recipe_book") {
    return [...base, "format", "payment", "deliver"];
  }

  const tail: WizardStep[] = ["customize", "audio", "preview", "payment", "deliver"];
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

  const [loading, setLoading] = useState(store.creationId !== id);

  useEffect(() => {
    if (store.creationId === id) return;

    getCreationById(id).then((creation) => {
      if (creation) {
        store.setCreationId(creation.id);
        store.setCreationType(creation.type);
        store.setRelationshipType(creation.relationship_type);
        store.setRecipientName(creation.recipient_name);
        if (creation.share_token) store.setShareToken(creation.share_token);
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

  const { currentStep, setStep, creationType, outputFormat } = store;
  const flow = getStepFlow(creationType, outputFormat);
  const stepIndex = flow.indexOf(currentStep);
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
      case "audio": return <RecordMessageStep />;
      case "preview": return <PreviewStep />;
      case "payment": return <PaymentStep />;
      case "deliver": return <DeliveryStep />;
      default: return null;
    }
  }

  return (
    <main className="min-h-screen bg-linen" style={{ paddingTop: "120px" }}>
      <AppHeader />
      <WizardStepIndicator flow={flow} currentStep={currentStep} onJump={setStep} />
      <AnimatePresence>
        {prevStep && (
          <motion.button key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onClick={() => setStep(prevStep)}
            className="fixed left-6 z-40 flex items-center gap-1.5 text-sm text-stone hover:text-espresso transition-colors duration-300"
            style={{ top: "128px" }}>
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
