import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCoAuthor } from "@/lib/recipes/queries";
import { createComment } from "@/lib/recipes/comments";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recipe_id, creation_id, body } = await req.json();
    if (!recipe_id || !creation_id || !body) return NextResponse.json({ error: "recipe_id, creation_id, and body required" }, { status: 400 });

    const trimmed = (body as string).trim();
    if (!trimmed) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    if (trimmed.length > 2000) return NextResponse.json({ error: "Comment too long (max 2000 characters)" }, { status: 400 });

    const allowed = await isCoAuthor(creation_id, user.id);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Ensure profile row exists
    const admin = createAdminClient();
    await admin.from("profiles").upsert({
      id: user.id,
      display_name: (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "User",
      email: user.email ?? "",
    }, { onConflict: "id", ignoreDuplicates: true });

    const comment = await createComment({
      recipeId: recipe_id,
      creationId: creation_id,
      authorProfileId: user.id,
      body: trimmed,
    });
    return NextResponse.json({ comment });
  } catch (err) {
    console.error("[recipes/comments/create]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
