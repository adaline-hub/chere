import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCoAuthor } from "@/lib/recipes/queries";
import { listCommentsForRecipe } from "@/lib/recipes/comments";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recipe_id, creation_id } = await req.json();
    if (!recipe_id || !creation_id) return NextResponse.json({ error: "recipe_id and creation_id required" }, { status: 400 });

    const allowed = await isCoAuthor(creation_id, user.id);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const comments = await listCommentsForRecipe(recipe_id);
    return NextResponse.json({ comments });
  } catch (err) {
    console.error("[recipes/comments/list]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
