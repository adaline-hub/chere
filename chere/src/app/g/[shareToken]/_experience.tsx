"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FirstOpenExperience from "@/components/tribute/FirstOpenExperience";
import ReactionCam from "@/components/tribute/ReactionCam";
import ScrollytellingRenderer from "@/components/tribute/ScrollytellingRenderer";
import MemoryWrappedRenderer from "@/components/tribute/MemoryWrappedRenderer";
import LoveLetterRenderer from "@/components/tribute/LoveLetterRenderer";
import StorybookRenderer from "@/components/tribute/StorybookRenderer";
import CompanionRenderer from "@/components/tribute/CompanionRenderer";
import WalkthroughBar from "@/components/audio/WalkthroughBar";
import RecipientMuteButton from "@/components/audio/RecipientMuteButton";
import { RecipientAudioProvider } from "@/lib/audio/useRecipientAudio";
import { useWalkthrough } from "@/lib/walkthrough/useWalkthrough";
import type { TributeCreation } from "@/lib/mock/tribute-data";

function getTotalSteps(creation: TributeCreation): number {
  const paragraphs = creation.generatedText.split(/\n\n+/).filter((p) => p.trim()).length;
  switch (creation.outputFormat) {
    case "memory_wrapped":
      return Math.max(1, paragraphs + creation.photos.length + (creation.dedicationMessage ? 3 : 2));
    case "love_letter":
      return Math.max(1, paragraphs + creation.photos.length + (creation.dedicationMessage ? 2 : 1));
    case "storybook":
      return Math.max(1, paragraphs + creation.photos.length + (creation.dedicationMessage ? 2 : 1));
    case "companion":
      return Math.max(1, paragraphs + 2);
    case "scrollytelling":
    default:
      return Math.max(1, paragraphs + creation.photos.length + (creation.dedicationMessage ? 2 : 1));
  }
}

export default function TributeExperience({
  creation,
  creationId,
}: {
  creation: TributeCreation;
  creationId: string;
}) {
  const [opened, setOpened] = useState(false);
  const [walkthroughActive, setWalkthroughActive] = useState(false);
  const totalSteps = useMemo(() => getTotalSteps(creation), [creation]);
  const walkthrough = useWalkthrough(totalSteps);
  const hasAudio = !!(
    creation.audio?.dedicationUrl
    || Object.keys(creation.audio?.memories ?? {}).length > 0
  );

  function handleOpen() {
    setOpened(true);
    fetch("/api/interactions/opened", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creationId }),
    }).catch(() => {});
  }

  function renderTribute() {
    const markComplete = () => {
      for (let i = 0; i < walkthrough.totalSteps; i++) walkthrough.next();
    };
    const walkthroughProps = walkthroughActive
      ? {
          walkthrough: {
            active: true,
            paused: walkthrough.state !== "playing",
            onAdvance: walkthrough.next,
            onComplete: markComplete,
          },
        }
      : undefined;

    switch (creation.outputFormat) {
      case "memory_wrapped":
        return <MemoryWrappedRenderer creation={creation} {...walkthroughProps} />;
      case "love_letter":
        return <LoveLetterRenderer creation={creation} {...walkthroughProps} />;
      case "storybook":
        return <StorybookRenderer creation={creation} {...walkthroughProps} />;
      case "companion":
        return <CompanionRenderer creation={creation} {...walkthroughProps} />;
      case "scrollytelling":
      default:
        return <ScrollytellingRenderer creation={creation} {...walkthroughProps} />;
    }
  }

  return (
    <RecipientAudioProvider>
      <AnimatePresence mode="wait">
        {!opened ? (
          <FirstOpenExperience
            key="open"
            recipientName={creation.recipientName}
            creatorName={creation.creatorName}
            templateId={creation.templateId}
            onOpen={handleOpen}
          />
        ) : (
          <motion.div
            key="tribute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {!walkthroughActive && (
              <button
                type="button"
                onClick={() => {
                  walkthrough.restart();
                  setWalkthroughActive(true);
                }}
                style={{
                  position: "fixed",
                  top: "1rem",
                  right: hasAudio ? "3.75rem" : "1rem",
                  zIndex: 80,
                  backgroundColor: "rgba(250,247,244,0.9)",
                  border: "1px solid rgba(196,169,125,0.4)",
                  borderRadius: "999px",
                  padding: "0.45rem 0.8rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "#6A5D56",
                  backdropFilter: "blur(6px)",
                  cursor: "pointer",
                }}
              >
                ▶ Auto-play
              </button>
            )}

            <RecipientMuteButton hasAudio={hasAudio} />
            {renderTribute()}

            {walkthroughActive && (
              <WalkthroughBar
                state={walkthrough.state}
                progress={walkthrough.progress}
                step={walkthrough.step}
                totalSteps={walkthrough.totalSteps}
                onToggle={walkthrough.toggle}
                onRestart={walkthrough.restart}
                onExit={() => {
                  setWalkthroughActive(false);
                  walkthrough.pause();
                }}
              />
            )}

            {creation.reactionCamEnabled && (
              <ReactionCam creationId={creationId} recipientName={creation.recipientName} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </RecipientAudioProvider>
  );
}
