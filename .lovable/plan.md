## Goal

Turn the static product list into a full e-commerce backend with an admin CMS, persistent cart, checkout with bank-transfer payment, and Gmail order emails.

## 1. Enable Lovable Cloud

Needed for: database (products, orders), auth (admin login), storage (product images), server functions (email send, order ops).

I'll create the admin account `kynox-official@picore.eu` / `kynox1977!` automatically and lock `/admin` behind a `user_roles` admin check (separate roles table, no role on profiles — security best practice).

## 2. Database schema

- `products` — id, slug, name, price, description, badge, tags[], details[], variant_selector ('color'|'image'|'none'), sizes[] (text array, empty = no size selector), created_at
- `product_images` — id, product_id, url, alt, sort_order, color_name (nullable — null = default gallery, else belongs to a color variant)
- `product_colors` — id, product_id, name, hex, sort_order
- `orders` — id, code (short public token, e.g. `KX-XXXXXX`), email, phone, address, total, status enum (`caka_na_platbu`, `zaplatene`, `spracovava_sa`, `poslane`, `dorucene`), created_at
- `order_items` — id, order_id, product_id, name_snapshot, price_snapshot, qty, color_name, color_image_url, size
- `user_roles` + `app_role` enum + `has_role()` SECURITY DEFINER function (per security guideline)

RLS: products/images/colors readable by everyone; writable only by admin. Orders insertable by anyone (public checkout), readable only by admin OR by anyone who knows the order `code` (via a public server function, not direct select).

## 3. Storage

Public bucket `product-images` for admin uploads.

## 4. Admin panel `/admin` (no nav link)

- `/admin` — login form if not authed, otherwise dashboard with tabs: **Products** | **Orders**
- **Products tab**: list, create, edit, delete. Per product: name, slug, price, badge, tags, details, description, variant selector mode, sizes list, color variants (name + hex + images), default images. Image upload via storage.
- **Orders tab**: list of all orders with code, customer, total, items, status dropdown to change status.

## 5. Storefront changes

- Migrate the store to read from the DB instead of `src/lib/products.ts` (keep file as fallback only if DB empty? — no, switch fully once seeded; I'll seed the existing Predator product).
- Product page: add **size selector** when `sizes.length > 0`. Variant selector (color/image) keeps working.
- Cart: persist in cookies (currently localStorage) so it survives properly; each cart line stores product_id, qty, color_name, color_image_url, size. Cart drawer shows color thumbnail + color name + size text.

## 6. Checkout flow

- Cart page (`/cart`) — list items, totals, then a form: email, phone, address, checkbox **"Súhlasím so zaslaním objednávky a som povinný zaplatiť"** (required). Button: **Objednať**.
- On submit: server function creates `order` + `order_items`, generates `code`, sends Gmail email, returns `code`.
- Redirect to `/pay/$code` showing:
  - "Kartou sa ešte nedá platiť. Pošlite nám platbu na bankový účet: **SK9402000000004746544651**"
  - Suma: <total> €
  - Variabilný symbol: order code
- Order detail route `/order/$code` (no nav link) — public via code, shows status + items. Email contains link to this route.

## 7. Email via Gmail

Use the Gmail connector (your Gmail account). I'll ask you to connect it. Email contains order code, total, bank details, and link `https://<site>/order/<code>`.

## 8. Files to add/modify

- New: migrations, `src/routes/admin.tsx`, `src/routes/cart.tsx`, `src/routes/pay.$code.tsx`, `src/routes/order.$code.tsx`, admin sub-components, product/order server functions, image upload helper, gmail send server function.
- Modify: `src/routes/store.index.tsx`, `src/routes/store.$productSlug.tsx`, `src/context/cart-context.tsx` (cookies + color/size metadata), `src/components/cart-drawer.tsx` (show color+size), `src/lib/products.ts` (replace with DB types + queries).

## 9. Questions before I start

1. **Email sender**: I'll connect your Gmail via the connector — emails will come from your Gmail address. OK, or do you prefer Lovable's built-in email (sends from your own verified domain, more pro)? You said Gmail so I'll go with that unless you say otherwise.
2. **Sizes**: free-text list per product (e.g. `38, 39, 40, 41`) entered by admin — OK?
3. **Seeding**: I'll keep the existing Predator product as a seed row so the store isn't empty. OK?

If you're good with this, say "go" (or answer the questions) and I'll build it.
