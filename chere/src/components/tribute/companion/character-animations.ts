export type Reaction = "wave" | "hug" | "laugh" | "sit" | "dance" | "default";

const FUNNY = ["funny", "laugh", "hilarious", "ridiculous", "crazy", "chaos", "broke", "destroyed"];
const EMOTIONAL = ["love", "miss", "cry", "heart", "always", "never forget", "grateful", "sacrifice", "gave up"];
const CELEBRATORY = ["birthday", "celebration", "surprise", "party", "best day", "happiest", "wedding", "graduated"];
const QUIET = ["quiet", "peace", "moment", "together", "simple", "sunday", "morning", "couch", "silence"];

export function detectTone(text: string): Reaction {
  const lower = text.toLowerCase();
  if (FUNNY.some((k) => lower.includes(k))) return "laugh";
  if (CELEBRATORY.some((k) => lower.includes(k))) return "dance";
  if (EMOTIONAL.some((k) => lower.includes(k))) return "hug";
  if (QUIET.some((k) => lower.includes(k))) return "sit";
  return "default";
}
