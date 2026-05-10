import { NextRequest, NextResponse } from "next/server";
import { generateTributeText } from "@/lib/ai/generate-tribute";
import type { RelationshipType, Tier } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { relationshipType, recipientName, interviewAnswers, photoDescriptions, tier } = body as {
      relationshipType: RelationshipType;
      recipientName: string;
      interviewAnswers: Record<string, string>;
      photoDescriptions?: string[];
      tier?: Tier;
    };

    if (!relationshipType || !recipientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const text = await generateTributeText({
      relationshipType,
      recipientName,
      interviewAnswers,
      photoDescriptions,
      tier,
    });

    return NextResponse.json({ text });
  } catch (err) {
    console.error("[generate-text] Error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
