import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getScene, SCENE_HOTSPOTS } from "@/lib/companion/hotspots";
import { generateRecordingSuggestion } from "@/lib/ai/recording-suggestion";

const suggestionCache = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { creation_id: creationId, hotspot_id: hotspotId, refresh } = body as {
      creation_id?: string;
      hotspot_id?: string;
      refresh?: boolean;
    };

    if (!creationId || !hotspotId) {
      return NextResponse.json({ error: "creation_id and hotspot_id are required" }, { status: 400 });
    }

    const { data: creation, error: creationErr } = await supabase
      .from("creations")
      .select("id, relationship_type, recipient_name, generated_text, generated_text_edited")
      .eq("id", creationId)
      .single();

    if (creationErr || !creation) {
      return NextResponse.json({ error: "creation not found" }, { status: 404 });
    }

    const sceneId = getScene(creation.relationship_type ?? "");
    const hotspot = SCENE_HOTSPOTS[sceneId].find((h) => h.id === hotspotId);

    if (!hotspot) {
      return NextResponse.json({ error: "invalid hotspot_id for this creation" }, { status: 400 });
    }

    const cacheKey = `${creationId}:${hotspotId}`;

    if (!refresh) {
      const cached = suggestionCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({ suggestion: cached });
      }
    }

    const tributeText = creation.generated_text_edited ?? creation.generated_text ?? undefined;
    const suggestion = await generateRecordingSuggestion({
      hotspotLabel: hotspot.label,
      sceneId,
      relationshipType: creation.relationship_type ?? "",
      recipientName: creation.recipient_name ?? "",
      tributeText,
    });

    suggestionCache.set(cacheKey, suggestion);

    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("[recording-suggestion] Error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
