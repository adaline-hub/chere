export interface WalkthroughProps {
  walkthrough?: {
    active: boolean;
    paused: boolean;
    onAdvance: () => void;
    onComplete: () => void;
  };
}
