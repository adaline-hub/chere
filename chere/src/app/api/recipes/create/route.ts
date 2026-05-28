import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRecipe, isCoAuthor } from "@/lib/recipes/queries";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { creation_id, title, ingredients, instructions, notes } = await req.json();
    if (!creation_id || !title) return NextResponse.json({ error: "creation_id and title required" }, { status: 400 });

    const allowed = await isCoAuthor(creation_id, user.id);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Ensure profile row exists (profile trigger may not have fired on signup)
    const admin = createAdminClient();
    await admin.from("profiles").upsert({
      id: user.id,
      display_name: (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "User",
      email: user.email ?? "",
    }, { onConflict: "id", ignoreDuplicates: true });

    const recipe = await createRecipe({
      creationId: creation_id,
      authorProfileId: user.id,
      title,
      ingredients: ingredients ?? [],
      instructions: instructions ?? "",
      notes,
    });
    return NextResponse.json({ recipe });
  } catch (err) {
    console.error("[recipes/create]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
