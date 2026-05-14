import { Resend } from "resend";
import { deliveryEmailHtml, openedNotificationHtml } from "./templates";
import { getTributeUrl } from "@/lib/utils/share-token";

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "Chère <gifts@chere.app>";

export async function sendDeliveryEmail(data: {
  recipientEmail: string;
  recipientName: string;
  creatorName: string;
  shareToken: string;
}): Promise<void> {
  const resend = getResend();
  const shareUrl = getTributeUrl(data.shareToken);

  await resend.emails.send({
    from: FROM,
    to: data.recipientEmail,
    subject: `${data.creatorName} made something for you`,
    html: deliveryEmailHtml({
      recipientName: data.recipientName,
      creatorName: data.creatorName,
      shareUrl,
    }),
  });
}

export async function sendOpenedNotification(data: {
  creatorEmail: string;
  recipientName: string;
  dashboardUrl: string;
}): Promise<void> {
  const resend = getResend();

  await resend.emails.send({
    from: FROM,
    to: data.creatorEmail,
    subject: `${data.recipientName} opened your gift`,
    html: openedNotificationHtml({
      recipientName: data.recipientName,
      dashboardUrl: data.dashboardUrl,
    }),
  });
}

export async function sendReactionNotification(data: {
  creatorEmail: string;
  recipientName: string;
  dashboardUrl: string;
}): Promise<void> {
  const resend = getResend();

  await resend.emails.send({
    from: FROM,
    to: data.creatorEmail,
    subject: `${data.recipientName} reacted to your gift`,
    html: `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#F5F0EB;margin:0;padding:2rem;">
<div style="max-width:520px;margin:0 auto;background:#FAF7F4;border-radius:12px;padding:2.5rem;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<p style="font-size:1.5rem;color:#2A2420;margin:0 0 1rem;">${data.recipientName} reacted to your gift.</p>
<p style="color:#8B7D72;line-height:1.7;margin:0 0 2rem;">You captured a beautiful moment. Watch their reaction while it&apos;s fresh.</p>
<a href="${data.dashboardUrl}" style="display:inline-block;background:#C4A97D;color:#FAF7F4;padding:0.875rem 2rem;border-radius:0.5rem;text-decoration:none;font-size:0.9375rem;">Watch their reaction →</a>
<p style="margin-top:2.5rem;font-size:0.75rem;color:#C4A97D;">Made with Chère · <a href="https://chere.app" style="color:#C4A97D;">chere.app</a></p>
</div></body></html>`,
  });
}
