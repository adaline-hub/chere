import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { transcribeAudio } from "@/lib/groq/stt";

const BUCKET = "creations";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB hard cap
const ALLOWED_KINDS = new Set(["dedication", "memory", "intro", "outro"]);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file");
    const creationId = form.get("creation_id");
    const kind = form.get("kind");
    const memorySlotId = form.get("memory_slot_id");
    const durationMs = form.get("duration_ms");

    if (!(file instanceof File)) return NextResponse.json({ error: "file is required" }, { status: 400 });
    if (typeof creationId !== "string" || !creationId) return NextResponse.json({ error: "creation_id required" }, { status: 400 });
    if (typeof kind !== "string" || !ALLOWED_KINDS.has(kind)) return NextResponse.json({ error: "invalid kind" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "file too large" }, { status: 413 });

    // Verify ownership via the user-scoped (RLS-respecting) client.
    const { data: creation, error: creationErr } = await supabase
      .from("creations")
      .select("id")
      .eq("id", creationId)
      .single();
    if (creationErr || !creation) return NextResponse.json({ error: "creation not found" }, { status: 404 });

    const clipId = randomUUID();
    const ext = file.type.includes("mp4") ? "mp4" : file.type.includes("ogg") ? "ogg" : "webm";
    const storagePath = `${creationId}/audio/${clipId}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient();
    const uploadRes = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: file.type || "audio/webm",
      upsert: false,
    });
    if (uploadRes.error) {
      return NextResponse.json({ error: `upload failed: ${uploadRes.error.message}` }, { status: 500 });
    }

    const { error: insertErr } = await admin.from("audio_clips").insert({
      id: clipId,
      creation_id: creationId,
      kind,
      memory_slot_id: typeof memorySlotId === "string" && memorySlotId ? memorySlotId : null,
      storage_path: storagePath,
      duration_ms: typeof durationMs === "string" ? parseInt(durationMs, 10) || 0 : 0,
      mime_type: file.type || "audio/webm",
      transcript_status: "pending",
    });
    if (insertErr) {
      await admin.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: `db insert failed: ${insertErr.message}` }, { status: 500 });
    }

    // Synchronous transcription. Short clips (<60s) finish in ~1s on Groq turbo;
    // worth blocking the response so the UI gets the transcript in one round-trip.
    try {
      const { text, language } = await transcribeAudio({
        audio: bytes,
        mimeType: file.type || "audio/webm",
        filename: `${clipId}.${ext}`,
      });
      await admin
        .from("audio_clips")
        .update({ transcript: text, transcript_lang: language, transcript_status: "completed" })
        .eq("id", clipId);

      return NextResponse.json({
        id: clipId,
        storage_path: storagePath,
        transcript: text,
        transcript_status: "completed",
      });
    } catch (transcribeErr) {
      console.error("[audio/upload] transcription failed:", transcribeErr);
      await admin.from("audio_clips").update({ transcript_status: "failed" }).eq("id", clipId);
      return NextResponse.json({
        id: clipId,
        storage_path: storagePath,
        transcript: null,
        transcript_status: "failed",
      });
    }
  } catch (err) {
    console.error("[audio/upload] error:", err);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
