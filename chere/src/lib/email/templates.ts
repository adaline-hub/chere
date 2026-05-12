export function deliveryEmailHtml({
  recipientName,
  creatorName,
  shareUrl,
}: {
  recipientName: string;
  creatorName: string;
  shareUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0EB;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#FAF7F4;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(42,36,32,0.10);">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 0;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:1.25rem;letter-spacing:0.2em;color:#C4A97D;">Chère</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:1.5rem;color:#2A2420;line-height:1.3;">
                ${creatorName} made something for you.
              </p>
              <p style="margin:16px 0 32px;font-size:0.9375rem;color:#8B7D72;line-height:1.6;">
                ${recipientName}, someone took the time to turn their love into something you can open.
              </p>
              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#C4A97D;border-radius:8px;">
                    <a href="${shareUrl}" style="display:inline-block;padding:14px 36px;font-family:Georgia,serif;font-size:1rem;color:#FAF7F4;text-decoration:none;letter-spacing:0.04em;">
                      Open your gift
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:0.75rem;color:#B0A090;text-align:center;">
                Or paste this link into your browser:<br />
                <a href="${shareUrl}" style="color:#C4A97D;">${shareUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #EDE7DF;text-align:center;">
              <p style="margin:0;font-size:0.75rem;color:#B0A090;">
                Made with <a href="https://chere.app" style="color:#C4A97D;text-decoration:none;">Chère</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function openedNotificationHtml({
  recipientName,
  dashboardUrl,
}: {
  recipientName: string;
  dashboardUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
    <tr>
      <td align="center">
        <table width="440" cellpadding="0" cellspacing="0" style="max-width:440px;width:100%;background-color:#FAF7F4;border-radius:12px;padding:40px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:1.125rem;letter-spacing:0.15em;color:#C4A97D;">Chère</p>
              <p style="margin:24px 0 8px;font-size:1.5rem;color:#2A2420;">They opened it.</p>
              <p style="margin:0 0 24px;font-size:0.9375rem;color:#8B7D72;line-height:1.6;">
                ${recipientName} just opened your gift.
              </p>
              <a href="${dashboardUrl}" style="color:#C4A97D;font-size:0.9375rem;">See reactions →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
