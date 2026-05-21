// Gmail send via Lovable connector gateway. Server-only.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

function b64url(input: string): string {
  const utf8 = unescape(encodeURIComponent(input));
  return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function siteOrigin(): string {
  return (
    process.env.PUBLIC_SITE_URL ||
    "https://kynox.picore.eu"
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
        `<tr style="border-bottom:1px solid #eee">` +
        `<td style="padding:10px 0">${escapeHtml(i.name)}` +
        (i.colorName ? `<span style="color:#888"> · ${escapeHtml(i.colorName)}</span>` : "") +
        (i.size ? `<span style="color:#888"> · ${escapeHtml(i.size)}</span>` : "") +
        `</td>` +
        `<td style="padding:10px 12px;text-align:center;color:#555">×${i.qty}</td>` +
        `<td style="padding:10px 0;text-align:right">${fmt(i.price * i.qty)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#111">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr>
          <td style="background:#111;padding:24px 32px">
            <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:3px">KYNOX</span>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:32px">

          <p style="margin:0 0 4px;font-size:14px;color:#666;text-transform:uppercase;letter-spacing:1px">Ďakujeme za objednávku</p>
          <p style="margin:0 0 24px;font-size:28px;font-weight:700">${params.code}</p>

          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse">
            <thead>
              <tr style="border-bottom:2px solid #111">
                <th style="text-align:left;padding:0 0 8px;font-weight:600">Produkt</th>
                <th style="text-align:center;padding:0 12px 8px;font-weight:600">Ks</th>
                <th style="text-align:right;padding:0 0 8px;font-weight:600">Cena</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="border-top:2px solid #111">
                <td colspan="2" style="padding:12px 0 0;font-weight:700;font-size:15px">Spolu</td>
                <td style="padding:12px 0 0;text-align:right;font-weight:700;font-size:15px">${fmt(params.total)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Payment block -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
            <tr>
              <td style="background:#f4f4f5;border-radius:6px;padding:20px 24px">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#444">Platba prevodom</p>
                <p style="margin:0 0 6px;font-size:13px;color:#555">IBAN</p>
                <p style="margin:0 0 14px;font-size:15px;font-weight:600;font-family:monospace">SK94 0200 0000 0047 4654 4651</p>
                <p style="margin:0 0 6px;font-size:13px;color:#555">Variabilný symbol</p>
                <p style="margin:0;font-size:15px;font-weight:600;font-family:monospace">${params.code.replace(/[^0-9]/g, "")}</p>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <p style="margin:28px 0 0;text-align:center">
            <a href="${orderUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:.5px">Sledovať objednávku →</a>
          </p>

        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #eee;text-align:center;font-size:12px;color:#aaa">
            © KYNOX · Ak máš otázky, odpovedaj na tento e-mail.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

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

export type OrderStatus = "zaplatene" | "spracovava_sa" | "poslane" | "dorucene";

const STATUS_CONTENT: Record<OrderStatus, { subject: string; title: string; body: string; emoji: string }> = {
  zaplatene: {
    subject: "Platba prijatá",
    title: "Platba prijatá ✓",
    emoji: "💰",
    body: "Ďakujeme! Tvoju platbu sme úspešne prijali. Objednávku ideme pripravovať.",
  },
  spracovava_sa: {
    subject: "Objednávka sa spracováva",
    title: "Spracovávame tvoju objednávku",
    emoji: "📦",
    body: "Tvoju objednávku práve balíme. Čoskoro ju odovzdáme dopravcovi.",
  },
  poslane: {
    subject: "Objednávka odoslaná",
    title: "Objednávka je na ceste",
    emoji: "🚚",
    body: "Tvoja objednávka bola odoslaná. Doručenie zvyčajne trvá 1–3 pracovné dni.",
  },
  dorucene: {
    subject: "Objednávka doručená",
    title: "Doručené ✓",
    emoji: "🎉",
    body: "Tvoja objednávka by mala byť doručená. Ďakujeme, že nakupuješ u nás — KYNOX.",
  },
};

export async function sendStatusEmail(params: {
  to: string;
  code: string;
  status: OrderStatus;
}): Promise<void> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const GOOGLE_MAIL_API_KEY = process.env.GOOGLE_MAIL_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  if (!GOOGLE_MAIL_API_KEY) throw new Error("GOOGLE_MAIL_API_KEY missing");

  const c = STATUS_CONTENT[params.status];
  const origin = siteOrigin();
  const orderUrl = `${origin}/order/${params.code}`;
  const subject = `KYNOX — ${c.subject} · ${params.code}`;

  const html = `<!doctype html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#111">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td style="background:#111;padding:24px 32px">
          <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:3px">KYNOX</span>
        </td></tr>
        <tr><td style="padding:40px 32px;text-align:center">
          <div style="font-size:48px;line-height:1;margin-bottom:16px">${c.emoji}</div>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:700">${escapeHtml(c.title)}</h1>
          <p style="margin:0 0 8px;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px">Objednávka</p>
          <p style="margin:0 0 24px;font-size:22px;font-weight:700;font-family:monospace">${escapeHtml(params.code)}</p>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#444">${escapeHtml(c.body)}</p>
          <p style="margin:0">
            <a href="${orderUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:.5px">Sledovať objednávku →</a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #eee;text-align:center;font-size:12px;color:#aaa">
          © KYNOX · Ak máš otázky, odpovedaj na tento e-mail.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `${c.title}\n\nObjednávka: ${params.code}\n\n${c.body}\n\nStav objednávky: ${orderUrl}\n`;

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
