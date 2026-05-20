// DB-backed types and helpers for products.
import { supabase } from "@/integrations/supabase/client";

export type VariantSelector = "color" | "image" | "none";

export type ProductImage = { id?: string; src: string; alt: string; color_name?: string | null };

export type ColorVariant = {
  id?: string;
  name: string;
  hex: string;
  images: ProductImage[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  badge: string | null;
  tags: string[];
  details: string[];
  sizes: string[];
  variantSelector: VariantSelector;
  sortOrder: number;
  images: ProductImage[];
  colors: ColorVariant[];
};

export const formatPrice = (n: number): string =>
  (n % 1 === 0 ? `${n}` : n.toFixed(2).replace(".", ",")) + " €";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  description: string;
  badge: string | null;
  tags: string[] | null;
  details: string[] | null;
  sizes: string[] | null;
  variant_selector: string;
  sort_order: number;
};

function mapProduct(
  p: ProductRow,
  images: { id: string; url: string; alt: string; color_name: string | null; sort_order: number }[],
  colors: { id: string; name: string; hex: string; sort_order: number }[],
): Product {
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const defaultImages = sortedImages
    .filter((i) => !i.color_name)
    .map((i) => ({ id: i.id, src: i.url, alt: i.alt, color_name: null }));

  const colorVariants: ColorVariant[] = [...colors]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
      images: sortedImages
        .filter((i) => i.color_name === c.name)
        .map((i) => ({ id: i.id, src: i.url, alt: i.alt, color_name: c.name })),
    }));

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    description: p.description ?? "",
    badge: p.badge,
    tags: p.tags ?? [],
    details: p.details ?? [],
    sizes: p.sizes ?? [],
    variantSelector: (p.variant_selector as VariantSelector) ?? "none",
    sortOrder: p.sort_order ?? 0,
    images: defaultImages.length > 0 ? defaultImages : (colorVariants[0]?.images ?? []),
    colors: colorVariants,
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data: rows, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [imgs, cols] = await Promise.all([
    supabase.from("product_images").select("*").in("product_id", ids),
    supabase.from("product_colors").select("*").in("product_id", ids),
  ]);

  return rows.map((r) =>
    mapProduct(
      r as ProductRow,
      (imgs.data ?? []).filter((i) => i.product_id === r.id) as never,
      (cols.data ?? []).filter((c) => c.product_id === r.id) as never,
    ),
  );
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data: row, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const [imgs, cols] = await Promise.all([
    supabase.from("product_images").select("*").eq("product_id", row.id),
    supabase.from("product_colors").select("*").eq("product_id", row.id),
  ]);
  return mapProduct(row as ProductRow, (imgs.data ?? []) as never, (cols.data ?? []) as never);
}

export function getImages(product: Product, colorName?: string | null): ProductImage[] {
  if (!colorName) return product.images;
  const c = product.colors.find((c) => c.name === colorName);
  if (c && c.images.length > 0) return c.images;
  return product.images;
}
