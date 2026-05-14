import { NextRequest, NextResponse } from "next/server";
import { adminUpdateCreation, getCreationById } from "@/lib/supabase/creations";
import { sendDeliveryEmail } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  console.log("=== DELIVER ROUTE CALLED ===");

  let body: { creationId?: string; method?: string; recipientEmail?: string };
  try {
    body = await req.json();
  } catch {
    console.error("DELIVER: failed to parse JSON body");
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { creationId, method, recipientEmail } = body as {
    creationId: string;
    method: "email" | "link" | "qr";
    recipientEmail?: string;
  };

  console.log("DELIVER: creationId:", creationId);
  console.log("DELIVER: method:", method);
  console.log("DELIVER: recipientEmail:", recipientEmail);
  console.log("DELIVER: RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
  console.log("DELIVER: RESEND_API_KEY prefix:", process.env.RESEND_API_KEY?.substring(0, 6));
  console.log("DELIVER: EMAIL_FROM:", process.env.EMAIL_FROM);

  if (!creationId) {
    return NextResponse.json({ error: "Missing creationId" }, { status: 400 });
  }

  try {
    const creation = await getCreationById(creationId);
    if (!creation) {
      console.error("DELIVER: creation not found:", creationId);
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (method === "email") {
      if (!recipientEmail) {
        return NextResponse.json({ error: "Missing recipientEmail" }, { status: 400 });
      }

      console.log("DELIVER: sending email to:", recipientEmail);
      console.log("DELIVER: share_token:", creation.share_token);

      try {
        await sendDeliveryEmail({
          recipientEmail,
          recipientName: creation.recipient_name,
          creatorName: "Someone who loves you",
          shareToken: creation.share_token,
        });
        console.log("DELIVER: email sent successfully");
      } catch (emailErr) {
        console.error("DELIVER: Resend FAILED:", emailErr);
        return NextResponse.json(
          { error: "Email delivery failed", details: String(emailErr) },
          { status: 500 }
        );
      }
    }

    await adminUpdateCreation(creationId, {
      status: "sent",
      delivered_at: new Date().toISOString(),
      recipient_email: recipientEmail ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELIVER: unexpected error:", err);
    return NextResponse.json({ error: "Delivery failed", details: String(err) }, { status: 500 });
  }
}
