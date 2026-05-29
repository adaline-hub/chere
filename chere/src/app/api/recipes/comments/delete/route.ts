import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteComment, getCommentById } from "@/lib/recipes/comments";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const comment = await getCommentById(id);
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Allow: comment author OR book owner (creation creator)
    const admin = createAdminClient();
    const { data: creation } = await admin
      .from("creations")
      .select("creator_id")
      .eq("id", comment.creationId)
      .single();

    const isAuthor = comment.authorProfileId === user.id;
    const isOwner = (creation as { creator_id?: string } | null)?.creator_id === user.id;
    if (!isAuthor && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await deleteComment(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recipes/comments/delete]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
