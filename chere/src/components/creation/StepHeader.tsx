"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { WizardStep } from "@/stores/creation-store";
import { STEP_LABELS } from "@/components/creation/WizardStepIndicator";

type Props = {
  step: WizardStep;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
};

export default function StepHeader({ step, title, subtitle, className = "mb-3" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-center ${className}`}
    >
      <p
        className="font-serif uppercase mb-2"
        style={{ fontSize: "11px", letterSpacing: "0.15em", color: "var(--color-stone)" }}
      >
        {STEP_LABELS[step]}
      </p>
      <h1 className="font-serif text-3xl text-espresso">{title}</h1>
      {subtitle && (
        <p className="text-stone mt-1 text-sm leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}
