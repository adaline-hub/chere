import { NextRequest, NextResponse } from "next/server";
import { adminUpdateCreation, getCreationById } from "@/lib/supabase/creations";
import { sendDeliveryEmail } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  try {
    const { creationId, method, recipientEmail } = (await req.json()) as {
      creationId: string;
      method: "email" | "link" | "qr";
      recipientEmail?: string;
    };

    if (!creationId) {
      return NextResponse.json({ error: "Missing creationId" }, { status: 400 });
    }

    const creation = await getCreationById(creationId);
    if (!creation) {
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (method === "email") {
      if (!recipientEmail) {
        return NextResponse.json({ error: "Missing recipientEmail" }, { status: 400 });
      }
      await sendDeliveryEmail({
        recipientEmail,
        recipientName: creation.recipient_name,
        creatorName: "Someone who loves you", // Phase 8: resolve from profiles
        shareToken: creation.share_token,
      });
    }

    await adminUpdateCreation(creationId, {
      status: "sent",
      delivered_at: new Date().toISOString(),
      recipient_email: recipientEmail ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[deliver]", err);
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 });
  }
}
