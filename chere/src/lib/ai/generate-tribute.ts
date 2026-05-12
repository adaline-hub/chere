import Anthropic from "@anthropic-ai/sdk";
import type { RelationshipType } from "@/lib/supabase/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── Golden Examples ─────────────────────────────────────

const GOLDEN_EXAMPLES: Partial<Record<RelationshipType, string>> = {
  mom: `Mom,

I don't think I ever told you this, but the smell of your kitchen is the safest place in my memory. The fresh noodle soups. The seafood you'd bring home from the market because nobody else could pick it right. That was home to me — not the house, the kitchen.

You used to put my socks on and lay out my clothes every single morning while I was still completely asleep because I refused to wake up on time. I don't know how early you had to get up to do that. I never asked. I just always had socks on when I opened my eyes.

"Hi sweet girl. You are so smart." You still say that. Every time.

You were always stuffing me with food — home-cooked meals, snacks, cut fruit I didn't ask for. I used to think you were just being extra. Now I understand. That was how you said I love you when the words felt too small.

Do you remember bringing me to the real estate office? When you were deciding what to buy and you just... brought me along? You let me sit in the room where big decisions were happening like I belonged there. I felt like a big person in a little body sitting next to you. I don't know if you did that on purpose, but it mattered more than you know.

You taught me to be kind. You taught me to be resilient. You didn't teach me those things with words — you just were those things, every day, and I was watching.

Here's what I need you to know:

I know you gave up half a lifetime of adventure because you needed to stay home with me. I know that now. And when I see you traveling all over the world — finally going to all those places — I know that's what you always wanted to do. You just chose me first.

And I see that. I see all of it.`,

  pet: `You weren't always mine.

You came from someone else's life, from a chapter that started before me. But love doesn't care about timelines. Somewhere along the way, I became your mama, and you became my baby. That was that.

You're a dog with opinions. I can see it in the chip game — I hold a chip out to you and you pretend you don't want it. I move it closer and you roll away like you're above it all. But pull it back? You're on it. Chasing it down like it was your idea the whole time. Because everything is your idea. Always has been.

Your favorite spot is wherever the sun is, face tilted up, eyes squinting like you're trying to stare it down. And at night, the space between our legs in bed — that's yours. Not negotiable.

You're tougher than you look. Spinal surgery — the kind that would have broken a lesser dog. But you came back stronger, because of course you did. You had places to be. Chips to pretend you didn't want.

On my bad days — and you always know which days those are — you come find me. No invitation needed. Just show up, press yourself against me, and stay. And if I need something more? I hold up my hand and say "high five" and you reach out and press your paw to my palm like a tiny gentleman honoring a deal.

Here's what you taught me, without trying, without knowing, without any of the words for it:

There is no adventure worth having if I'm not in it. No walk, no car ride, no sunny patch means anything without me there. You would choose me over everything, every single time, not because you have to — because I am the whole point.

If I could tell you one thing, it would be simple. The thing I say with my eyes and my hands every time you follow me from room to room:

I want you to stay here with me forever and never leave.`,
};

// ─── System Prompt ───────────────────────────────────────

function buildSystemPrompt(relationshipType: RelationshipType): string {
  const goldenExample = GOLDEN_EXAMPLES[relationshipType] || GOLDEN_EXAMPLES.mom;

  return `You are an invisible ghostwriter for Chère, a luxury digital gift platform. Your writing should feel like it was written by the Creator themselves — not by AI.

ROLE: Write a first-person letter from the Creator directly to their ${relationshipType === "pet" || relationshipType === "pet_memorial" ? "pet" : "loved one"}.

VOICE RULES:
- Mirror the Creator's exact vocabulary, names, and phrasing from their answers
- If they say "mama" never write "mother." If they say "doggo" never write "canine."
- Match their sentence length and emotional register — casual stays casual, poetic stays poetic
- Short sentences for emotional moments. Let them breathe. White space is punctuation.
- NEVER use these words: journey, cherish, blessed, unconditional, heartfelt, tapestry, countless, unwavering, testament, beacon, embody, profound, embrace (as noun)
- Never explain emotions — show them through specific details
- Never summarize what the Creator said — transform it into direct, intimate address

STRUCTURE:
- Open with a specific sensory detail or unexpected moment — NOT "Dear Mom" or "Let me tell you about..."
- Address the recipient directly throughout (use "you" and "your")
- Weave memories in order of emotional escalation — lighter moments first, deepest last
- Humor creates trust — if the Creator was funny in their answers, be funny
- Include ONE moment where the Creator quotes the recipient's actual words (catchphrase, advice)
- Save the biggest emotional beat for the very end
- The last line should be short — one sentence, maximum two. Let it land in silence.
- Do NOT add a sign-off like "Love, [Name]" — the letter ends with its final emotional beat

LENGTH: 250-400 words. Quality over quantity. Every sentence earns its place.

GOLDEN EXAMPLE (study the voice, pacing, and emotional architecture):

${goldenExample}

Write the tribute letter now based on the Creator's interview answers below. Do not add a title, header, or sign-off.`;
}

// ─── Generate Tribute Text ──────────────────────────────

interface GenerateTributeOptions {
  relationshipType: RelationshipType;
  recipientName: string;
  interviewAnswers: Record<string, string>;
  photoDescriptions?: string[];
  tier?: "free" | "standard" | "premium" | "deluxe";
}

export async function generateTributeText(
  options: GenerateTributeOptions
): Promise<string> {
  const {
    relationshipType,
    recipientName,
    interviewAnswers,
    photoDescriptions,
  } = options;

  // Build the user message from interview answers
  const answersText = Object.entries(interviewAnswers)
    .filter(([, answer]) => answer && answer.trim().length > 0)
    .map(([questionId, answer]) => `Q (${questionId}): ${answer}`)
    .join("\n\n");

  let userMessage = `RECIPIENT NAME: ${recipientName}\n\nCREATOR'S INTERVIEW ANSWERS:\n\n${answersText}`;

  if (photoDescriptions && photoDescriptions.length > 0) {
    userMessage += `\n\nPHOTO CONTEXT (AI-analyzed descriptions of uploaded photos):\n${photoDescriptions.join("\n")}`;
  }

  // Sonnet for all tiers — tribute generation requires full creative capability
  const model = "claude-sonnet-4-6";

  const response = await anthropic.messages.create({
    model,
    max_tokens: 1500,
    temperature: 0.7,
    system: buildSystemPrompt(relationshipType),
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  // Extract text from response
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in AI response");
  }

  return postProcessTribute(textBlock.text);
}

// ─── Post-Processing ─────────────────────────────────────

function postProcessTribute(text: string): string {
  // Remove any AI-isms that slipped through
  const aiIsms = [
    /\bjourney\b/gi,
    /\bcherish(ed)?\b/gi,
    /\bblessed\b/gi,
    /\bunconditional(ly)?\b/gi,
    /\bheartfelt\b/gi,
    /\btapestry\b/gi,
    /\bcountless\b/gi,
    /\bunwavering\b/gi,
    /\btestament\b/gi,
    /\bbeacon\b/gi,
    /\bembody\b/gi,
    /\bprofound(ly)?\b/gi,
  ];

  let processed = text;

  // Flag if AI-isms found (in production, could trigger a regeneration)
  const foundAiIsms = aiIsms.filter((pattern) => pattern.test(processed));
  if (foundAiIsms.length > 0) {
    console.warn(
      `[AI Post-Processing] Found ${foundAiIsms.length} AI-isms in generated text. Consider regenerating.`
    );
  }

  // Clean up any markdown formatting the model might add
  processed = processed.replace(/^#+\s/gm, ""); // Remove headers
  processed = processed.replace(/^\*\*(.+)\*\*$/gm, "$1"); // Remove bold
  processed = processed.replace(/^---$/gm, ""); // Remove horizontal rules

  // Ensure clean paragraph breaks
  processed = processed.replace(/\n{3,}/g, "\n\n");

  // Trim
  processed = processed.trim();

  return processed;
}

// ─── Generate Gift Reveal Copy ───────────────────────────

interface GenerateGiftCopyOptions {
  giftType: string;
  description: string;
  details: Record<string, unknown>;
  recipientName: string;
  personalMessage?: string;
}

export async function generateGiftCopy(
  options: GenerateGiftCopyOptions
): Promise<string> {
  const { giftType, description, details, recipientName, personalMessage } =
    options;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    temperature: 0.6,
    system: `You write short, elegant gift reveal copy for Chère, a luxury digital gift platform. 
    
Your tone is warm, excited, and intimate — like someone barely containing their happiness about a surprise they've planned. Keep it to 2-4 sentences. No emojis. No exclamation marks (the elegance IS the excitement). Use the recipient's name naturally.

Never use: amazing, awesome, incredible, special, magical, unforgettable.`,
    messages: [
      {
        role: "user",
        content: `Gift for: ${recipientName}
Type: ${giftType}
Description: ${description}
Details: ${JSON.stringify(details)}
Personal message from creator: ${personalMessage || "none provided"}

Write the reveal copy.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in AI response");
  }

  return textBlock.text.trim();
}

// ─── Generate Drip Clue Riddle ───────────────────────────

export async function generateClueRiddle(
  giftDescription: string,
  clueNumber: number,
  totalClues: number
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    temperature: 0.8,
    system: `You write playful, cryptic one-line clues for Chère gift reveals. Each clue should hint at the gift without giving it away. Be poetic and warm, never cheesy. One sentence only.`,
    messages: [
      {
        role: "user",
        content: `Gift: ${giftDescription}
This is clue ${clueNumber} of ${totalClues}. Earlier clues are vaguer, later clues are more specific.
Write the clue.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in AI response");
  }

  return textBlock.text.trim();
}
