export type SceneId = "kitchen" | "living-room" | "backyard" | "cafe";

export interface HotspotDef {
  id: string;
  label: string;
  x: number;
  y: number;
}

export const SCENE_HOTSPOTS: Record<SceneId, HotspotDef[]> = {
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

export function getScene(relationshipType: string): SceneId {
  const r = (relationshipType || "").toLowerCase();
  if (["mom", "dad", "mother", "father", "grandma", "grandpa", "grandmother", "grandfather", "grandparent", "parent"].some((k) => r.includes(k))) return "kitchen";
  if (["partner", "spouse", "husband", "wife", "boyfriend", "girlfriend", "fiancé", "fiance"].some((k) => r.includes(k))) return "living-room";
  if (["pet", "dog", "cat", "puppy", "kitten", "bunny", "rabbit"].some((k) => r.includes(k))) return "backyard";
  return "cafe";
}
