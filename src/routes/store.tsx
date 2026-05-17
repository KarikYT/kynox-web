import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import shoeImg from "@/assets/product-shoe.jpg";
import hoodieImg from "@/assets/product-hoodie.jpg";
import bottleImg from "@/assets/product-bottle.jpg";
import shirtImg from "@/assets/product-shirt.jpg";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/store")({
  component: StorePage,
  head: () => ({
    meta: [
      { title: "KYNOX Store — Výbava pre tých, čo nezastavujú" },
      {
        name: "description",
        content:
          "KYNOX Store. Obuv, oblečenie a výbava staraná pre maximálny výkon.",
      },
    ],
  }),
});

const products = [
  {
    id: 1,
    tag: "Obuv",
    name: "Vortex Runner 01",
    price: "189 €",
    img: shoeImg,
    alt: "KYNOX bežecká obuv Vortex Runner",
    badge: "Nové",
  },
  {
    id: 2,
    tag: "Vrchné vrstvy",
    name: "Phantom Hoodie",
    price: "139 €",
    img: hoodieImg,
    alt: "KYNOX čierna mikina Phantom",
    badge: null,
  },
  {
    id: 3,
    tag: "Hydratácia",
    name: "Iron Flask 750",
    price: "39 €",
    img: bottleImg,
    alt: "KYNOX čierna fľaša Iron Flask",
    badge: null,
  },
  {
    id: 4,
    tag: "Tréning",
    name: "Pulse Tech Tee",
    price: "59 €",
    img: shirtImg,
    alt: "KYNOX tréningové tričko Pulse Tech",
    badge: "Limit",
  },
  {
    id: 5,
    tag: "Obuv",
    name: "Vortex Runner 02",
    price: "199 €",
    img: shoeImg,
    alt: "KYNOX bežecká obuv Vortex Runner 02",
    badge: null,
  },
  {
    id: 6,
    tag: "Vrchné vrstvy",
    name: "Phantom Hoodie Pro",
    price: "169 €",
    img: hoodieImg,
    alt: "KYNOX mikina Phantom Pro",
    badge: "Pro",
  },
];

const categories = ["Všetko", "Obuv", "Vrchné vrstvy", "Tréning", "Hydratácia"];

function StorePage() {
  useReveal();
  const [activeCat, setActiveCat] = useState("Všetko");
  const [cart, setCart] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  function addToCart(id: number, name: string) {
    setCart((prev) => [...prev, id]);
    setToast(`${name} pridaný do košíka`);
    setTimeout(() => setToast(null), 2500);
  }

  const visible = products.filter(
    (p) => activeCat === "Všetko" || p.tag === activeCat,
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 mix-blend-difference px-4 sm:px-6 lg:px-12 py-5 sm:py-8 flex justify-between items-center">
        <Link to="/" className="font-display text-xl sm:text-2xl tracking-tighter uppercase">
          KYNOX
        </Link>
        <div className="hidden md:flex gap-6 lg:gap-10 text-xs font-bold uppercase tracking-widest">
          <Link to="/" className="hover:text-primary transition-colors">Domov</Link>
          <Link to="/store" className="text-primary">Store</Link>
          <a href="#join" className="hover:text-primary transition-colors">Pridaj sa</a>
        </div>
        <div className="flex items-center gap-4">
          {cart.length > 0 && (
            <span className="font-mono text-xs text-background bg-primary px-2 py-1">
              {cart.length}
            </span>
          )}
          <div className="w-8 sm:w-10 h-1 bg-foreground" />
        </div>
      </nav>

      {/* Hero header */}
      <header className="pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12 border-b border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-32 hidden lg:block" />
        <div className="max-w-7xl mx-auto relative">
          <span className="font-mono text-[10px] sm:text-xs text-primary uppercase tracking-[0.3em] mb-4 sm:mb-6 block animate-fade-up">
            Výbava — drop 026
          </span>
          <h1 className="font-display text-[clamp(3rem,12vw,11rem)] uppercase italic leading-[0.85] -tracking-[0.04em] mb-6 sm:mb-8 break-words animate-slide-up">
            Výbava<br />pre brutalitu.
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

      {/* Category filter */}
      <div className="sticky top-16 sm:top-20 z-40 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 flex gap-2 sm:gap-3 overflow-x-auto">
          {categories.map((c) => {
            const active = c === activeCat;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCat(c)}
                className={`shrink-0 px-4 sm:px-5 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest border transition-all duration-300 ${
                  active
                    ? "bg-primary text-background border-primary scale-105"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products grid */}
      <main className="py-12 sm:py-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div key={activeCat} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {visible.map((p, idx) => (
              <article
                key={p.id}
                className="bg-background group relative flex flex-col animate-fade-up hover-lift"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-card">
                  <img
                    src={p.img}
                    alt={p.alt}
                    width={800}
                    height={1024}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                  />
                  {p.badge && (
                    <span className="absolute top-4 left-4 bg-primary text-background font-mono text-[10px] uppercase tracking-widest px-2 py-1">
                      {p.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-5 sm:p-6 flex items-end justify-between gap-4 border-t border-border">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] text-primary uppercase tracking-widest block mb-2">
                      {p.tag}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl uppercase leading-none mb-1 truncate">
                      {p.name}
                    </h3>
                    <p className="font-mono text-xs sm:text-sm text-muted-foreground">
                      {p.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(p.id, p.name)}
                    className="shrink-0 font-mono text-[10px] uppercase tracking-widest border border-primary text-primary px-3 py-2 hover:bg-primary hover:text-background transition-all"
                  >
                    Pridať
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* CTA */}
      <section id="join" className="bg-primary py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <span className="font-mono text-[10px] sm:text-xs text-background uppercase tracking-[0.3em] mb-4 sm:mb-6 block">
            Store sa otvára čoskoro
          </span>
          <h2 className="font-display text-[clamp(2.5rem,9vw,8rem)] text-background leading-[0.9] uppercase mb-8 sm:mb-12 tracking-tighter italic">
            Buď prvý.<br />Buď pripravený.
          </h2>
          <Link
            to="/"
            className="inline-block bg-background text-foreground font-display text-xl sm:text-3xl px-8 sm:px-16 py-5 sm:py-7 uppercase hover:scale-105 transition-transform"
          >
            Späť do labu
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display text-lg sm:text-xl uppercase tracking-tighter text-muted-foreground">
            KYNOX © 2026 — Athletic Lab
          </div>
          <div className="flex gap-6 sm:gap-12 font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
            <Link to="/" className="hover:text-primary transition-colors">Domov</Link>
            <a href="#" className="hover:text-primary transition-colors">Súkromie</a>
            <a href="#" className="hover:text-primary transition-colors">Podmienky</a>
          </div>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-background font-mono text-xs uppercase tracking-widest px-6 py-3 shadow-lg animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
