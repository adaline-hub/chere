import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface SuggestionInput {
  hotspotLabel: string;
  sceneId: string;
  relationshipType: string;
  recipientName: string;
  tributeText?: string;
}

function sanitizeSuggestion(raw: string): string {
  const singleLine = raw.replace(/\s+/g, " ").trim();
  const withoutWrappingQuotes = singleLine.replace(/^['\"“”‘’]+|['\"“”‘’]+$/g, "");
  const words = withoutWrappingQuotes.split(" ").filter(Boolean);
  if (words.length <= 25) return withoutWrappingQuotes;
  return words.slice(0, 25).join(" ").replace(/[,:;.!?]*$/, "") + ".";
}

export async function generateRecordingSuggestion(input: SuggestionInput): Promise<string> {
  const { hotspotLabel, sceneId, relationshipType, recipientName, tributeText } = input;

  const userMessage = [
    `Hotspot label: ${hotspotLabel}`,
    `Scene: ${sceneId}`,
    `Relationship: ${relationshipType || "unknown"}`,
    `Recipient name: ${recipientName || "their loved one"}`,
    tributeText?.trim() ? `Existing tribute text (avoid repeating this):\n${tributeText.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    temperature: 0.8,
    system:
      "You help someone record a short voice memory in a tribute app. Return exactly one warm nudge sentence, no markdown. " +
      "Start with 'Try saying:' or 'Maybe start with:'. Include a concrete 4-8 word opening they can say aloud. " +
      "Naturally reference the hotspot subject. Keep total output to 25 words or fewer. Do not wrap the whole response in quotes.",
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in AI response");
  }

  const cleaned = sanitizeSuggestion(textBlock.text);
  if (!cleaned) {
    throw new Error("Empty suggestion");
  }

  return cleaned;
}
