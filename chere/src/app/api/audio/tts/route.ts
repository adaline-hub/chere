import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSpeech, type MinimaxVoice } from "@/lib/minimax/tts";

const BUCKET = "creations";
const MAX_CHARS = 8000;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      creation_id?: string;
      voice_id?: MinimaxVoice;
      force?: boolean;
    };
    const { creation_id, voice_id, force } = body;
    if (!creation_id) return NextResponse.json({ error: "creation_id required" }, { status: 400 });

    // Verify ownership + pull tribute text via RLS-respecting client.
    const { data: creation, error: creationErr } = await supabase
      .from("creations")
      .select("id, generated_text, generated_text_edited, tier")
      .eq("id", creation_id)
      .single();
    if (creationErr || !creation) return NextResponse.json({ error: "creation not found" }, { status: 404 });

    const text = (creation.generated_text_edited ?? creation.generated_text ?? "").trim();
    if (!text) return NextResponse.json({ error: "no tribute text to narrate yet" }, { status: 400 });
    if (text.length > MAX_CHARS) {
      return NextResponse.json({ error: `text too long (${text.length} > ${MAX_CHARS})` }, { status: 400 });
    }

    const admin = createAdminClient();

    // Reuse existing TTS clip unless caller forces regeneration.
    if (!force) {
      const { data: existing } = await admin
        .from("audio_clips")
        .select("id, storage_path, tts_voice_id, duration_ms")
        .eq("creation_id", creation_id)
        .eq("kind", "tts")
        .maybeSingle();
      if (existing && (!voice_id || existing.tts_voice_id === voice_id)) {
        return NextResponse.json({
          id: existing.id,
          storage_path: existing.storage_path,
          voice_id: existing.tts_voice_id,
          duration_ms: existing.duration_ms,
          cached: true,
        });
      }
    }

    const { audio, durationMs } = await generateSpeech({ text, voiceId: voice_id });

    const clipId = randomUUID();
    const storagePath = `${creation_id}/audio/${clipId}.mp3`;
    const uploadRes = await admin.storage.from(BUCKET).upload(storagePath, audio, {
      contentType: "audio/mpeg",
      upsert: false,
    });
    if (uploadRes.error) {
      return NextResponse.json({ error: `upload failed: ${uploadRes.error.message}` }, { status: 500 });
    }

    // Drop any previous TTS clip for this creation so we keep one row per voice rotation.
    await admin.from("audio_clips").delete().eq("creation_id", creation_id).eq("kind", "tts");

    const { error: insertErr } = await admin.from("audio_clips").insert({
      id: clipId,
      creation_id,
      kind: "tts",
      storage_path: storagePath,
      mime_type: "audio/mpeg",
      duration_ms: durationMs,
      tts_voice_id: voice_id ?? "English_Graceful_Lady",
      transcript: text,
      transcript_status: "skipped",
    });
    if (insertErr) {
      await admin.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: `db insert failed: ${insertErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      id: clipId,
      storage_path: storagePath,
      voice_id: voice_id ?? "English_Graceful_Lady",
      duration_ms: durationMs,
      cached: false,
    });
  } catch (err) {
    console.error("[audio/tts] error:", err);
    const msg = err instanceof Error ? err.message : "tts failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
