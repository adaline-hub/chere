import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteRecipe, isCoAuthor } from "@/lib/recipes/queries";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const admin = createAdminClient();
    const { data: recipe } = await admin.from("recipes").select("creation_id").eq("id", id).single();
    if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const allowed = await isCoAuthor(recipe.creation_id as string, user.id);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await deleteRecipe(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recipes/delete]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
