import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { products, formatPrice } from "@/lib/products";

export function CartDrawer() {
  const { isOpen, close, items, setQty, remove, clear } = useCart();
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const rows = items
    .map((i) => {
      const p = products.find((pr) => pr.id === i.id);
      if (!p) return null;
      return { ...i, product: p };
    })
    .filter(Boolean) as Array<{ id: number; qty: number; product: (typeof products)[number] }>;

  const total = rows.reduce((s, r) => s + r.product.price * r.qty, 0);

  function handleCheckout() {
    setCheckoutMsg("Platby zatiaľ nie sú aktívne. Coming soon.");
    setTimeout(() => setCheckoutMsg(null), 3500);
  }

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={close} />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border flex flex-col shadow-2xl transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-border">
          <div>
            <span className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] block">
              Tvoj výber
            </span>
            <h2 className="font-display text-2xl sm:text-3xl uppercase italic tracking-tighter">
              Košík
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Zavrieť"
            className="grid place-items-center w-10 h-10 border border-border hover:bg-foreground hover:text-background transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 text-center gap-4">
              <div className="font-display text-5xl uppercase italic text-muted-foreground">
                Prázdne.
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Žiadna výbava, žiadna brutalita.
              </p>
              <Link
                to="/store"
                onClick={close}
                className="mt-2 inline-block font-mono text-[10px] uppercase tracking-widest border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-background transition-all"
              >
                Do storu
              </Link>
            </div>
          ) : (
            <ul>
              {rows.map((r, idx) => (
                <li
                  key={r.id}
                  className="flex gap-4 p-4 sm:p-5 border-b border-border animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <Link
                    to="/store/$productSlug"
                    params={{ productSlug: r.product.slug }}
                    onClick={close}
                    className="shrink-0 w-20 h-24 overflow-hidden bg-card"
                  >
                    <img
                      src={r.product.images[0].src}
                      alt={r.product.images[0].alt}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      to="/store/$productSlug"
                      params={{ productSlug: r.product.slug }}
                      onClick={close}
                      className="font-display text-lg uppercase leading-none truncate hover:text-primary transition-colors"
                    >
                      {r.product.name}
                    </Link>
                    <span className="font-mono text-[10px] text-primary uppercase tracking-widest mt-1">
                      {r.product.tags.join(" / ")}
                    </span>
                    <div className="flex-1" />
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <QtyControl
                        value={r.qty}
                        onChange={(q) => setQty(r.id, q)}
                        onRemove={() => remove(r.id)}
                      />
                      <span className="font-mono text-sm tabular-nums">
                        {formatPrice(r.product.price * r.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {rows.length > 0 && (
          <div className="border-t border-border p-5 sm:p-6 space-y-4">
            <div className="flex items-end justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Spolu
              </span>
              <span className="font-display text-3xl uppercase tabular-nums">
                {formatPrice(total)}
              </span>
            </div>

            {checkoutMsg && (
              <div className="bg-primary/10 border border-primary/40 text-primary font-mono text-[10px] uppercase tracking-widest px-3 py-2 animate-fade-up">
                {checkoutMsg}
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-primary text-background font-display text-xl sm:text-2xl uppercase py-4 hover:scale-[1.02] active:scale-95 transition-transform"
            >
              Zaplatiť
            </button>
            <button
              type="button"
              onClick={clear}
              className="w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3 h-3" /> Vyprázdniť košík
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export function QtyControl({
  value,
  onChange,
  onRemove,
  size = "sm",
}: {
  value: number;
  onChange: (q: number) => void;
  onRemove?: () => void;
  size?: "sm" | "md";
}) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => setLocal(String(value)), [value]);

  const dims =
    size === "md"
      ? { btn: "w-10 h-10", input: "w-14 h-10 text-base" }
      : { btn: "w-8 h-8", input: "w-10 h-8 text-xs" };

  return (
    <div className="inline-flex items-center border border-border">
      <button
        type="button"
        aria-label="Znížiť"
        onClick={() => {
          if (value <= 1 && onRemove) return onRemove();
          onChange(value - 1);
        }}
        className={`${dims.btn} grid place-items-center hover:bg-foreground hover:text-background transition-all active:scale-90`}
      >
        <Minus className="w-3 h-3" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={local}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "");
          setLocal(v);
        }}
        onBlur={() => {
          const n = parseInt(local, 10);
          if (!Number.isFinite(n) || n <= 0) {
            if (onRemove) onRemove();
            else onChange(1);
          } else {
            onChange(Math.min(n, 99));
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className={`${dims.input} text-center font-mono tabular-nums bg-background border-x border-border focus:outline-none focus:bg-card`}
      />
      <button
        type="button"
        aria-label="Pridať"
        onClick={() => onChange(Math.min(value + 1, 99))}
        className={`${dims.btn} grid place-items-center hover:bg-foreground hover:text-background transition-all active:scale-90`}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}
