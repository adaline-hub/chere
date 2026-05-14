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
    setSaveStatus,
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
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function markSaved() {
    setSaveStatus("saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveStatus("idle"), 2000);
  }

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  // Create row when we first have the minimum required fields (after relationship step)
  useEffect(() => {
    if (creationId || creating.current) return;
    if (!creationType || !relationshipType || !recipientName) return;

    async function create() {
      creating.current = true;
      setSaveStatus("saving");
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? "",
          display_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? (user.email?.split("@")[0] ?? "User"),
        }, { onConflict: "id", ignoreDuplicates: true });

        console.log("AUTO-SAVE: attempting to create creation...");
        const creation = await createCreation({
          creatorId: user.id,
          type: creationType!,
          relationshipType: relationshipType!,
          recipientName,
        });
        console.log("AUTO-SAVE: success, share_token:", creation.share_token);
        setCreationId(creation.id);
        if (creation.share_token) setShareToken(creation.share_token as string);
        markSaved();
      } catch (error) {
        console.error("AUTO-SAVE: createCreation FAILED:", error);
        setSaveStatus("error");
      } finally {
        creating.current = false;
      }
    }

    create();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creationType, relationshipType, recipientName]);

  // Save output_format immediately whenever it changes
  useEffect(() => {
    if (!creationId || !outputFormat) return;
    setSaveStatus("saving");
    updateCreation(creationId, { output_format: outputFormat, template_id: templateId })
      .then(markSaved)
      .catch(() => setSaveStatus("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creationId, outputFormat, templateId]);

  // Save on step advancement
  useEffect(() => {
    if (!creationId || currentStep === prevStep.current) return;
    prevStep.current = currentStep;

    setSaveStatus("saving");
    updateCreation(creationId, {
      interview_answers: interviewAnswers,
      ...(outputFormat ? { output_format: outputFormat } : {}),
      template_id: templateId,
      generated_text: generatedText || null,
      generated_text_edited: editedText,
      dedication_message: dedicationMessage || null,
      tier,
    })
      .then(markSaved)
      .catch(() => setSaveStatus("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Debounced save for text fields
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!creationId) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      updateCreation(creationId, {
        interview_answers: interviewAnswers,
        generated_text_edited: editedText,
        dedication_message: dedicationMessage || null,
      })
        .then(markSaved)
        .catch(() => setSaveStatus("error"));
    }, 2000);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewAnswers, editedText, dedicationMessage]);
}
