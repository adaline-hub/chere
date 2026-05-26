import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listRecipes, isCoAuthor } from "@/lib/recipes/queries";

export async function POST(req: NextRequest) {
  try {
    const { creation_id } = await req.json();
    if (!creation_id) return NextResponse.json({ error: "creation_id required" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const allowed = await isCoAuthor(creation_id, user.id);
      if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else {
      // Unauthenticated — return empty list (recipient will see sign-in prompt)
      return NextResponse.json({ recipes: [] });
    }

    const recipes = await listRecipes(creation_id);
    return NextResponse.json({ recipes });
  } catch (err) {
    console.error("[recipes/list]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
