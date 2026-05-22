import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendOrderEmail, sendStatusEmail, type OrderStatus } from "./email.server";


const ItemSchema = z.object({
  productId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255),
  price: z.number().nonnegative(),
  qty: z.number().int().min(1).max(99),
  colorName: z.string().max(100).nullable().optional(),
  colorImageUrl: z.string().max(2000).nullable().optional(),
  size: z.string().max(50).nullable().optional(),
});

const CreateOrderSchema = z.object({
  email: z.string().email().max(255),
  phone: z.string().min(3).max(50),
  address: z.string().min(3).max(1000),
  consent: z.literal(true),
  items: z.array(ItemSchema).min(1).max(50),
  deliveryMethod: z.enum(["packeta", "address"]).default("packeta"),
  packetaPointId: z.string().max(50).nullable().optional(),
  packetaPointName: z.string().max(255).nullable().optional(),
  packetaPointAddress: z.string().max(500).nullable().optional(),
});

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `KX-${out}`;
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => CreateOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const total = data.items.reduce((s, i) => s + i.price * i.qty, 0);
    const code = makeCode();

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        code,
        email: data.email,
        phone: data.phone,
        address: data.address,
        total,
        status: "caka_na_platbu",
        delivery_method: data.deliveryMethod,
        packeta_point_id: data.packetaPointId ?? null,
        packeta_point_name: data.packetaPointName ?? null,
        packeta_point_address: data.packetaPointAddress ?? null,
      })
      .select()
      .single();
    if (orderErr) throw new Error("Nepodarilo sa vytvoriť objednávku: " + orderErr.message);

    const rows = data.items.map((i) => ({
      order_id: order.id,
      product_id: i.productId ?? null,
      name_snapshot: i.name,
      price_snapshot: i.price,
      qty: i.qty,
      color_name: i.colorName ?? null,
      color_image_url: i.colorImageUrl ?? null,
      size: i.size ?? null,
    }));
    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(rows);
    if (itemsErr) throw new Error("Nepodarilo sa uložiť položky: " + itemsErr.message);

    // Send email (best-effort)
    try {
      await sendOrderEmail({
        to: data.email,
        code,
        total,
        items: data.items.map((i) => ({
          name: i.name,
          qty: i.qty,
          price: i.price,
          colorName: i.colorName ?? null,
          size: i.size ?? null,
        })),
      });
    } catch (e) {
      console.error("Email send failed:", e);
    }

    return { code, total };
  });

export const getOrderByCode = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ code: z.string().min(1).max(50) }).parse(input))
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("code", data.code)
      .maybeSingle();
    if (error) throw error;
    if (!order) return null;
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    return { order, items: items ?? [] };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const ids = (orders ?? []).map((o) => o.id);
    if (ids.length === 0) return { orders: [], items: [] };
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", ids);
    return { orders: orders ?? [], items: items ?? [] };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["caka_na_platbu", "zaplatene", "spracovava_sa", "poslane", "dorucene"]),
        sendEmail: z.boolean().optional().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;

    let emailSent = false;
    const emailable: OrderStatus[] = ["zaplatene", "spracovava_sa", "poslane", "dorucene"];
    if (data.sendEmail && (emailable as string[]).includes(data.status)) {
      // Check if email for this status was already sent — use admin to read full row
      const { data: row } = await supabaseAdmin
        .from("orders")
        .select("email, code, sent_status_emails")
        .eq("id", data.id)
        .single();
      if (row) {
        const sent: string[] = (row.sent_status_emails as string[] | null) ?? [];
        if (!sent.includes(data.status)) {
          try {
            await sendStatusEmail({
              to: row.email,
              code: row.code,
              status: data.status as OrderStatus,
            });
            await supabaseAdmin
              .from("orders")
              .update({ sent_status_emails: [...sent, data.status] })
              .eq("id", data.id);
            emailSent = true;
          } catch (e) {
            console.error("Status email failed:", e);
          }
        }
      }
    }
    return { ok: true, emailSent };
  });

export const getPacketaApiKey = createServerFn({ method: "GET" }).handler(async () => {
  return { apiKey: process.env.PACKETA_API_KEY ?? "" };
});

// ─── Submit order to Packeta (creates packet via REST API) ───────────────────
const PARCEL_SIZES = {
  small_envelope: { label: "Malá obálka", L: 250, W: 180, H: 20 },
  shoe_box: { label: "Krabica na topánky", L: 350, W: 250, H: 150 },
  big_box: { label: "Veľká krabica", L: 500, W: 400, H: 300 },
} as const;

function escXml(v: string | number): string {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : null;
}

export const submitOrderToPacketa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        parcelSize: z.enum(["small_envelope", "shoe_box", "big_box"]),
        weight: z.number().positive().max(50),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiPassword = process.env.PACKETA_API_PASSWORD;
    if (!apiPassword) throw new Error("Chýba PACKETA_API_PASSWORD secret.");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !order) throw new Error("Objednávka sa nenašla.");
    if ((order as any).packeta_packet_id) throw new Error("Objednávka už bola odoslaná do Packety.");
    if (order.delivery_method !== "packeta" || !order.packeta_point_id) {
      throw new Error("Objednávka nemá zvolený Packeta výdajný bod.");
    }

    const addressLines = (order.address || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const fullName = addressLines[0] || order.email.split("@")[0];
    const parts = fullName.split(/\s+/);
    const firstName = parts[0] || "Zákazník";
    const surname = parts.slice(1).join(" ") || "—";

    const size = PARCEL_SIZES[data.parcelSize];

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<createPacket>
  <apiPassword>${escXml(apiPassword)}</apiPassword>
  <packetAttributes>
    <number>${escXml(order.code)}</number>
    <name>${escXml(firstName)}</name>
    <surname>${escXml(surname)}</surname>
    <email>${escXml(order.email)}</email>
    <phone>${escXml(order.phone || "")}</phone>
    <addressId>${escXml(order.packeta_point_id)}</addressId>
    <cod>0</cod>
    <value>${escXml(Number(order.total).toFixed(2))}</value>
    <weight>${escXml(data.weight)}</weight>
    <length>${escXml(size.L)}</length>
    <width>${escXml(size.W)}</width>
    <height>${escXml(size.H)}</height>
    <eshop>KYNOX</eshop>
  </packetAttributes>
</createPacket>`;

    const res = await fetch("https://www.zasilkovna.cz/api/rest", {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      body: xml,
    });
    const responseText = await res.text();
    const status = getTag(responseText, "status");
    if (status !== "ok") {
      const fault =
        getTag(responseText, "string") ||
        getTag(responseText, "fault") ||
        responseText.slice(0, 500);
      throw new Error("Packeta chyba: " + fault);
    }

    const result = responseText.match(/<result>([\s\S]*?)<\/result>/)?.[1] ?? responseText;
    const packetId = getTag(result, "id");
    const barcode = getTag(result, "barcode");
    const barcodeText = getTag(result, "barcodeText");
    const trackingUrl = barcode ? `https://tracking.packeta.com/sk/?id=${barcode}` : null;

    if (!packetId) throw new Error("Packeta nevrátila ID zásielky.");

    await supabaseAdmin
      .from("orders")
      .update({
        packeta_packet_id: packetId,
        packeta_barcode: barcode || barcodeText,
        packeta_tracking_url: trackingUrl,
        packeta_parcel_size: data.parcelSize,
        packeta_weight: data.weight,
        packeta_submitted_at: new Date().toISOString(),
      } as any)
      .eq("id", data.id);

    return { ok: true, packetId, barcode: barcode || barcodeText, trackingUrl };
  });


export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .delete()
      .eq("order_id", data.id);
    if (itemsError) throw new Error(itemsError.message);

    const { error } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    return { ok: true };
  });
