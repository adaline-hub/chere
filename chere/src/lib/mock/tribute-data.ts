export interface TributePhoto {
  id: string;
  url: string;
  caption: string;
}

export interface TributeGiftMoment {
  description: string;
  message: string;
  revealStyle: string;
}

export interface TributeAudio {
  dedicationUrl: string | null;
  dedicationTranscript: string | null;
  memories?: Record<string, { url: string; transcript: string | null }>;
}

export interface TributeCreation {
  id: string;
  recipientName: string;
  creatorName: string;
  type: "tribute" | "gift_reveal" | "combined";
  relationshipType: string;
  outputFormat:
    | "scrollytelling"
    | "memory_wrapped"
    | "love_letter"
    | "gift_reveal"
    | "storybook"
    | "companion";
  templateId: "warm-linen" | "soft-sage" | "midnight-gold";
  tier: "free" | "starter" | "premium";
  generatedText: string;
  dedicationMessage: string;
  photos: TributePhoto[];
  giftMoment: TributeGiftMoment | null;
  musicTrackId: string | null;
  reactionCamEnabled?: boolean;
  audio?: TributeAudio;
}

export const mockCreation: TributeCreation = {
  id: "mock-001",
  recipientName: "Mom",
  creatorName: "your daughter",
  type: "tribute",
  relationshipType: "mom",
  outputFormat: "scrollytelling",
  templateId: "warm-linen",
  tier: "starter",

  generatedText: `Mom,

I don't think I ever told you this, but the smell of your kitchen is the safest place in my memory. The fresh noodle soups. The seafood you'd bring home from the market because nobody else could pick it right. That was home to me — not the house, the kitchen.

You used to put my socks on and lay out my clothes every single morning while I was still completely asleep because I refused to wake up on time. I don't know how early you had to get up to do that. I never asked. I just always had socks on when I opened my eyes.

"Hi sweet girl. You are so smart." You still say that. Every time.

You were always stuffing me with food — home-cooked meals, snacks, cut fruit I didn't ask for. I used to think you were just being extra. Now I understand. That was how you said I love you when the words felt too small.

Do you remember bringing me to the real estate office? When you were deciding what to buy and you just... brought me along? You let me sit in the room where big decisions were happening like I belonged there. I felt like a big person in a little body sitting next to you. I don't know if you did that on purpose, but it mattered more than you know.

You taught me to be kind. You taught me to be resilient. You didn't teach me those things with words — you just were those things, every day, and I was watching.

Here's what I need you to know:

I know you gave up half a lifetime of adventure because you needed to stay home with me. I know that now. And when I see you traveling all over the world — finally going to all those places — I know that's what you always wanted to do. You just chose me first.

And I see that. I see all of it.`,

  dedicationMessage: "Love always, your little girl",

  // Empty URLs → renderers show gradient placeholders gracefully
  photos: [
    { id: "p1", url: "", caption: "Kitchen mornings" },
    { id: "p2", url: "", caption: "That vacation" },
    { id: "p3", url: "", caption: "Sunday cooking" },
  ],

  giftMoment: null,
  musicTrackId: null,
};
