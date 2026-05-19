import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "kynox-official@picore.eu";
const ADMIN_PASSWORD = "kynox1977!";

/** Ensure the canonical admin user exists. Called by the admin login page. */
export const ensureAdminUser = createServerFn({ method: "POST" }).handler(async () => {
  // Check existing
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw new Error(listErr.message);
  const existing = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
  if (existing) {
    // Make sure admin role exists
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: existing.id, role: "admin" }, { onConflict: "user_id,role" });
    return { ok: true, created: false };
  }
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  if (data.user) {
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.user.id, role: "admin" }, { onConflict: "user_id,role" });
  }
  return { ok: true, created: true };
});

/** Check whether the calling authenticated user has the admin role. */
export const checkIsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw error;
    return { isAdmin: !!data };
  });

/** Save a product (create or update) with colors + images. Admin only. */
const ImageInput = z.object({
  url: z.string().min(1).max(2000),
  alt: z.string().max(255).default(""),
  color_name: z.string().max(100).nullable().optional(),
  sort_order: z.number().int().default(0),
});
const ColorInput = z.object({
  name: z.string().min(1).max(100),
  hex: z.string().min(1).max(20),
  sort_order: z.number().int().default(0),
});
const ProductInput = z.object({
  id: z.string().uuid().nullable().optional(),
  slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/, "slug musí byť lowercase a-z 0-9 -"),
  name: z.string().min(1).max(255),
  price: z.number().nonnegative(),
  description: z.string().max(5000).default(""),
  badge: z.string().max(50).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  details: z.array(z.string().max(255)).max(30).default([]),
  sizes: z.array(z.string().max(20)).max(30).default([]),
  variant_selector: z.enum(["color", "image", "none"]).default("none"),
  sort_order: z.number().int().default(0),
  colors: z.array(ColorInput).max(50).default([]),
  images: z.array(ImageInput).max(100).default([]),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ProductInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Admin check
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Unauthorized");

    let productId = data.id ?? null;
    const payload = {
      slug: data.slug,
      name: data.name,
      price: data.price,
      description: data.description,
      badge: data.badge ?? null,
      tags: data.tags,
      details: data.details,
      sizes: data.sizes,
      variant_selector: data.variant_selector,
      sort_order: data.sort_order,
    };

    if (productId) {
      const { error } = await supabaseAdmin.from("products").update(payload).eq("id", productId);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabaseAdmin
        .from("products")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      productId = created.id;
    }

    // Replace colors and images (simple strategy)
    await supabaseAdmin.from("product_colors").delete().eq("product_id", productId);
    if (data.colors.length > 0) {
      const rows = data.colors.map((c, idx) => ({
        product_id: productId,
        name: c.name,
        hex: c.hex,
        sort_order: c.sort_order ?? idx,
      }));
      const { error } = await supabaseAdmin.from("product_colors").insert(rows);
      if (error) throw new Error(error.message);
    }

    await supabaseAdmin.from("product_images").delete().eq("product_id", productId);
    if (data.images.length > 0) {
      const rows = data.images.map((i, idx) => ({
        product_id: productId,
        url: i.url,
        alt: i.alt ?? "",
        color_name: i.color_name ?? null,
        sort_order: i.sort_order ?? idx,
      }));
      const { error } = await supabaseAdmin.from("product_images").insert(rows);
      if (error) throw new Error(error.message);
    }

    return { id: productId };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Unauthorized");
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
