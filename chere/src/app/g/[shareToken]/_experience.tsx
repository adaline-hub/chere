"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FirstOpenExperience from "@/components/tribute/FirstOpenExperience";
import ReactionCam from "@/components/tribute/ReactionCam";
import ScrollytellingRenderer from "@/components/tribute/ScrollytellingRenderer";
import MemoryWrappedRenderer from "@/components/tribute/MemoryWrappedRenderer";
import LoveLetterRenderer from "@/components/tribute/LoveLetterRenderer";
import StorybookRenderer from "@/components/tribute/StorybookRenderer";
import CompanionRenderer from "@/components/tribute/CompanionRenderer";
import type { TributeCreation } from "@/lib/mock/tribute-data";

export default function TributeExperience({
  creation,
  creationId,
}: {
  creation: TributeCreation;
  creationId: string;
}) {
  const [opened, setOpened] = useState(false);

  function handleOpen() {
    setOpened(true);
    fetch("/api/interactions/opened", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creationId }),
    }).catch(() => {});
  }

  function renderTribute() {
    switch (creation.outputFormat) {
      case "memory_wrapped":
        return <MemoryWrappedRenderer creation={creation} />;
      case "love_letter":
        return <LoveLetterRenderer creation={creation} />;
      case "storybook":
        return <StorybookRenderer creation={creation} />;
      case "companion":
        return <CompanionRenderer creation={creation} />;
      case "scrollytelling":
      default:
        return <ScrollytellingRenderer creation={creation} />;
    }
  }

  return (
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
          {renderTribute()}
          {creation.reactionCamEnabled && (
            <ReactionCam creationId={creationId} recipientName={creation.recipientName} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
