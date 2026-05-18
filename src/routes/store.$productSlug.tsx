import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { getProduct, products, formatPrice, getImages, type Product } from "@/lib/products";
import { useCart } from "@/context/cart-context";
import { SiteNav } from "@/components/site-nav";
import { QtyControl } from "@/components/cart-drawer";

export const Route = createFileRoute("/store/$productSlug")({
  component: ProductPage,
  loader: ({ params }) => {
    const product = getProduct(params.productSlug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — KYNOX Store` },
          { name: "description", content: loaderData.product.description },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground px-6 text-center">
      <div>
        <h1 className="font-display text-6xl uppercase italic mb-4">Nenájdené</h1>
        <Link
          to="/store"
          className="font-mono text-xs uppercase tracking-widest border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-background transition-all"
        >
          Späť do storu
        </Link>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { add, open, items } = useCart();
  const hasColors = product.colors.length > 0;
  const [activeColor, setActiveColor] = useState<string | undefined>(
    hasColors ? product.colors.find((c) => c.images.length > 0)?.name ?? product.colors[0].name : undefined,
  );
  const galleryImages = getImages(product, activeColor);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function selectColor(name: string) {
    setActiveColor(name);
    setActiveImg(0);
  }

  const inCart = items.find((i) => i.id === product.id)?.qty ?? 0;

  function handleAdd() {
    add(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SiteNav active="store" />

      <main className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Späť do storu
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Gallery */}
            <div className="animate-fade-up">
              <div className="relative aspect-[4/5] bg-card overflow-hidden border border-border">
                <img
                  key={activeImg}
                  src={product.images[activeImg].src}
                  alt={product.images[activeImg].alt}
                  className="w-full h-full object-cover grayscale animate-scale-in"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-primary text-background font-mono text-[10px] uppercase tracking-widest px-2 py-1">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square overflow-hidden border-2 transition-all ${
                      i === activeImg
                        ? "border-primary"
                        : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover grayscale"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="animate-fade-up [animation-delay:120ms] flex flex-col">
              <div className="flex gap-2 flex-wrap mb-3">
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] text-primary uppercase tracking-widest"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase italic leading-[0.85] -tracking-[0.03em] mb-6">
                {product.name}
              </h1>

              <div className="flex items-end gap-4 mb-8 pb-6 border-b border-border">
                <span className="font-display text-4xl tabular-nums">
                  {formatPrice(product.price)}
                </span>
                {inCart > 0 && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground pb-1">
                    {inCart} v košíku
                  </span>
                )}
              </div>

              <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-8">
                {product.description}
              </p>

              <ul className="grid grid-cols-2 gap-px bg-border border border-border mb-10">
                {product.details.map((d) => (
                  <li
                    key={d}
                    className="bg-background p-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    {d}
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Množstvo
                  </span>
                  <QtyControl value={qty} onChange={setQty} size="md" />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleAdd}
                    className={`flex-1 font-display text-xl sm:text-2xl uppercase py-4 sm:py-5 transition-all active:scale-95 flex items-center justify-center gap-3 ${
                      added
                        ? "bg-foreground text-background"
                        : "bg-primary text-background hover:scale-[1.02]"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-5 h-5" /> Pridané
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" /> Pridať do košíka
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={open}
                    className="font-mono text-[10px] uppercase tracking-widest border border-border px-5 py-4 hover:bg-foreground hover:text-background transition-all"
                  >
                    Košík
                  </button>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Doprava 2-4 dni. Platby zatiaľ neaktívne.
                </p>
              </div>
            </div>
          </div>

          {/* Related */}
          <div className="mt-24 pt-12 border-t border-border">
            <h2 className="font-display text-2xl sm:text-3xl uppercase italic mb-8">
              Tiež brutálne
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/store/$productSlug"
                  params={{ productSlug: p.slug }}
                  className="group bg-background flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-card">
                    <img
                      src={p.images[0].src}
                      alt={p.images[0].alt}
                      className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4 border-t border-border flex justify-between items-end">
                    <h3 className="font-display text-xl uppercase leading-none truncate">
                      {p.name}
                    </h3>
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
