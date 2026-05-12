"use client";

import { useEffect, useRef } from "react";
import { useCreationStore } from "@/stores/creation-store";
import { createCreation, updateCreation } from "@/lib/supabase/creations";
import { createClient } from "@/lib/supabase/client";

// Syncs Zustand store to Supabase as the wizard advances.
// Creates the DB row once relationship step completes; updates on each step change.
export function useAutoSave() {
  const store = useCreationStore();
  const {
    creationId,
    setCreationId,
    setShareToken,
    currentStep,
    creationType,
    relationshipType,
    recipientName,
    interviewAnswers,
    outputFormat,
    templateId,
    generatedText,
    editedText,
    dedicationMessage,
    tier,
  } = store;

  const creating = useRef(false);
  const prevStep = useRef(currentStep);

  // Create row when we first have the minimum required fields (after relationship step)
  useEffect(() => {
    if (creationId || creating.current) return;
    if (!creationType || !relationshipType || !recipientName) return;

    async function create() {
      creating.current = true;
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // not logged in yet — will create after auth

        const row = await createCreation({
          creatorId: user.id,
          type: creationType!,
          relationshipType: relationshipType!,
          recipientName,
        });
        setCreationId(row.id);
        if (row.share_token) setShareToken(row.share_token as string);
      } catch {
        // Silently fail — wizard continues with local state
      } finally {
        creating.current = false;
      }
    }

    create();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creationType, relationshipType, recipientName]);

  // Save output_format immediately whenever it changes — never let stale closures default it
  useEffect(() => {
    if (!creationId || !outputFormat) return;
    updateCreation(creationId, { output_format: outputFormat, template_id: templateId }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creationId, outputFormat, templateId]);

  // Save on step advancement
  useEffect(() => {
    if (!creationId || currentStep === prevStep.current) return;
    prevStep.current = currentStep;

    updateCreation(creationId, {
      interview_answers: interviewAnswers,
      ...(outputFormat ? { output_format: outputFormat } : {}),
      template_id: templateId,
      generated_text: generatedText || null,
      generated_text_edited: editedText,
      dedication_message: dedicationMessage || null,
      tier,
    }).catch(() => {/* silently fail */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Debounced save for text fields
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!creationId) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateCreation(creationId, {
        interview_answers: interviewAnswers,
        generated_text_edited: editedText,
        dedication_message: dedicationMessage || null,
      }).catch(() => {});
    }, 2000);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewAnswers, editedText, dedicationMessage]);
}
