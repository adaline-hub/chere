"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FirstOpenExperience from "@/components/tribute/FirstOpenExperience";
import ScrollytellingRenderer from "@/components/tribute/ScrollytellingRenderer";
import MemoryWrappedRenderer from "@/components/tribute/MemoryWrappedRenderer";
import LoveLetterRenderer from "@/components/tribute/LoveLetterRenderer";
import type { TributeCreation } from "@/lib/mock/tribute-data";

export default function TributeExperience({ creation }: { creation: TributeCreation }) {
  const [opened, setOpened] = useState(false);

  function renderTribute() {
    switch (creation.outputFormat) {
      case "memory_wrapped":
        return <MemoryWrappedRenderer creation={creation} />;
      case "love_letter":
        return <LoveLetterRenderer creation={creation} />;
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
          onOpen={() => setOpened(true)}
        />
      ) : (
        <motion.div
          key="tribute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {renderTribute()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
