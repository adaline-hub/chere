"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TributeCreation } from "@/lib/mock/tribute-data";
import CharacterPair from "./companion/CharacterPair";
import AudioNarration from "./companion/AudioNarration";
import { detectTone, type Reaction } from "./companion/character-animations";

// ─── Types ────────────────────────────────────────────────────────────────────

type SceneId = "kitchen" | "living-room" | "backyard" | "cafe";
type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

interface HotspotDef {
  id: string;
  label: string;
  x: number; // % from left
  y: number; // % from top
}

interface Memory {
  text: string;
  photo: { url: string; caption: string } | null;
}

// ─── Time of day ──────────────────────────────────────────────────────────────

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

const WINDOW_GRADIENT: Record<TimeOfDay, string> = {
  morning: "linear-gradient(to bottom, #D4E8F8 0%, #F5E8B0 100%)",
  afternoon: "linear-gradient(to bottom, #87CEEB 0%, #E0F0FF 100%)",
  evening: "linear-gradient(to bottom, #FF8C40 0%, #E05080 50%, #6070B0 100%)",
  night: "linear-gradient(to bottom, #080818 0%, #101830 60%, #182040 100%)",
};

const WINDOW_GLOW: Record<TimeOfDay, string> = {
  morning: "radial-gradient(ellipse, rgba(255,220,120,0.4) 0%, transparent 70%)",
  afternoon: "radial-gradient(ellipse, rgba(200,230,255,0.3) 0%, transparent 70%)",
  evening: "radial-gradient(ellipse, rgba(255,140,60,0.4) 0%, transparent 70%)",
  night: "radial-gradient(ellipse, rgba(180,200,255,0.12) 0%, transparent 70%)",
};

// ─── Sound ────────────────────────────────────────────────────────────────────

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.9);
  } catch {
    // audio not available in this context
  }
}

// ─── Scene selection ──────────────────────────────────────────────────────────

function getScene(rel: string): SceneId {
  const r = (rel || "").toLowerCase();
  if (["mom", "dad", "mother", "father", "grandma", "grandpa", "grandmother", "grandfather", "grandparent", "parent"].some((k) => r.includes(k))) return "kitchen";
  if (["partner", "spouse", "husband", "wife", "boyfriend", "girlfriend", "fiancé", "fiance"].some((k) => r.includes(k))) return "living-room";
  if (["pet", "dog", "cat", "puppy", "kitten", "bunny", "rabbit"].some((k) => r.includes(k))) return "backyard";
  return "cafe";
}

// ─── Hotspot definitions ──────────────────────────────────────────────────────

const SCENE_HOTSPOTS: Record<SceneId, HotspotDef[]> = {
  kitchen: [
    { id: "mug", label: "The morning mug", x: 28, y: 66 },
    { id: "recipe", label: "The recipe book", x: 52, y: 64 },
    { id: "frame", label: "The photo frame", x: 78, y: 38 },
    { id: "bowl", label: "The fruit bowl", x: 18, y: 68 },
    { id: "plant", label: "The herb pot", x: 65, y: 28 },
    { id: "mitt", label: "The oven mitt", x: 86, y: 52 },
  ],
  "living-room": [
    { id: "blanket", label: "The blanket", x: 40, y: 62 },
    { id: "book", label: "The book", x: 62, y: 72 },
    { id: "photo", label: "The photo frame", x: 20, y: 40 },
    { id: "mug", label: "The mug", x: 58, y: 68 },
    { id: "cushion", label: "The cushion", x: 28, y: 60 },
    { id: "lamp", label: "The lamp", x: 82, y: 42 },
  ],
  backyard: [
    { id: "ball", label: "The tennis ball", x: 22, y: 74 },
    { id: "bowl", label: "The food bowl", x: 45, y: 76 },
    { id: "leash", label: "The leash", x: 80, y: 42 },
    { id: "sunny", label: "The sunny patch", x: 60, y: 68 },
    { id: "toy", label: "The favourite toy", x: 35, y: 72 },
    { id: "pawprint", label: "Paw prints", x: 68, y: 80 },
  ],
  cafe: [
    { id: "cup1", label: "Your coffee", x: 35, y: 60 },
    { id: "cup2", label: "Their coffee", x: 55, y: 60 },
    { id: "phone", label: "The phone", x: 50, y: 72 },
    { id: "dessert", label: "The shared dessert", x: 44, y: 68 },
    { id: "napkin", label: "The napkin note", x: 30, y: 70 },
    { id: "book", label: "The magazine", x: 65, y: 66 },
  ],
};

// ─── Scene backgrounds ────────────────────────────────────────────────────────

function KitchenScene({ tod }: { tod: TimeOfDay }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#F5EDE0" }} />

      {/* Window with time-of-day gradient */}
      <div style={{ position: "absolute", left: "30%", top: "5%", width: "38%", height: "28%", background: WINDOW_GRADIENT[tod], border: "8px solid #E8D4C0", borderRadius: "2px" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "6px", backgroundColor: "#E8D4C0", transform: "translateX(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "6px", backgroundColor: "#E8D4C0", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", inset: 0, background: WINDOW_GLOW[tod] }} />
      </div>

      {/* Backsplash tile */}
      <div style={{
        position: "absolute", left: 0, top: "35%", right: 0, height: "28%",
        backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 49px, #DDD0C0 49px, #DDD0C0 50px), repeating-linear-gradient(0deg, transparent, transparent 49px, #DDD0C0 49px, #DDD0C0 50px)",
        backgroundSize: "50px 50px",
        backgroundColor: "#EDE0D0",
      }} />

      {/* Counter top */}
      <div style={{ position: "absolute", left: 0, top: "63%", right: 0, height: "7%", background: "linear-gradient(to bottom, #C49A70, #B8896A)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: "#D4B080", opacity: 0.6 }} />
      </div>

      {/* Floor */}
      <div style={{ position: "absolute", left: 0, top: "70%", right: 0, bottom: 0, background: "repeating-linear-gradient(90deg, #C49A70 0px, #C49A70 98px, #B8896A 98px, #B8896A 100px)" }} />

      {/* Cabinet */}
      <div style={{ position: "absolute", right: "5%", top: "38%", width: "12%", height: "20%", backgroundColor: "#E8D8C4", border: "2px solid #D4C0A8", borderRadius: "2px" }}>
        <div style={{ position: "absolute", right: "25%", top: "35%", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#C4A97D" }} />
      </div>

      {/* Steam puffs above mug position (28%, 58%) */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `calc(28% + ${(i - 1) * 6}px)`,
            top: "57%",
            width: "3px",
            height: "14px",
            borderRadius: "3px",
            backgroundColor: "rgba(255,255,255,0.5)",
            pointerEvents: "none",
          }}
          animate={{ y: [0, -18, -36], opacity: [0, 0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.65, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function LivingRoomScene({ tod }: { tod: TimeOfDay }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#F2EDE6" }} />

      {/* Window */}
      <div style={{ position: "absolute", left: "10%", top: "8%", width: "25%", height: "38%", background: WINDOW_GRADIENT[tod], border: "8px solid #E0D4C8" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "-12px", width: "4px", backgroundColor: "#D4C8BC" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, right: "-12px", width: "4px", backgroundColor: "#D4C8BC" }} />
        <div style={{ position: "absolute", inset: 0, background: WINDOW_GLOW[tod] }} />
      </div>

      {/* Bookshelf */}
      <div style={{ position: "absolute", right: "3%", top: "10%", width: "18%", height: "55%", backgroundColor: "#D4C0A8", border: "2px solid #C4B098" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: "6px", right: "6px", top: `${20 + i * 28}%`, height: "18%", display: "flex", gap: "3px" }}>
            {["#9B7A5C", "#C49A70", "#A89070", "#7A6050"].map((c, j) => (
              <div key={j} style={{ flex: 1, backgroundColor: c, borderRadius: "1px" }} />
            ))}
          </div>
        ))}
      </div>

      {/* Floor */}
      <div style={{ position: "absolute", left: 0, top: "72%", right: 0, bottom: 0, backgroundColor: "#D4B896" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 80px)", backgroundSize: "80px 100%" }} />
      </div>

      {/* Rug */}
      <div style={{ position: "absolute", left: "15%", top: "65%", width: "65%", height: "12%", backgroundColor: "#C4A07A", borderRadius: "4px", opacity: 0.5 }} />

      {/* Sofa */}
      <div style={{ position: "absolute", left: "20%", top: "52%", width: "55%", height: "22%", backgroundColor: "#C4B0A0", borderRadius: "12px 12px 4px 4px" }}>
        <div style={{ position: "absolute", top: "5%", left: "5%", right: "5%", height: "40%", backgroundColor: "#D4C0B0", borderRadius: "8px 8px 0 0" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "12%", height: "60%", backgroundColor: "#B8A090", borderRadius: "12px 4px 4px 4px" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "12%", height: "60%", backgroundColor: "#B8A090", borderRadius: "4px 12px 4px 4px" }} />
      </div>

      {/* Coffee table */}
      <div style={{ position: "absolute", left: "28%", top: "66%", width: "38%", height: "8%", backgroundColor: "#A08060", borderRadius: "4px" }}>
        <div style={{ position: "absolute", inset: "2px", backgroundColor: "#B09070", borderRadius: "3px" }} />
      </div>

      {/* Lamp glow — subtle flicker */}
      <motion.div
        style={{ position: "absolute", right: "3%", top: "20%", width: "22%", height: "35%", pointerEvents: "none" }}
        animate={{ opacity: [0.45, 0.65, 0.5, 0.68, 0.45] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,220,120,0.4), transparent 70%)" }} />
      </motion.div>
    </div>
  );
}

function BackyardScene({ tod }: { tod: TimeOfDay }) {
  const isNight = tod === "night";
  const isEvening = tod === "evening";
  const skyGrad = isNight
    ? "linear-gradient(to bottom, #05051A 0%, #0A1030 60%)"
    : isEvening
    ? "linear-gradient(to bottom, #FF7040 0%, #FFB060 40%, #C0C8E0 100%)"
    : "linear-gradient(to bottom, #C8DCEC 0%, #E8F0F8 60%)";

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: skyGrad }} />

      {/* Sun or Moon */}
      {!isNight ? (
        <div style={{ position: "absolute", right: "15%", top: "10%", width: "6%", aspectRatio: "1/1", background: "radial-gradient(circle, #FFE060, #FFC040)", borderRadius: "50%", boxShadow: "0 0 30px 10px rgba(255,200,60,0.3)" }} />
      ) : (
        <div style={{ position: "absolute", right: "15%", top: "10%", width: "5%", aspectRatio: "1/1", background: "radial-gradient(circle, #E8E8C0, #C8C890)", borderRadius: "50%", boxShadow: "0 0 20px 6px rgba(200,200,150,0.2)" }} />
      )}

      {/* Drifting clouds */}
      {[
        { startX: "8%", top: "8%", width: "18%", duration: 42, delay: 0 },
        { startX: "60%", top: "13%", width: "13%", duration: 58, delay: -20 },
      ].map((c, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: c.startX,
            top: c.top,
            width: c.width,
            height: "7%",
            backgroundColor: isNight ? "rgba(200,210,255,0.12)" : "rgba(255,255,255,0.7)",
            borderRadius: "50px",
            pointerEvents: "none",
          }}
          animate={{ x: ["0vw", "120vw"] }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "linear", repeatDelay: 0 }}
        />
      ))}

      {/* Grass */}
      <div style={{ position: "absolute", left: 0, top: "55%", right: 0, bottom: 0, background: isNight ? "linear-gradient(to bottom, #3A5A30, #2A4020)" : "linear-gradient(to bottom, #8FB87A, #7AA068)" }} />
      <div style={{ position: "absolute", left: 0, top: "53%", right: 0, height: "6%", background: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(154,200,122,0.5), transparent)" }} />

      {/* Fence */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} style={{ position: "absolute", left: `${i * 12.5 + 2}%`, top: "42%", width: "3%", height: "18%", backgroundColor: "#E8D4B8", borderRadius: "2px 2px 0 0" }} />
      ))}
      <div style={{ position: "absolute", left: 0, top: "48%", right: 0, height: "2.5%", backgroundColor: "#E8D4B8" }} />
      <div style={{ position: "absolute", left: 0, top: "52%", right: 0, height: "2.5%", backgroundColor: "#E8D4B8" }} />

      {/* Tree */}
      <div style={{ position: "absolute", right: "15%", top: "22%", width: "3%", height: "35%", backgroundColor: "#8B6A48" }} />
      <div style={{ position: "absolute", right: "9%", top: "12%", width: "16%", height: "28%", backgroundColor: isNight ? "#3A5A30" : "#6A9A58", borderRadius: "50%" }} />

      {/* Sunny / moonlit patch */}
      <div style={{ position: "absolute", left: "50%", top: "62%", width: "20%", height: "12%", background: isNight ? "radial-gradient(ellipse, rgba(180,200,255,0.1), transparent 70%)" : "radial-gradient(ellipse, rgba(255,230,100,0.35), transparent 70%)" }} />
    </div>
  );
}

function CafeScene({ tod }: { tod: TimeOfDay }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#3A2E28" }} />
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: "65%", backgroundColor: "#4A3C34" }} />

      {/* Window */}
      <div style={{ position: "absolute", left: "5%", top: "8%", width: "28%", height: "40%", background: WINDOW_GRADIENT[tod], border: "10px solid #5C4A3C", borderRadius: "2px" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "4px", backgroundColor: "#5C4A3C", transform: "translateX(-50%)" }} />
        <div style={{ position: "absolute", inset: 0, background: WINDOW_GLOW[tod], opacity: 0.6 }} />
      </div>

      {/* Chalkboard */}
      <div style={{ position: "absolute", right: "8%", top: "10%", width: "22%", height: "30%", backgroundColor: "#2A3828", border: "6px solid #5C4A3C", borderRadius: "2px" }}>
        <div style={{ position: "absolute", top: "20%", left: "10%", right: "10%", height: "2px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "1px" }} />
        <div style={{ position: "absolute", top: "40%", left: "10%", right: "30%", height: "2px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "1px" }} />
      </div>

      {/* Pendant wire */}
      <div style={{ position: "absolute", left: "47%", top: 0, width: "2px", height: "28%", backgroundColor: "#5C4A3C" }} />

      {/* Pendant light — gentle sway */}
      <motion.div
        style={{ position: "absolute", left: "43%", top: "28%", width: "10%", transformOrigin: "5px 0", originX: 0.5, originY: 0 }}
        animate={{ rotate: [-1.8, 1.8, -1.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div style={{ width: "100%", paddingBottom: "80%", backgroundColor: "#C4A97D", borderRadius: "0 0 50% 50%", boxShadow: "0 4px 24px rgba(196,169,125,0.5)" }} />
      </motion.div>

      {/* Floor */}
      <div style={{ position: "absolute", left: 0, top: "65%", right: 0, bottom: 0, backgroundColor: "#8B7060" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 60px)", backgroundSize: "60px 100%" }} />
      </div>

      {/* Table */}
      <div style={{ position: "absolute", left: "25%", top: "55%", width: "48%", height: "20%", backgroundColor: "#6A5040", borderRadius: "4px 4px 2px 2px" }}>
        <div style={{ position: "absolute", inset: "3px", backgroundColor: "#7A6050", borderRadius: "3px" }} />
      </div>
      <div style={{ position: "absolute", left: "28%", top: "74%", width: "3%", height: "14%", backgroundColor: "#5A4030" }} />
      <div style={{ position: "absolute", right: "28%", top: "74%", width: "3%", height: "14%", backgroundColor: "#5A4030" }} />

      {/* Chairs */}
      <div style={{ position: "absolute", left: "14%", top: "58%", width: "10%", height: "16%", backgroundColor: "#5A4030", borderRadius: "4px 4px 0 0", opacity: 0.7 }} />
      <div style={{ position: "absolute", right: "14%", top: "58%", width: "10%", height: "16%", backgroundColor: "#5A4030", borderRadius: "4px 4px 0 0", opacity: 0.7 }} />
    </div>
  );
}

const SCENE_BG: Record<SceneId, React.ComponentType<{ tod: TimeOfDay }>> = {
  kitchen: KitchenScene,
  "living-room": LivingRoomScene,
  backyard: BackyardScene,
  cafe: CafeScene,
};

// ─── Hotspot shapes ───────────────────────────────────────────────────────────

function HotspotShape({ id, scene }: { id: string; scene: SceneId }) {
  const s: React.CSSProperties = { position: "relative" };
  if (scene === "kitchen") {
    if (id === "mug") return <div style={{ ...s, width: 28, height: 34, borderRadius: "2px 2px 6px 6px", backgroundColor: "#E8D8C8", border: "1.5px solid #C8B8A8" }} />;
    if (id === "recipe") return <div style={{ ...s, width: 22, height: 30, backgroundColor: "#9B7A5C", border: "1px solid #7A5A3C", borderRadius: "1px" }} />;
    if (id === "frame") return <div style={{ ...s, width: 26, height: 22, backgroundColor: "#E8D8C4", border: "3px solid #C4A97D", borderRadius: "2px" }} />;
    if (id === "bowl") return <div style={{ ...s, width: 34, height: 16, backgroundColor: "#E0C8A0", borderRadius: "0 0 17px 17px", border: "1.5px solid #C8B088" }} />;
    if (id === "plant") return <div style={{ ...s, width: 20, height: 24, backgroundColor: "#8FB87A", borderRadius: "50% 50% 0 0" }} />;
    if (id === "mitt") return <div style={{ ...s, width: 18, height: 28, backgroundColor: "#C4855A", borderRadius: "2px 2px 8px 8px" }} />;
  }
  if (scene === "living-room") {
    if (id === "blanket") return <div style={{ ...s, width: 44, height: 20, backgroundColor: "#C4A07A", borderRadius: "4px", transform: "rotate(-5deg)" }} />;
    if (id === "book") return <div style={{ ...s, width: 20, height: 26, backgroundColor: "#A07A5C", border: "1px solid #806050" }} />;
    if (id === "photo") return <div style={{ ...s, width: 24, height: 20, border: "3px solid #C4A97D", backgroundColor: "#F5EDE0" }} />;
    if (id === "mug") return <div style={{ ...s, width: 22, height: 26, borderRadius: "2px 2px 5px 5px", backgroundColor: "#E8D8C8", border: "1.5px solid #C8B8A8" }} />;
    if (id === "cushion") return <div style={{ ...s, width: 36, height: 24, backgroundColor: "#C8B0A0", borderRadius: "6px" }} />;
    if (id === "lamp") return <div style={{ ...s, width: 20, height: 28, backgroundColor: "#C4A97D", borderRadius: "10px 10px 2px 2px", opacity: 0.8 }} />;
  }
  if (scene === "backyard") {
    if (id === "ball") return <div style={{ ...s, width: 22, height: 22, borderRadius: "50%", backgroundColor: "#D4C050", border: "2px solid #B0A030" }} />;
    if (id === "bowl") return <div style={{ ...s, width: 30, height: 14, backgroundColor: "#C0C0C8", borderRadius: "0 0 15px 15px", border: "1.5px solid #A0A0A8" }} />;
    if (id === "leash") return <div style={{ ...s, width: 8, height: 32, backgroundColor: "#C4A97D", borderRadius: "4px" }} />;
    if (id === "sunny") return <div style={{ ...s, width: 36, height: 20, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,220,80,0.5), transparent 80%)" }} />;
    if (id === "toy") return <div style={{ ...s, width: 24, height: 16, backgroundColor: "#E05A40", borderRadius: "8px" }} />;
    if (id === "pawprint") return <div style={{ ...s, width: 20, height: 20, backgroundColor: "#8B7A6A", borderRadius: "50%", opacity: 0.6 }} />;
  }
  if (scene === "cafe") {
    if (id === "cup1" || id === "cup2") return <div style={{ ...s, width: 22, height: 22, borderRadius: "2px 2px 6px 6px", backgroundColor: "#F5EDE0", border: "1.5px solid #C8B8A0" }} />;
    if (id === "phone") return <div style={{ ...s, width: 14, height: 24, backgroundColor: "#2A2420", borderRadius: "3px", border: "1px solid #5A5048" }} />;
    if (id === "dessert") return <div style={{ ...s, width: 30, height: 18, backgroundColor: "#F5EDE0", borderRadius: "4px", border: "1px solid #C8B8A0" }} />;
    if (id === "napkin") return <div style={{ ...s, width: 26, height: 20, backgroundColor: "#FAF7F4", border: "1px solid #E0D4C8", transform: "rotate(-3deg)" }} />;
    if (id === "book") return <div style={{ ...s, width: 20, height: 26, backgroundColor: "#A07A5C", border: "1px solid #806050" }} />;
  }
  return <div style={{ ...s, width: 20, height: 20, borderRadius: "50%", backgroundColor: "#C4A97D" }} />;
}

// ─── Hotspot component ────────────────────────────────────────────────────────

function Hotspot({
  def, index, scene, hasMemory, discovered, preview, burstKey, onClick,
}: {
  def: HotspotDef; index: number; scene: SceneId; hasMemory: boolean; discovered: boolean; preview: boolean; burstKey: number; onClick: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  function handleClick() {
    if (!hasMemory || preview) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 180);
    onClick();
  }

  const interactive = hasMemory && !preview;
  return (
    <button
      onClick={handleClick}
      disabled={!interactive}
      aria-label={hasMemory ? `Discover memory: ${def.label}` : def.label}
      style={{
        position: "absolute",
        left: `${def.x}%`,
        top: `${def.y}%`,
        transform: `translate(-50%, -50%) scale(${pressed ? 0.92 : 1})`,
        cursor: interactive ? "pointer" : "default",
        zIndex: 10,
        transition: "transform 0.12s ease",
        background: "transparent",
        border: "none",
        padding: "12px",
        minWidth: "48px",
        minHeight: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ position: "relative", display: "inline-flex" }}>
        <HotspotShape id={def.id} scene={scene} />
        {hasMemory && !discovered && (
          <>
            <motion.span
              animate={{ scale: [1, 1.7, 1], opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.35, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: "-10px",
                borderRadius: "50%",
                border: "2px solid #C4A97D",
                pointerEvents: "none",
              }}
            />
            <span style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#C4A97D",
              boxShadow: "0 0 8px rgba(196,169,125,0.85)",
            }} />
            {burstKey > 0 && (
              <motion.span
                key={`burst-${burstKey}`}
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 2.4, 1], opacity: [0, 0.9, 0] }}
                transition={{ duration: 1.4, delay: index * 0.16, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: "-14px",
                  borderRadius: "50%",
                  border: "2.5px solid #C4A97D",
                  pointerEvents: "none",
                }}
              />
            )}
          </>
        )}
        {hasMemory && discovered && (
          <span style={{
            position: "absolute",
            inset: "-8px",
            borderRadius: "50%",
            border: "1px solid rgba(196,169,125,0.2)",
            pointerEvents: "none",
          }} />
        )}
      </span>
    </button>
  );
}

// ─── Memory card ──────────────────────────────────────────────────────────────

function MemoryCard({
  memory, label, isMobile, onClose,
}: {
  memory: Memory; label: string; isMobile: boolean; onClose: () => void;
}) {
  const content = (
    <>
      {memory.photo && (
        <div style={{ width: "100%", maxHeight: "200px", overflow: "hidden", borderRadius: isMobile ? "1rem 1rem 0 0" : "1rem 1rem 0 0" }}>
          {memory.photo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={memory.photo.url} alt="" style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "200px", background: "linear-gradient(135deg, #F5F0EB, #C4A97D40)" }} />
          )}
        </div>
      )}
      <div style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.8125rem", color: "#C4A97D", margin: 0 }}>{label}</p>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.125rem", color: "#8B7D72", lineHeight: 1, padding: "0 0 0 0.5rem" }}
            aria-label="Close"
          >×</button>
        </div>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", lineHeight: 1.75, color: "#2A2420", margin: 0 }}>{memory.text}</p>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)", zIndex: 40 }}
        />
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            maxHeight: "65vh", backgroundColor: "#FAF7F4",
            borderRadius: "1rem 1rem 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
            zIndex: 50, overflowY: "auto",
          }}
        >
          <div style={{ width: "40px", height: "4px", backgroundColor: "var(--color-parchment)", borderRadius: "2px", margin: "0.75rem auto 0" }} />
          {content}
        </motion.div>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(26,23,20,0.4)", backdropFilter: "blur(6px)", zIndex: 40 }}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          maxWidth: "440px", width: "calc(100% - 3rem)",
          backgroundColor: "#FAF7F4", borderRadius: "1rem",
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          zIndex: 50, overflowY: "auto", maxHeight: "80vh",
        }}
      >
        {content}
      </motion.div>
    </>
  );
}

// ─── Completion screen ────────────────────────────────────────────────────────

function CompletionScreen({ creation, onClose }: { creation: TributeCreation; onClose: () => void }) {
  const dedicationUrl = creation.audio?.dedicationUrl ?? null;
  const dedicationTranscript = creation.audio?.dedicationTranscript ?? null;
  const [dedicationMuted, setDedicationMuted] = useState(false);
  const [dedicationPlaying, setDedicationPlaying] = useState(false);
  const dedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Attempt autoplay when the screen mounts. Browsers may block; the visible
  // play button below is the fallback.
  useEffect(() => {
    const el = dedAudioRef.current;
    if (!el || !dedicationUrl) return;
    const t = setTimeout(() => {
      el.play().then(() => setDedicationPlaying(true)).catch(() => setDedicationPlaying(false));
    }, 900);
    return () => clearTimeout(t);
  }, [dedicationUrl]);

  function toggleDedication() {
    const el = dedAudioRef.current;
    if (!el) return;
    if (dedicationPlaying) {
      el.pause();
      setDedicationPlaying(false);
    } else {
      el.play().then(() => setDedicationPlaying(true)).catch(() => setDedicationPlaying(false));
    }
  }

  function toggleDedicationMuted(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !dedicationMuted;
    setDedicationMuted(next);
    if (dedAudioRef.current) dedAudioRef.current.muted = next;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: "fixed", inset: 0,
        backgroundColor: "rgba(42,36,32,0.35)",
        backdropFilter: "blur(4px)",
        zIndex: 60,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
      onClick={onClose}
    >
      {dedicationUrl && (
        <audio
          ref={dedAudioRef}
          src={dedicationUrl}
          onEnded={() => setDedicationPlaying(false)}
          preload="auto"
        />
      )}

      {dedicationUrl && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            backgroundColor: "rgba(250,247,244,0.96)",
            borderRadius: "2rem",
            padding: "0.5rem 0.75rem 0.5rem 0.5rem",
            marginBottom: "1.25rem",
            boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
          }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleDedication(); }}
            aria-label={dedicationPlaying ? "Pause message" : "Play message"}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              backgroundColor: "#C4A97D", color: "#FAF7F4",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem",
            }}
          >
            {dedicationPlaying ? "❚❚" : "▶"}
          </button>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#5A4E48", margin: 0 }}>
            A message for you
          </p>
          <button
            type="button"
            onClick={toggleDedicationMuted}
            aria-label={dedicationMuted ? "Unmute message" : "Mute message"}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              backgroundColor: "transparent", color: "#8B7D72",
              border: "none", cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            {dedicationMuted ? "🔇" : "🔊"}
          </button>
        </motion.div>
      )}

      {dedicationTranscript && dedicationPlaying && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: "var(--font-serif)", fontSize: "0.875rem",
            color: "rgba(250,247,244,0.78)", lineHeight: 1.6, maxWidth: "420px",
            fontStyle: "italic", marginBottom: "1.5rem",
          }}
        >
          &ldquo;{dedicationTranscript}&rdquo;
        </motion.p>
      )}

      {creation.dedicationMessage && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            fontFamily: "var(--font-serif)", fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
            color: "#FAF7F4", lineHeight: 1.65, maxWidth: "420px",
            fontStyle: "italic", marginBottom: "1.5rem",
          }}
        >
          {creation.dedicationMessage}
        </motion.p>
      )}

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "120px" }}
        transition={{ delay: 0.2, duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ height: "1px", backgroundColor: "#C4A97D", marginBottom: "1.5rem" }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "rgba(250,247,244,0.6)", marginBottom: "0.5rem" }}>
          Made with Chère
        </p>
        <a
          href="https://chere.app"
          onClick={(e) => e.stopPropagation()}
          style={{ fontFamily: "var(--font-serif)", fontSize: "0.9375rem", color: "#C4A97D" }}
        >
          Make one for someone you love →
        </a>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CompanionRenderer({
  creation,
  preview = false,
}: {
  creation: TributeCreation;
  preview?: boolean;
}) {
  const sceneId = getScene(creation.relationshipType);
  const hotspots = SCENE_HOTSPOTS[sceneId];
  const SceneBg = SCENE_BG[sceneId];
  const tod = getTimeOfDay();

  // Build memories: pair paragraphs + photos with hotspots
  const paras = creation.generatedText.split(/\n\n+/).filter((p) => p.trim());
  const memories: Record<string, Memory> = {};
  hotspots.forEach((hs, i) => {
    if (i < paras.length) {
      memories[hs.id] = {
        text: paras[i],
        photo: creation.photos[i] ? { url: creation.photos[i].url, caption: creation.photos[i].caption } : null,
      };
    }
  });
  const activeHotspots = hotspots.filter((hs) => memories[hs.id]);

  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [reaction, setReaction] = useState<Reaction>("default");
  const [burstKey, setBurstKey] = useState(0);
  const [lastInteractionAt, setLastInteractionAt] = useState<number>(() => Date.now());

  const isPet = creation.relationshipType === "pet" || creation.relationshipType === "pet_memorial";

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Show hint after 800ms; dismiss once the first discovery happens
  useEffect(() => {
    if (preview) return;
    const show = setTimeout(() => setHintVisible(true), 800);
    return () => clearTimeout(show);
  }, [preview]);

  useEffect(() => {
    if (discovered.size > 0) setHintVisible(false);
  }, [discovered.size]);

  // Idle attention wave: bump burstKey when no interaction for 8s
  useEffect(() => {
    if (preview) return;
    if (activeHotspots.length === 0) return;
    if (discovered.size >= activeHotspots.length) return;
    const interval = setInterval(() => {
      if (Date.now() - lastInteractionAt > 8000) {
        setBurstKey((k) => k + 1);
        setLastInteractionAt(Date.now());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [preview, lastInteractionAt, discovered.size, activeHotspots.length]);

  // Trigger completion 1s after the last card is closed
  useEffect(() => {
    if (activeId === null && discovered.size >= activeHotspots.length && activeHotspots.length > 0 && !showCompletion) {
      const t = setTimeout(() => setShowCompletion(true), 1000);
      return () => clearTimeout(t);
    }
  }, [activeId, discovered.size, activeHotspots.length, showCompletion]);

  function handleTap(id: string) {
    if (!memories[id]) return;
    setLastInteractionAt(Date.now());
    setActiveId(id);
    if (!muted) playChime();
    setDiscovered((prev) => {
      const isFirst = prev.size === 0;
      setReaction(isFirst ? "wave" : detectTone(memories[id].text));
      return new Set([...prev, id]);
    });
  }

  function handleCardClose() {
    setActiveId(null);
    const t = setTimeout(() => setReaction("default"), 1200);
    return () => clearTimeout(t);
  }

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {/* Scene */}
      <div style={{ position: "absolute", inset: 0 }}>
        <SceneBg tod={tod} />
      </div>

      {/* Animated characters */}
      {!preview && (
        <CharacterPair scene={sceneId} reaction={reaction} isPet={isPet} />
      )}

      {/* Hotspots */}
      {hotspots.map((hs, i) => (
        <Hotspot
          key={hs.id}
          def={hs}
          index={i}
          scene={sceneId}
          hasMemory={!!memories[hs.id]}
          discovered={discovered.has(hs.id)}
          preview={preview}
          burstKey={burstKey}
          onClick={() => handleTap(hs.id)}
        />
      ))}

      {/* Progress counter */}
      {!preview && activeHotspots.length > 0 && (
        <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 20, display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <motion.p
            key={discovered.size}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#8B7D72", backgroundColor: "rgba(250,247,244,0.88)", padding: "0.25rem 0.625rem", borderRadius: "2rem", backdropFilter: "blur(4px)", margin: 0 }}
          >
            {discovered.size} / {activeHotspots.length} discovered
          </motion.p>
          <button
            onClick={() => setMuted((m) => !m)}
            style={{ background: "rgba(250,247,244,0.88)", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "0.8rem", backdropFilter: "blur(4px)", color: "#8B7D72" }}
            aria-label={muted ? "Unmute" : "Mute"}
            title={muted ? "Unmute" : "Mute sounds"}
          >
            {muted ? "🔇" : "🔔"}
          </button>
        </div>
      )}

      {/* Hint + ? button */}
      {!preview && (
        <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 20, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <AnimatePresence>
            {hintVisible && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ backgroundColor: "rgba(250,247,244,0.92)", borderRadius: "0.5rem", padding: "0.5rem 0.875rem", backdropFilter: "blur(4px)" }}
              >
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#8B7D72", margin: 0 }}>Tap the glowing objects to discover memories</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!hintVisible && activeHotspots.length > 0 && discovered.size < activeHotspots.length && (
            <motion.button
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              onClick={() => setHintVisible(true)}
              style={{
                backgroundColor: "rgba(250,247,244,0.88)",
                border: "none",
                borderRadius: "2rem",
                padding: "0.3rem 0.75rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                color: "#8B7D72",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
              aria-label={`${activeHotspots.length - discovered.size} more memories to find`}
            >
              {activeHotspots.length - discovered.size} more to find
            </motion.button>
          )}
        </div>
      )}

      {/* Preview overlay */}
      {preview && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(245,240,235,0.4)", backdropFilter: "blur(1px)", zIndex: 30 }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "#2A2420", backgroundColor: "rgba(250,247,244,0.9)", padding: "0.75rem 1.5rem", borderRadius: "0.5rem" }}>Tap to explore</p>
        </div>
      )}

      {/* Audio narration */}
      {!preview && (
        <AudioNarration
          audioUrl={creation.audio?.ttsUrl ?? null}
          tier={creation.tier}
          paused={activeId !== null}
        />
      )}

      {/* Memory card */}
      <AnimatePresence>
        {activeId && memories[activeId] && !preview && (
          <MemoryCard
            key={activeId}
            memory={memories[activeId]}
            label={hotspots.find((h) => h.id === activeId)?.label ?? ""}
            isMobile={isMobile}
            onClose={handleCardClose}
          />
        )}
      </AnimatePresence>

      {/* Completion */}
      <AnimatePresence>
        {showCompletion && (
          <CompletionScreen key="completion" creation={creation} onClose={() => setShowCompletion(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
