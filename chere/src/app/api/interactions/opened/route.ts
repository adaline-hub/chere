import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOpenedNotification } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  try {
    const { creationId } = (await req.json()) as { creationId: string };
    if (!creationId) return NextResponse.json({ error: "Missing creationId" }, { status: 400 });

    const admin = createAdminClient();

    // Log the interaction
    await admin.from("recipient_interactions").insert({
      creation_id: creationId,
      interaction_type: "opened",
    });

    // Update first_opened_at only if not already set
    const { data: creation } = await admin
      .from("creations")
      .select("first_opened_at, recipient_name, creator_id")
      .eq("id", creationId)
      .single();

    if (creation && !creation.first_opened_at) {
      await admin
        .from("creations")
        .update({ first_opened_at: new Date().toISOString() })
        .eq("id", creationId);

      // Notify creator
      if (process.env.RESEND_API_KEY && creation.creator_id) {
        const { data: profile } = await admin
          .from("profiles")
          .select("email")
          .eq("id", creation.creator_id)
          .single();

        if (profile?.email) {
          const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://chere.app"}/dashboard`;
          await sendOpenedNotification({
            creatorEmail: profile.email,
            recipientName: creation.recipient_name,
            dashboardUrl,
          }).catch(() => {/* non-fatal */});
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[interactions/opened]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
