"use client";

import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import type { Reaction } from "./character-animations";

type SceneId = "kitchen" | "living-room" | "backyard" | "cafe";

// Positions are % from top-left of the scene container.
// Derived from scene visual layout (counter at 63%, sofa at 52%, grass at 55%, table at 55%).
const POSITIONS: Record<
  SceneId,
  {
    creator: { left: string; top: string };
    recipient: { left: string; top: string };
    pet: { left: string; top: string };
  }
> = {
  kitchen: {
    creator: { left: "36%", top: "43%" },
    recipient: { left: "50%", top: "45%" },
    pet: { left: "55%", top: "57%" },
  },
  "living-room": {
    creator: { left: "32%", top: "48%" },
    recipient: { left: "46%", top: "50%" },
    pet: { left: "46%", top: "54%" },
  },
  backyard: {
    creator: { left: "27%", top: "42%" },
    recipient: { left: "41%", top: "44%" },
    pet: { left: "53%", top: "56%" },
  },
  cafe: {
    creator: { left: "33%", top: "40%" },
    recipient: { left: "54%", top: "40%" },
    pet: { left: "54%", top: "49%" },
  },
};

// ─── Animation helpers ────────────────────────────────────────────────────────

type AnimTarget = Record<string, number | number[] | string | string[]>;
type AnimResult = { animate: AnimTarget; transition: Transition };

const EASE = "easeInOut" as const;

function getBodyAnim(reaction: Reaction, side: "creator" | "recipient"): AnimResult {
  const d = side === "creator" ? 1 : -1;
  switch (reaction) {
    case "hug":
      return { animate: { x: d * 15 }, transition: { duration: 1.2, ease: EASE } };
    case "laugh":
      return {
        animate: { y: [0, -6, 0, -6, 0, -5, 0], rotate: [0, d * 2, 0, -d * 2, 0] },
        transition: { duration: 1.5, ease: EASE },
      };
    case "sit":
      return { animate: { x: d * 8, rotate: -d * 2 }, transition: { duration: 0.8, ease: EASE } };
    case "dance":
      return {
        animate: {
          x: [0, d * 5, -d * 5, d * 5, -d * 5, d * 3, 0],
          rotate: [0, d * 3, -d * 3, d * 3, -d * 3, 0, 0],
        },
        transition: { duration: 2.4 },
      };
    default:
      return { animate: { x: 0, y: 0, rotate: 0 }, transition: { duration: 0.6 } };
  }
}

function getArmAnim(reaction: Reaction, side: "creator" | "recipient"): AnimResult {
  if (reaction === "wave" && side === "creator") {
    return {
      animate: { rotate: [0, -50, -5, -50, -5, -45, 0] },
      transition: { duration: 1.5, ease: EASE },
    };
  }
  if (reaction === "hug") {
    const r = side === "creator" ? -75 : 75;
    return { animate: { rotate: r }, transition: { duration: 1.2, ease: EASE } };
  }
  return { animate: { rotate: 0 }, transition: { duration: 0.5 } };
}

function getPetBodyAnim(reaction: Reaction): AnimResult {
  switch (reaction) {
    case "hug":
      return { animate: { x: 12 }, transition: { duration: 1.2, ease: EASE } };
    case "laugh":
      return { animate: { y: [0, -12, 0, -12, 0, -8, 0] }, transition: { duration: 1.5 } };
    case "dance":
      return { animate: { rotate: [0, 360] }, transition: { duration: 1.5, ease: EASE } };
    case "sit":
      return { animate: { scaleY: 0.8, y: 6 }, transition: { duration: 0.8 } };
    default:
      return { animate: { x: 0, y: 0, rotate: 0, scaleY: 1 }, transition: { duration: 0.5 } };
  }
}

function getTailAnim(reaction: Reaction): AnimResult {
  if (reaction === "wave" || reaction === "dance") {
    return {
      animate: { rotate: [-25, 25, -25, 25, -20, 0] },
      transition: { duration: reaction === "dance" ? 2.4 : 1.5, ease: EASE },
    };
  }
  if (reaction === "laugh") {
    return { animate: { rotate: [-20, 20, -15, 0] }, transition: { duration: 1.5 } };
  }
  return { animate: { rotate: 0 }, transition: { duration: 0.5 } };
}

// ─── Creator figure (~48×88) ──────────────────────────────────────────────────

function CreatorFigure({ reaction }: { reaction: Reaction }) {
  const arm = getArmAnim(reaction, "creator");
  return (
    <svg width="48" height="88" viewBox="0 0 48 88" fill="none" overflow="visible">
      <circle cx="24" cy="14" r="12" fill="#F5EDE0" />
      <path d="M12 11 Q24 3 36 11" stroke="#C4A97D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="16" y="28" width="16" height="28" rx="5" fill="#2A2420" />
      {/* Left arm — static */}
      <line x1="16" y1="33" x2="5" y2="52" stroke="#2A2420" strokeWidth="6" strokeLinecap="round" />
      {/* Right arm — animated */}
      <motion.line
        x1="32" y1="33" x2="43" y2="52"
        stroke="#2A2420" strokeWidth="6" strokeLinecap="round"
        style={{ transformOrigin: "32px 33px" }}
        animate={arm.animate}
        transition={arm.transition}
      />
      <line x1="19" y1="56" x2="15" y2="82" stroke="#2A2420" strokeWidth="7" strokeLinecap="round" />
      <line x1="29" y1="56" x2="33" y2="82" stroke="#2A2420" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

// ─── Recipient figure (~44×76) ────────────────────────────────────────────────

function RecipientFigure({ reaction }: { reaction: Reaction }) {
  const arm = getArmAnim(reaction, "recipient");
  return (
    <svg width="44" height="76" viewBox="0 0 44 76" fill="none" overflow="visible">
      <circle cx="22" cy="12" r="10" fill="#F5EDE0" />
      <path d="M13 10 Q22 3 31 10" stroke="#B8956A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="14" y="24" width="14" height="24" rx="4" fill="#C4A97D" />
      {/* Left arm — animated for hug */}
      <motion.line
        x1="14" y1="28" x2="4" y2="45"
        stroke="#C4A97D" strokeWidth="5.5" strokeLinecap="round"
        style={{ transformOrigin: "14px 28px" }}
        animate={arm.animate}
        transition={arm.transition}
      />
      {/* Right arm — static */}
      <line x1="28" y1="28" x2="38" y2="45" stroke="#C4A97D" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="18" y1="48" x2="14" y2="70" stroke="#C4A97D" strokeWidth="6" strokeLinecap="round" />
      <line x1="26" y1="48" x2="30" y2="70" stroke="#C4A97D" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

// ─── Pet figure (~56×44) ──────────────────────────────────────────────────────

function PetFigure({ reaction }: { reaction: Reaction }) {
  const tail = getTailAnim(reaction);
  return (
    <svg width="56" height="46" viewBox="0 0 56 46" fill="none" overflow="visible">
      {/* Body */}
      <rect x="6" y="16" width="34" height="20" rx="9" fill="#C4A97D" />
      {/* Head */}
      <circle cx="46" cy="22" r="10" fill="#C4A97D" />
      {/* Ears */}
      <polygon points="40,14 44,23 36,23" fill="#B8956A" />
      <polygon points="51,14 57,23 48,23" fill="#B8956A" />
      {/* Eyes */}
      <circle cx="43" cy="21" r="2" fill="#5A4030" />
      <circle cx="49" cy="21" r="2" fill="#5A4030" />
      {/* Nose */}
      <ellipse cx="46" cy="26" rx="2" ry="1.5" fill="#8B6A50" />
      {/* Legs */}
      <line x1="13" y1="36" x2="11" y2="46" stroke="#C4A97D" strokeWidth="5" strokeLinecap="round" />
      <line x1="22" y1="36" x2="20" y2="46" stroke="#C4A97D" strokeWidth="5" strokeLinecap="round" />
      <line x1="31" y1="36" x2="33" y2="46" stroke="#C4A97D" strokeWidth="5" strokeLinecap="round" />
      <line x1="22" y1="36" x2="24" y2="46" stroke="#C4A97D" strokeWidth="5" strokeLinecap="round" />
      {/* Tail — animated */}
      <motion.line
        x1="6" y1="24" x2="-2" y2="16"
        stroke="#C4A97D" strokeWidth="5" strokeLinecap="round"
        style={{ transformOrigin: "6px 24px" }}
        animate={tail.animate}
        transition={tail.transition}
      />
    </svg>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function CharacterPair({
  scene,
  reaction,
  isPet,
}: {
  scene: SceneId;
  reaction: Reaction;
  isPet: boolean;
}) {
  const pos = POSITIONS[scene];

  const creator = getBodyAnim(reaction, "creator");
  const recipientBody = isPet ? getPetBodyAnim(reaction) : getBodyAnim(reaction, "recipient");

  const idleAnimate = { scale: [1, 1.016, 1] as [number, number, number] };
  const idleTransition: Transition = { duration: 3.5, repeat: Infinity, ease: EASE };

  return (
    <>
      {/* Creator */}
      <div style={{ position: "absolute", left: pos.creator.left, top: pos.creator.top, zIndex: 8, pointerEvents: "none" }}>
        <motion.div
          key={`creator-${reaction}`}
          animate={reaction === "default" ? idleAnimate : creator.animate}
          transition={reaction === "default" ? idleTransition : creator.transition}
          style={{ display: "inline-block" }}
        >
          <CreatorFigure reaction={reaction} />
        </motion.div>
      </div>

      {/* Recipient or Pet */}
      <div
        style={{
          position: "absolute",
          left: isPet ? pos.pet.left : pos.recipient.left,
          top: isPet ? pos.pet.top : pos.recipient.top,
          zIndex: 8,
          pointerEvents: "none",
        }}
      >
        <motion.div
          key={`recipient-${reaction}`}
          animate={reaction === "default" ? idleAnimate : recipientBody.animate}
          transition={
            reaction === "default"
              ? { ...idleTransition, delay: 0.9 }
              : recipientBody.transition
          }
          style={{ display: "inline-block" }}
        >
          {isPet ? <PetFigure reaction={reaction} /> : <RecipientFigure reaction={reaction} />}
        </motion.div>
      </div>
    </>
  );
}
