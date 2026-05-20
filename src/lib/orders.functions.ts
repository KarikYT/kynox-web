import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendOrderEmail } from "./email.server";


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
    return { ok: true };
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
