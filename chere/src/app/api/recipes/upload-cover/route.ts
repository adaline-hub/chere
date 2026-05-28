import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSignedAssetUrl } from "@/lib/supabase/storage";

const BUCKET = "creations";
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file");
    const creationId = form.get("creation_id");

    if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
    if (typeof creationId !== "string" || !creationId) return NextResponse.json({ error: "creation_id required" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "file too large" }, { status: 413 });

    const admin = createAdminClient();

    const { data: creation } = await admin
      .from("creations")
      .select("id, creator_id")
      .eq("id", creationId)
      .single();

    if (!creation) return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    if ((creation as { creator_id?: string }).creator_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const storagePath = `${creationId}/recipe-book-cover.jpg`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

    const { error: updateErr } = await admin
      .from("creations")
      .update({ recipe_book_cover_path: storagePath })
      .eq("id", creationId);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    const signedUrl = await getSignedAssetUrl(storagePath);
    return NextResponse.json({ signedUrl, path: storagePath });
  } catch (err) {
    console.error("[recipes/upload-cover]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
