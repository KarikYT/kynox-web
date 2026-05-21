import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ensureAdminUser,
  checkIsAdmin,
  saveProduct,
  deleteProduct,
} from "@/lib/admin.functions";
import { listOrders, updateOrderStatus, deleteOrder } from "@/lib/orders.functions";
import { fetchAllProducts, formatPrice, type Product } from "@/lib/products";
import {
  Loader2,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  ChevronDown,
  Package,
  ShoppingBag,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Tab = "products" | "orders";

const STATUS_LABELS: Record<string, string> = {
  caka_na_platbu: "Čaká na platbu",
  zaplatene: "Zaplatené",
  spracovava_sa: "Spracováva sa",
  poslane: "Poslané",
  dorucene: "Doručené",
};
const STATUS_COLORS: Record<string, string> = {
  caka_na_platbu: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  zaplatene: "text-green-400 bg-green-400/10 border-green-400/30",
  spracovava_sa: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  poslane: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  dorucene: "text-foreground bg-foreground/10 border-border",
};

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginPanel({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("kynox-official@picore.eu");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await ensureAdminUser();
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("Tento účet nemá admin oprávnenia.");
      }
      onLogin();
    } catch (e: any) {
      setErr(e.message ?? "Chyba prihlásenia");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-5xl uppercase italic tracking-tighter mb-8 text-center">
          Admin
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
              Heslo
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-card border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          {err && (
            <p className="font-mono text-xs text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2">
              {err}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary text-background font-display text-xl uppercase py-4 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Prihlásiť sa
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Image Upload Helper ───────────────────────────────────────────────────────
async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error("Upload zlyhal: " + error.message);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

// ─── Product Form ─────────────────────────────────────────────────────────────
type ProductDraft = {
  id?: string;
  slug: string;
  name: string;
  price: string;
  description: string;
  badge: string;
  tags: string;
  details: string;
  sizes: string;
  variant_selector: "color" | "image" | "none";
  sort_order: string;
  colors: { name: string; hex: string }[];
  images: { url: string; alt: string; color_name: string }[];
};

function emptyDraft(): ProductDraft {
  return {
    slug: "",
    name: "",
    price: "0",
    description: "",
    badge: "",
    tags: "",
    details: "",
    sizes: "",
    variant_selector: "none",
    sort_order: "0",
    colors: [],
    images: [],
  };
}

function productToDraft(p: Product): ProductDraft {
  // Only include p.images as "default" if they truly have no color_name
  // (p.images can fall back to first color's images in mapProduct → would duplicate)
  const defaultOnly = p.images.filter((i) => !i.color_name);
  const allImages = [
    ...defaultOnly.map((i) => ({ url: i.src, alt: i.alt, color_name: "" })),
    ...p.colors.flatMap((c) =>
      c.images.map((i) => ({ url: i.src, alt: i.alt, color_name: c.name })),
    ),
  ];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: String(p.price),
    description: p.description,
    badge: p.badge ?? "",
    tags: p.tags.join(", "),
    details: p.details.join("\n"),
    sizes: p.sizes.join(", "),
    variant_selector: p.variantSelector,
    sort_order: String(p.sortOrder ?? 0),
    colors: p.colors.map((c) => ({ name: c.name, hex: c.hex })),
    images: allImages,
  };
}

function ProductForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<ProductDraft>(
    initial ? productToDraft(initial) : emptyDraft(),
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function upd(key: keyof ProductDraft, val: any) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const url = await uploadImage(f);
        setDraft((d) => ({
          ...d,
          images: [...d.images, { url, alt: f.name.replace(/\.[^.]+$/, ""), color_name: "" }],
        }));
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    setDraft((d) => ({ ...d, images: d.images.filter((_, i) => i !== idx) }));
  }
  function updateImage(idx: number, key: "alt" | "color_name", val: string) {
    setDraft((d) => ({
      ...d,
      images: d.images.map((img, i) => (i === idx ? { ...img, [key]: val } : img)),
    }));
  }
  function addColor() {
    setDraft((d) => ({ ...d, colors: [...d.colors, { name: "", hex: "#000000" }] }));
  }
  function removeColor(idx: number) {
    setDraft((d) => {
      const removed = d.colors[idx]?.name;
      return {
        ...d,
        colors: d.colors.filter((_, i) => i !== idx),
        // Detach images that referenced the removed color → become default images
        images: d.images.map((img) =>
          img.color_name === removed ? { ...img, color_name: "" } : img,
        ),
      };
    });
  }
  function updateColor(idx: number, key: "name" | "hex", val: string) {
    setDraft((d) => {
      const oldName = d.colors[idx]?.name;
      const newColors = d.colors.map((c, i) => (i === idx ? { ...c, [key]: val } : c));
      // If the name changed, rename it on every image that referenced the old name
      const newImages =
        key === "name" && oldName && oldName !== val
          ? d.images.map((img) =>
              img.color_name === oldName ? { ...img, color_name: val } : img,
            )
          : d.images;
      return { ...d, colors: newColors, images: newImages };
    });
  }

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      await saveProduct({
        data: {
          id: draft.id ?? null,
          slug: draft.slug.trim().toLowerCase().replace(/\s+/g, "-"),
          name: draft.name.trim(),
          price: parseFloat(draft.price) || 0,
          description: draft.description.trim(),
          badge: draft.badge.trim() || null,
          tags: draft.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          details: draft.details
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean),
          sizes: draft.sizes
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          variant_selector: draft.variant_selector,
          sort_order: parseInt(draft.sort_order) || 0,
          colors: draft.colors.filter((c) => c.name).map((c, i) => ({ ...c, sort_order: i })),
          images: draft.images.map((img, i) => ({
            url: img.url,
            alt: img.alt,
            color_name: img.color_name || null,
            sort_order: i,
          })),
        },
      });
      onSaved();
    } catch (e: any) {
      setErr(e.message ?? "Chyba uloženia");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="w-full max-w-2xl bg-background border border-border shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display text-2xl uppercase italic">
              {initial ? "Upraviť produkt" : "Nový produkt"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 grid place-items-center border border-border hover:bg-foreground hover:text-background transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Basic */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Názov" required>
                <input
                  value={draft.name}
                  onChange={(e) => {
                    upd("name", e.target.value);
                    if (!initial)
                      upd(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, ""),
                      );
                  }}
                  className={inputCls}
                />
              </Field>
              <Field label="Slug (URL)" required>
                <input
                  value={draft.slug}
                  onChange={(e) => upd("slug", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Cena (€)" required>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  onChange={(e) => upd("price", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Badge (napr. SALE)">
                <input
                  value={draft.badge}
                  onChange={(e) => upd("badge", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Poradie">
                <input
                  type="number"
                  value={draft.sort_order}
                  onChange={(e) => upd("sort_order", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Popis">
              <textarea
                rows={4}
                value={draft.description}
                onChange={(e) => upd("description", e.target.value)}
                className={inputCls + " resize-y"}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tagy (čiarkou)">
                <input
                  value={draft.tags}
                  onChange={(e) => upd("tags", e.target.value)}
                  placeholder="tričko, novinka"
                  className={inputCls}
                />
              </Field>
              <Field label="Veľkosti (čiarkou)">
                <input
                  value={draft.sizes}
                  onChange={(e) => upd("sizes", e.target.value)}
                  placeholder="XS, S, M, L, XL"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Detaily (každý na novom riadku)">
              <textarea
                rows={3}
                value={draft.details}
                onChange={(e) => upd("details", e.target.value)}
                placeholder="100% bavlna&#10;Made in EU"
                className={inputCls + " resize-y"}
              />
            </Field>

            <Field label="Variant selektor">
              <select
                value={draft.variant_selector}
                onChange={(e) => upd("variant_selector", e.target.value as any)}
                className={inputCls}
              >
                <option value="none">Žiadny</option>
                <option value="color">Farba (kruhy)</option>
                <option value="image">Obrázok (náhľady)</option>
              </select>
            </Field>

            {/* Colors */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Farby / varianty
                </span>
                <button
                  type="button"
                  onClick={addColor}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
                >
                  <Plus className="w-3 h-3" /> Pridať
                </button>
              </div>
              {draft.colors.length === 0 && (
                <p className="font-mono text-[10px] text-muted-foreground">
                  Žiadne farby — produkt bude bez variantov
                </p>
              )}
              {draft.colors.map((c, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => updateColor(i, "hex", e.target.value)}
                    className="w-10 h-9 border border-border cursor-pointer bg-transparent p-0"
                  />
                  <input
                    value={c.name}
                    onChange={(e) => updateColor(i, "name", e.target.value)}
                    placeholder="Názov farby"
                    className={inputCls + " flex-1"}
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="w-8 h-8 grid place-items-center text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Obrázky
                </span>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary hover:underline disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  Nahrať obrázok
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {draft.images.length === 0 && (
                <p className="font-mono text-[10px] text-muted-foreground">
                  Žiadne obrázky
                </p>
              )}
              <div className="space-y-2">
                {draft.images.map((img, i) => (
                  <div key={i} className="flex gap-2 items-center border border-border p-2">
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-14 h-14 object-cover shrink-0 border border-border"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <input
                        value={img.alt}
                        onChange={(e) => updateImage(i, "alt", e.target.value)}
                        placeholder="Alt text"
                        className={inputCls + " text-xs"}
                      />
                      <select
                        value={img.color_name}
                        onChange={(e) => updateImage(i, "color_name", e.target.value)}
                        className={inputCls + " text-xs"}
                      >
                        <option value="">— Žiadna farba (hlavný obrázok) —</option>
                        {draft.colors.filter((c) => c.name).map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="w-8 h-8 grid place-items-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {err && (
              <p className="font-mono text-xs text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2">
                {err}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-background font-display text-lg uppercase py-3 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Uložiť
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 border border-border font-mono text-xs uppercase tracking-widest hover:bg-card transition-all"
              >
                Zrušiť
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-card border border-border px-3 py-2 font-mono text-xs focus:outline-none focus:border-primary transition-colors";

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await fetchAllProducts());
    } finally {
      setLoading(false);
    }
  }, []);

  useState(() => {
    load();
  });

  // Initial load via useEffect replacement
  const [loaded, setLoaded] = useState(false);
  if (!loaded) {
    setLoaded(true);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Naozaj chceš zmazať tento produkt?")) return;
    setDeleting(id);
    try {
      await deleteProduct({ data: { id } });
      await load();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl uppercase italic">Produkty</h2>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 bg-primary text-background font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-primary/90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Nový produkt
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Žiadne produkty — pridaj prvý!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {products.map((p) => {
            const img = p.images[0];
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 border border-border bg-card px-4 py-3 hover:border-primary/50 transition-colors"
              >
                <div className="w-14 h-14 shrink-0 border border-border overflow-hidden bg-background">
                  {img ? (
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg uppercase leading-none truncate">
                    {p.name}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    {p.slug} · {formatPrice(p.price)}{" "}
                    {p.colors.length > 0 && `· ${p.colors.length} farí${p.colors.length === 1 ? "e" : "by/b"}`}{" "}
                    {p.sizes.length > 0 && `· vel: ${p.sizes.join(", ")}`}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="w-8 h-8 grid place-items-center border border-border hover:bg-foreground hover:text-background transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="w-8 h-8 grid place-items-center border border-border hover:bg-destructive hover:text-background hover:border-destructive transition-all disabled:opacity-50"
                  >
                    {deleting === p.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing !== null && (
        <ProductForm
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
type OrderRow = {
  id: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  total: number | string;
  status: string;
  created_at: string;
  delivery_method?: string | null;
  packeta_point_id?: string | null;
  packeta_point_name?: string | null;
  packeta_point_address?: string | null;
};
type OrderItemRow = {
  order_id: string;
  name_snapshot: string;
  qty: number;
  price_snapshot: number | string;
  color_name: string | null;
  size: string | null;
};

function OrdersTab() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sendEmail, setSendEmail] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOrders();
      setOrders((res.orders ?? []) as OrderRow[]);
      setItems((res.items ?? []) as OrderItemRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  if (!loaded) {
    setLoaded(true);
    load();
  }

  async function changeStatus(id: string, status: string) {
    setUpdating(id);
    const shouldSend = !!sendEmail[id];
    try {
      const res = await updateOrderStatus({
        data: { id, status: status as any, sendEmail: shouldSend },
      });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      // Reset checkbox after status change
      setSendEmail((prev) => ({ ...prev, [id]: false }));
      if (shouldSend) {
        setToast(res.emailSent ? "Email odoslaný ✓" : "Email už bol odoslaný skôr (preskočené)");
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      setUpdating(null);
    }
  }

   async function handleDelete(id: string) {
   if (!confirm("Naozaj chceš vymazať túto objednávku?")) return;
   setDeleting(id);
   try {
     await deleteOrder({ data: { id } });
     setOrders((prev) => prev.filter((o) => o.id !== id));
     setItems((prev) => prev.filter((i) => i.order_id !== id));
     if (expanded === id) setExpanded(null);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl uppercase italic">Objednávky</h2>
        <button
          type="button"
          onClick={load}
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Obnoviť
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Žiadne objednávky
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {orders.map((o) => {
            const orderItems = items.filter((i) => i.order_id === o.id);
            const isExp = expanded === o.id;
            return (
              <div key={o.id} className="border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setExpanded(isExp ? null : o.id)}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-card/80 transition-colors"
                >
                  <span className="font-mono text-xs font-bold text-primary shrink-0">
                    {o.code}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground truncate flex-1">
                    {o.email}
                  </span>
                  <span className="font-mono text-xs tabular-nums shrink-0">
                    {formatPrice(Number(o.total))}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 shrink-0 ${STATUS_COLORS[o.status] ?? ""}`}
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform text-muted-foreground ${isExp ? "rotate-180" : ""}`}
                  />
                </button>

                {isExp && (
                  <div className="border-t border-border px-4 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <InfoBlock label="E-mail" value={o.email} />
                      <InfoBlock label="Telefón" value={o.phone} />
                      <InfoBlock
                        label="Dátum"
                        value={new Date(o.created_at).toLocaleString("sk-SK")}
                      />
                      <InfoBlock label="Adresa" value={o.address} className="sm:col-span-3" />
                    </div>

                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                        Položky
                      </span>
                      <table className="w-full text-xs font-mono">
                        <tbody>
                          {orderItems.map((it, idx) => (
                            <tr key={idx} className="border-t border-border/50">
                              <td className="py-1.5 pr-4">
                                {it.name_snapshot}
                                {it.color_name && (
                                  <span className="text-muted-foreground"> · {it.color_name}</span>
                                )}
                                {it.size && (
                                  <span className="text-muted-foreground"> · vel. {it.size}</span>
                                )}
                              </td>
                              <td className="py-1.5 px-4 text-right text-muted-foreground">
                                ×{it.qty}
                              </td>
                              <td className="py-1.5 text-right tabular-nums">
                                {formatPrice(Number(it.price_snapshot) * it.qty)}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t border-border">
                            <td colSpan={2} className="pt-2 text-right text-muted-foreground">
                              Spolu
                            </td>
                            <td className="pt-2 text-right font-bold tabular-nums">
                              {formatPrice(Number(o.total))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Stav:
                      </span>
                      <select
                        value={o.status}
                        onChange={(e) => changeStatus(o.id, e.target.value)}
                        disabled={updating === o.id}
                        className="bg-background border border-border font-mono text-xs px-3 py-1.5 focus:outline-none focus:border-primary disabled:opacity-50"
                      >
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                      {updating === o.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!sendEmail[o.id]}
                          onChange={(e) =>
                            setSendEmail((prev) => ({ ...prev, [o.id]: e.target.checked }))
                          }
                          className="w-4 h-4 accent-primary cursor-pointer"
                        />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Poslať email pri zmene
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleDelete(o.id)}
                        disabled={deleting === o.id}
                        className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border border-destructive/50 text-destructive px-3 py-1.5 hover:bg-destructive hover:text-background transition-all disabled:opacity-50"
                      >
                        {deleting === o.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Vymazať objednávku
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background font-mono text-xs px-4 py-3 shadow-lg border border-border">
          {toast}
        </div>
      )}
    </>
  );
}

function InfoBlock({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-0.5">
        {label}
      </span>
      <span className="font-mono text-xs break-words">{value}</span>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("products");

  // Check if already logged in
  const [checking, setChecking] = useState(true);
  const [checkedOnce, setCheckedOnce] = useState(false);

  if (!checkedOnce) {
    setCheckedOnce(true);
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        try {
          const { isAdmin } = await checkIsAdmin();
          if (isAdmin) setAuthed(true);
        } catch {}
      }
      setChecking(false);
    });
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authed) {
    return <LoginPanel onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background border-b border-border flex items-center justify-between px-6 py-4">
        <span className="font-display text-2xl uppercase italic tracking-tighter">
          KYNOX Admin
        </span>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            setAuthed(false);
          }}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Odhlásiť
        </button>
      </div>

      {/* Tab switcher */}
      <div className="border-b border-border px-6">
        <div className="flex gap-0">
          {(
            [
              { id: "products", label: "Produkty", Icon: Package },
              { id: "orders", label: "Objednávky", Icon: ShoppingBag },
            ] as { id: Tab; label: string; Icon: any }[]
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-5 py-3 border-b-2 transition-all ${
                tab === id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {tab === "products" ? <ProductsTab /> : <OrdersTab />}
      </div>
    </div>
  );
}
