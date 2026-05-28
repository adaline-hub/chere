import type { WizardStep } from "@/stores/creation-store";

const STEP_LABELS: Record<WizardStep, string> = {
  type: "Gift type",
  relationship: "Who it's for",
  interview: "Their story",
  gift: "About the gift",
  photos: "Photos",
  clues: "Clues",
  format: "Format",
  cover: "Cover & intro",
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

  return (
    <div
      className="fixed left-0 right-0 z-40"
      style={{ top: "56px", padding: "0.875rem 1rem", backgroundColor: "var(--color-linen)" }}
    >
      <div className="mx-auto w-full max-w-5xl overflow-x-auto">
        <div className="mx-auto flex min-w-max items-start justify-center px-2">
          {flow.map((step, index) => {
            const label = STEP_LABELS[step] ?? "Step";
            const isVisited = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step} className="flex min-w-[78px] items-start">
                <div className="flex w-full flex-col items-center">
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
                        transition: "all 0.25s ease",
                      }}
                    />
                  )}

                  <p
                    className="mt-2 text-center font-serif text-[11px] leading-tight"
                    style={{ color: isCurrent ? "#2A2420" : "var(--color-stone)" }}
                  >
                    {label}
                  </p>
                </div>

                {index < flow.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="mt-[4px] h-px w-8"
                    style={{ backgroundColor: "var(--color-muted-gold)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
