import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReactionNotification } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  let body: { creationId?: string; recipientName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { creationId, recipientName } = body;
  if (!creationId) return NextResponse.json({ error: "Missing creationId" }, { status: 400 });

  try {
    const admin = createAdminClient();

    const { data: creation } = await admin
      .from("creations")
      .select("creator_id, recipient_name, share_token")
      .eq("id", creationId)
      .single();

    if (!creation) return NextResponse.json({ ok: true });

    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", creation.creator_id)
      .single();

    if (!profile?.email) return NextResponse.json({ ok: true });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chere.app";
    const dashboardUrl = `${appUrl}/dashboard/reactions/${creationId}`;

    await sendReactionNotification({
      creatorEmail: profile.email,
      recipientName: (recipientName ?? creation.recipient_name) as string,
      dashboardUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-reaction] error:", err);
    return NextResponse.json({ ok: true }); // fail silently — don't disrupt the experience
  }
}
