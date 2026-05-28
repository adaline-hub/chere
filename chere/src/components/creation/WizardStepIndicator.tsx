import type { WizardStep } from "@/stores/creation-store";

const STEP_LABELS: Record<WizardStep, string> = {
  type: "Gift type",
  relationship: "Who it's for",
  interview: "Their story",
  gift: "About the gift",
  photos: "Photos",
  clues: "Clues",
  format: "Format",
  customize: "Customize",
  audio: "Record a message",
  preview: "Preview",
  payment: "Payment",
  deliver: "Deliver",
};

type WizardStepIndicatorProps = {
  flow: WizardStep[];
  currentStep: WizardStep;
  onJump: (step: WizardStep) => void;
};

export default function WizardStepIndicator({ flow, currentStep, onJump }: WizardStepIndicatorProps) {
  const currentIndex = flow.indexOf(currentStep);
  const currentLabel = STEP_LABELS[currentStep] ?? "Step";

  return (
    <div
      className="fixed left-0 right-0 z-40"
      style={{ top: "56px", padding: "0.875rem 1rem", backgroundColor: "var(--color-linen)" }}
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="flex items-center justify-center">
          {flow.map((step, index) => {
            const label = STEP_LABELS[step] ?? "Step";
            const isVisited = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <div key={step} className="flex items-center">
                {isVisited ? (
                  <button
                    type="button"
                    aria-label={`Go back to ${label}`}
                    onClick={() => onJump(step)}
                    className="rounded-full"
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "var(--color-muted-gold)",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  />
                ) : isCurrent ? (
                  <div
                    aria-current="step"
                    className="rounded-full"
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "var(--color-muted-gold)",
                      boxShadow: "0 0 0 3px rgba(196,169,125,0.18)",
                      transition: "all 0.25s ease",
                    }}
                  />
                ) : (
                  <div
                    className="rounded-full"
                    style={{
                      width: "8px",
                      height: "8px",
                      border: "1px solid var(--color-stone)",
                      backgroundColor: "transparent",
                      cursor: isFuture ? "not-allowed" : "default",
                      transition: "all 0.25s ease",
                    }}
                  />
                )}

                {index < flow.length - 1 && (
                  <div
                    aria-hidden="true"
                    style={{
                      width: "12px",
                      height: "1px",
                      margin: "0 2px",
                      backgroundColor: "var(--color-muted-gold)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-2 text-center font-serif text-sm" style={{ color: "#2A2420" }}>
          {currentLabel}
        </p>
      </div>
    </div>
  );
}
