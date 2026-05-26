import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { share_token } = await req.json();
    if (!share_token) return NextResponse.json({ error: "share_token required" }, { status: 400 });

    const admin = createAdminClient();
    const { data: creation } = await admin
      .from("creations")
      .select("id, output_format")
      .eq("share_token", share_token)
      .single();

    if (!creation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (creation.output_format !== "recipe_book") return NextResponse.json({ error: "Not a recipe book" }, { status: 400 });

    await admin.from("recipe_collaborators").upsert(
      { creation_id: creation.id, profile_id: user.id, role: "co_author" },
      { onConflict: "creation_id,profile_id", ignoreDuplicates: true }
    );

    return NextResponse.json({ creationId: creation.id, role: "co_author" });
  } catch (err) {
    console.error("[recipes/claim]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
