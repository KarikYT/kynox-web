// Gmail send via Lovable connector gateway. Server-only.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

function b64url(input: string): string {
  // btoa handles Latin-1; we need UTF-8 safe encoding for Slovak chars
  const utf8 = unescape(encodeURIComponent(input));
  return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function siteOrigin(): string {
  return (
    process.env.PUBLIC_SITE_URL ||
    "https://kynox-official.lovable.app"
  );
}

export type OrderEmailItem = {
  name: string;
  qty: number;
  price: number;
  colorName: string | null;
  size: string | null;
};

export async function sendOrderEmail(params: {
  to: string;
  code: string;
  total: number;
  items: OrderEmailItem[];
}): Promise<void> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const GOOGLE_MAIL_API_KEY = process.env.GOOGLE_MAIL_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  if (!GOOGLE_MAIL_API_KEY) throw new Error("GOOGLE_MAIL_API_KEY missing");

  const origin = siteOrigin();
  const orderUrl = `${origin}/order/${params.code}`;
  const subject = `KYNOX — objednávka ${params.code}`;

  const itemsHtml = params.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 12px 6px 0">${escapeHtml(i.name)}${
          i.colorName ? ` · ${escapeHtml(i.colorName)}` : ""
        }${i.size ? ` · ${escapeHtml(i.size)}` : ""}</td>` +
        `<td style="padding:6px 12px;text-align:right">×${i.qty}</td>` +
        `<td style="padding:6px 0;text-align:right">${fmt(i.price * i.qty)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;color:#111;padding:24px">
    <h2 style="margin:0 0 12px">Ďakujeme za objednávku</h2>
    <p style="margin:0 0 8px">Tvoj kód objednávky:</p>
    <p style="font-size:28px;letter-spacing:2px;margin:0 0 20px"><strong>${params.code}</strong></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      ${itemsHtml}
      <tr><td colspan="3" style="border-top:1px solid #eee;padding-top:10px;text-align:right"><strong>Spolu: ${fmt(params.total)}</strong></td></tr>
    </table>
    <p style="margin:16px 0 8px"><strong>Platba prevodom:</strong></p>
    <p style="margin:0">IBAN: <code>SK9402000000004746544651</code><br/>Variabilný symbol: <code>${params.code.replace(/[^0-9]/g, "")}</code></p>
    <p style="margin:24px 0">Stav objednávky: <a href="${orderUrl}">${orderUrl}</a></p>
    <p style="color:#888;font-size:12px;margin-top:32px">KYNOX</p>
  </body></html>`;

  const text = `Ďakujeme za objednávku.\nKód: ${params.code}\nSpolu: ${fmt(params.total)}\n\nPlatba prevodom:\nIBAN: SK9402000000004746544651\nVariabilný symbol: ${params.code.replace(/[^0-9]/g, "")}\n\nStav objednávky: ${orderUrl}\n`;

  const boundary = "kynox_" + Math.random().toString(36).slice(2);
  const rfc = [
    `To: ${params.to}`,
    `Subject: =?UTF-8?B?${b64url(subject)}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    `--${boundary}--`,
    "",
  ].join("\r\n");

  const raw = b64url(rfc);

  const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gmail send failed [${res.status}]: ${body}`);
  }
}

function fmt(n: number): string {
  return (n % 1 === 0 ? `${n}` : n.toFixed(2).replace(".", ",")) + " €";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
