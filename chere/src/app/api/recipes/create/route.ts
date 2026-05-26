import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
