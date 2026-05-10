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
