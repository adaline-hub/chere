import { useMemo, useState } from "react";

export type WalkthroughState = "idle" | "playing" | "paused" | "complete";

export interface WalkthroughController {
  state: WalkthroughState;
  progress: number;
  step: number;
  totalSteps: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  next: () => void;
}

export function useWalkthrough(totalSteps: number): WalkthroughController {
  const safeTotal = Math.max(1, totalSteps);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WalkthroughState>("idle");

  const progress = useMemo(() => {
    if (safeTotal <= 1) return step > 0 || state === "complete" ? 1 : 0;
    return Math.max(0, Math.min(1, step / (safeTotal - 1)));
  }, [safeTotal, state, step]);

  function play() {
    setState((prev) => {
      if (prev === "complete") {
        setStep(0);
        return "playing";
      }
      return "playing";
    });
  }

  function pause() {
    setState((prev) => (prev === "playing" ? "paused" : prev));
  }

  function toggle() {
    setState((prev) => {
      if (prev === "playing") return "paused";
      if (prev === "complete") {
        setStep(0);
        return "playing";
      }
      return "playing";
    });
  }

  function restart() {
    setStep(0);
    setState("playing");
  }

  function next() {
    setStep((prev) => {
      const nextStep = Math.min(prev + 1, safeTotal - 1);
      if (nextStep >= safeTotal - 1) setState("complete");
      return nextStep;
    });
  }

  return { state, progress, step, totalSteps: safeTotal, play, pause, toggle, restart, next };
}
