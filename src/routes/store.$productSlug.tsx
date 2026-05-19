import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProductBySlug,
  fetchAllProducts,
  getImages,
  formatPrice,
  type Product,
} from "@/lib/products";
import { useCart } from "@/context/cart-context";
import { SiteNav } from "@/components/site-nav";
import { QtyControl } from "@/components/cart-drawer";

export const Route = createFileRoute("/store/$productSlug")({
  component: ProductPage,
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
  const { productSlug } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: () => fetchProductBySlug(productSlug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteNav active="store" />
        <div className="pt-32 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Načítavam…
        </div>
      </div>
    );
  }
  if (!product) throw notFound();
  return <ProductView product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const { add, open, items } = useCart();
  const hasVariants = product.colors.length > 0;
  const selectorMode = product.variantSelector ?? (hasVariants ? "color" : "none");
  const showSelector = hasVariants && selectorMode !== "none";

  const [activeColor, setActiveColor] = useState<string | undefined>(
    hasVariants
      ? product.colors.find((c) => c.images.length > 0)?.name ?? product.colors[0].name
      : undefined,
  );
  const [activeSize, setActiveSize] = useState<string | undefined>(
    product.sizes.length > 0 ? undefined : undefined,
  );

  const galleryImages = getImages(product, activeColor);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const inCart = items
    .filter((i) => i.productId === product.id)
    .reduce((s, i) => s + i.qty, 0);

  function selectColor(name: string) {
    setActiveColor(name);
    setActiveImg(0);
  }

  function handleAdd() {
    if (product.sizes.length > 0 && !activeSize) {
      setErrMsg("Vyber veľkosť");
      setTimeout(() => setErrMsg(null), 2000);
      return;
    }
    const img = galleryImages[0];
    if (!img) {
      setErrMsg("Produkt nemá obrázok");
      return;
    }
    const colorVariant = product.colors.find((c) => c.name === activeColor);
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl: img.src,
      colorName: activeColor ?? null,
      colorImageUrl: colorVariant?.images[0]?.src ?? null,
      size: activeSize ?? null,
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
  });
  const related = (allProducts as Product[]).filter((p) => p.id !== product.id).slice(0, 3);

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
              <div className="relative aspect-square bg-card overflow-hidden border border-border">
                {galleryImages[activeImg] ? (
                  <img
                    key={`${activeColor ?? "default"}-${activeImg}`}
                    src={galleryImages[activeImg].src}
                    alt={galleryImages[activeImg].alt}
                    className="w-full h-full object-cover animate-scale-in"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground font-mono text-xs">
                    žiadny obrázok
                  </div>
                )}
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-primary text-background font-mono text-[10px] uppercase tracking-widest px-2 py-1">
                    {product.badge}
                  </span>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                  {galleryImages.map((image, i) => (
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
                      <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
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

              <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-8 whitespace-pre-wrap">
                {product.description}
              </p>

              {product.details.length > 0 && (
                <ul className="grid grid-cols-2 gap-px bg-border border border-border mb-6">
                  {product.details.map((d) => (
                    <li
                      key={d}
                      className="bg-background p-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              )}

              {showSelector && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {selectorMode === "image" ? "Variant" : "Farba"}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/80 truncate ml-3">
                      {activeColor}
                    </span>
                  </div>

                  {selectorMode === "image" ? (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {product.colors.map((c) => {
                        const isActive = c.name === activeColor;
                        const thumb = c.images[0];
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => selectColor(c.name)}
                            className={`relative aspect-square overflow-hidden border-2 transition-all active:scale-95 ${
                              isActive
                                ? "border-primary scale-[1.03] shadow-lg"
                                : "border-border opacity-70 hover:opacity-100 hover:border-foreground"
                            }`}
                          >
                            {thumb ? (
                              <img
                                src={thumb.src}
                                alt={c.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span
                                className="absolute inset-0"
                                style={{ backgroundColor: c.hex }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => {
                        const isActive = c.name === activeColor;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => selectColor(c.name)}
                            className={`relative w-10 h-10 rounded-full border-2 transition-all active:scale-90 ${
                              isActive
                                ? "border-primary scale-110 shadow-lg"
                                : "border-border hover:border-foreground"
                            }`}
                            style={{ backgroundColor: c.hex }}
                            aria-label={c.name}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {product.sizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Veľkosť
                    </span>
                    {activeSize && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/80">
                        {activeSize}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => {
                      const isActive = s === activeSize;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setActiveSize(s)}
                          className={`min-w-12 px-3 h-10 border-2 font-mono text-xs uppercase tracking-widest transition-all active:scale-95 ${
                            isActive
                              ? "border-primary bg-primary text-background"
                              : "border-border hover:border-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Množstvo
                  </span>
                  <QtyControl value={qty} onChange={setQty} size="md" />
                </div>

                {errMsg && (
                  <div className="bg-destructive/10 border border-destructive/40 text-destructive font-mono text-[10px] uppercase tracking-widest px-3 py-2 animate-fade-up">
                    {errMsg}
                  </div>
                )}

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
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-24 pt-12 border-t border-border">
              <h2 className="font-display text-2xl sm:text-3xl uppercase italic mb-8">
                Tiež brutálne
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border">
                {related.map((p) => {
                  const img = p.images[0];
                  return (
                    <Link
                      key={p.id}
                      to="/store/$productSlug"
                      params={{ productSlug: p.slug }}
                      className="group bg-background flex flex-col"
                    >
                      <div className="relative aspect-square overflow-hidden bg-card">
                        {img && (
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        )}
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
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
