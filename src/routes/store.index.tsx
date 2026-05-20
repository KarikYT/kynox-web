import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useReveal } from "@/hooks/use-reveal";
import { fetchAllProducts, formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/context/cart-context";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/store/")({
  component: StorePage,
  head: () => ({
    meta: [
      { title: "KYNOX Store — Výbava pre tých, čo nezastavujú" },
      {
        name: "description",
        content: "KYNOX Store. Obuv, oblečenie a výbava staraná pre maximálny výkon.",
      },
    ],
  }),
});

const sportCatalog: Record<string, string[]> = {
  "Všetko":    [],
  "Futbal":    ["Kopačky", "Obuv", "Hydratácia", "Dresy", "Lopty", "Chrániče"],
  "Hokej":     ["Hokejky", "Pásky", "Korčule", "Helmy", "Rukavice", "Chrániče"],
  "Tenis":     ["Rakety", "Loptičky", "Obuv", "Oblečenie"],
  "F1":        ["Helmy", "Rukavice", "Oblečenie", "Doplnky"],
  "Box":       ["Boxerské rukavice", "Chrániče", "Zubný chránič", "Vrecia", "Oblečenie"],
  "Baseball":  ["Pálky", "Lopty", "Helmy", "Rukavice"],
  "Ping pong": ["Pálky", "Loptičky", "Stoly", "Siete"],
  "Volejbal":  ["Lopty", "Obuv", "Sieťky", "Chrániče kolien"],
  "Florbal":   ["Hokejky", "Lopty", "Brankárska výstroj", "Oblečenie"],
  "Golf":      ["Palice", "Loptičky", "Vozíky", "Oblečenie"],
  "Ostatné":   ["Protein", "Výživové doplnky", "Home Gym", "Čínky"]
};

function StorePage() {
  useReveal();
  const { add } = useCart();
  const [activeSport, setActiveSport] = useState("Všetko");
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
  });

  function selectSport(sport: string) {
    setActiveSport(sport);
    setActiveSub(null);
  }

  const subCategories = activeSport !== "Všetko" ? sportCatalog[activeSport] : [];

  const visible = (products as Product[]).filter((p) => {
    if (activeSport === "Všetko") return true;
    if (!p.tags.includes(activeSport)) return false;
    if (activeSub) return p.tags.includes(activeSub);
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SiteNav active="store" />

      <header className="pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12 border-b border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-32 hidden lg:block" />
        <div className="max-w-7xl mx-auto relative">
          <span className="font-mono text-[10px] sm:text-xs text-primary uppercase tracking-[0.3em] mb-4 sm:mb-6 block animate-fade-up">
            Výbava — drop 026
          </span>
          <h1 className="font-display text-[clamp(3rem,12vw,11rem)] uppercase italic leading-[0.85] -tracking-[0.04em] mb-6 sm:mb-8 break-words animate-slide-up">
            Výbava<br />na maximálny výkon.
          </h1>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 animate-fade-up [animation-delay:200ms]">
            <p className="max-w-lg text-base sm:text-lg text-foreground/80">
              Bez logiek značky. Bez výplne. Iba veci, ktoré prežijú, keď to nezvládneš ty.
            </p>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
              [ {visible.length} kusov dostupných ]
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[72px] sm:top-[88px] z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-3 pb-2 flex gap-2 sm:gap-3 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
          {Object.keys(sportCatalog).map((sport) => {
            const active = sport === activeSport;
            return (
              <button
                key={sport}
                type="button"
                onClick={() => selectSport(sport)}
                className={`shrink-0 px-4 sm:px-5 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest border transition-all duration-300 ${
                  active
                    ? "bg-primary text-background border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {sport}
              </button>
            );
          })}
        </div>

        {subCategories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-3 flex gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] border-t border-border/40 pt-2">
            <button
              type="button"
              onClick={() => setActiveSub(null)}
              className={`shrink-0 px-3 py-1 font-mono text-[9px] uppercase tracking-widest border transition-all duration-200 ${
                activeSub === null
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Všetko
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setActiveSub(sub)}
                className={`shrink-0 px-3 py-1 font-mono text-[9px] uppercase tracking-widest border transition-all duration-200 ${
                  activeSub === sub
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="py-12 sm:py-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-32 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Načítavam…
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-32 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Žiadne produkty v tejto kategórii
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
              {visible.map((p, idx) => {
                const img = p.images[0];
                return (
                  <article
                    key={p.id}
                    className="bg-background group relative flex flex-col animate-fade-up hover-lift"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <Link
                      to="/store/$productSlug"
                      params={{ productSlug: p.slug }}
                      className="relative aspect-square overflow-hidden bg-card block"
                    >
                      {img ? (
                        <img
                          src={img.src}
                          alt={img.alt}
                          width={700}
                          height={700}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-muted-foreground font-mono text-xs">
                          žiadny obrázok
                        </div>
                      )}
                      {p.badge && (
                        <span className="absolute top-4 left-4 bg-primary text-background font-mono text-[10px] uppercase tracking-widest px-2 py-1">
                          {p.badge}
                        </span>
                      )}
                    </Link>
                    <div className="p-5 sm:p-6 flex items-end justify-between gap-4 border-t border-border">
                      <Link
                        to="/store/$productSlug"
                        params={{ productSlug: p.slug }}
                        className="min-w-0 flex-1"
                      >
                        <div className="flex gap-2 flex-wrap mb-2">
                          {p.tags.map((t) => (
                            <span key={t} className="font-mono text-[10px] text-primary uppercase tracking-widest">
                              {t}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-display text-2xl sm:text-3xl uppercase leading-none mb-1 truncate">
                          {p.name}
                        </h3>
                        <p className="font-mono text-xs sm:text-sm text-muted-foreground">
                          {formatPrice(p.price)}
                        </p>
                      </Link>
                      {p.sizes.length === 0 && p.colors.length === 0 && img && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            add({
                              productId: p.id,
                              slug: p.slug,
                              name: p.name,
                              price: p.price,
                              imageUrl: img.src,
                            });
                          }}
                          aria-label={`Pridať ${p.name} do košíka`}
                          className="shrink-0 grid place-items-center w-10 h-10 border border-primary text-primary hover:bg-primary hover:text-background transition-all active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <div>
            <div className="font-display text-lg sm:text-xl uppercase tracking-tighter text-muted-foreground">
              KYNOX © 2026 — Athletic Lab
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mt-1">
              Made by PiCore Industries
            </div>
          </div>
          <div className="flex gap-6 sm:gap-12 font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Súkromie</a>
            <a href="#" className="hover:text-primary transition-colors">Podmienky</a>
            <a href="#" className="hover:text-primary transition-colors">Lab</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
