import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSignedAssetUrl } from "@/lib/supabase/storage";
import { isCoAuthor } from "@/lib/recipes/queries";

const BUCKET = "creations";
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file");
    const recipeId = form.get("recipe_id");

    if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
    if (typeof recipeId !== "string" || !recipeId) return NextResponse.json({ error: "recipe_id required" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "file too large" }, { status: 413 });

    const admin = createAdminClient();
    const { data: recipe } = await admin.from("recipes").select("creation_id").eq("id", recipeId).single();
    if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    const allowed = await isCoAuthor(recipe.creation_id as string, user.id);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const storagePath = `${recipe.creation_id}/recipe-photos/${recipeId}.jpg`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

    await admin.from("recipes").update({ photo_path: storagePath }).eq("id", recipeId);

    const photoUrl = await getSignedAssetUrl(storagePath);
    return NextResponse.json({ photoUrl });
  } catch (err) {
    console.error("[recipes/upload-photo]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
