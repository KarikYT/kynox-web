import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { createOrder } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/products";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

const inputCls =
  "w-full bg-card border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50";

function CartPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setErr("Musíte súhlasiť so zaslaním objednávky.");
      return;
    }
    if (items.length === 0) {
      setErr("Košík je prázdny.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const result = await createOrder({
        data: {
          email,
          phone,
          address,
          consent: true,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            colorName: i.colorName ?? null,
            colorImageUrl: i.colorImageUrl ?? null,
            size: i.size ?? null,
          })),
        },
      });
      clear();
      navigate({ to: "/pay/$code", params: { code: result.code } });
    } catch (e: any) {
      setErr(e.message ?? "Nepodarilo sa odoslať objednávku.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteNav active="store" />
        <div className="pt-40 flex flex-col items-center justify-center px-6 text-center gap-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          <h1 className="font-display text-5xl uppercase italic">Košík je prázdny</h1>
          <Link
            to="/store"
            className="font-mono text-[10px] uppercase tracking-widest border border-primary text-primary px-5 py-2.5 hover:bg-primary hover:text-background transition-all"
          >
            Do storu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav active="store" />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Späť do storu
          </Link>

          <h1 className="font-display text-5xl sm:text-6xl uppercase italic tracking-tighter mb-10">
            Objednávka
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-start">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">
                  E-mail <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.sk"
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">
                  Telefónne číslo <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+421 900 000 000"
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">
                  Doručovacia adresa <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={"Meno Priezvisko\nUlica č. 1\n080 01 Prešov"}
                  required
                  className={inputCls + " resize-none"}
                />
              </div>

              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-border bg-card peer-checked:bg-primary peer-checked:border-primary transition-all group-hover:border-primary flex items-center justify-center">
                    {consent && (
                      <svg className="w-3 h-3 text-background" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Súhlasím so zaslaním objednávky a beriem na vedomie, že mám povinnosť zaplatiť za
                  objednané položky.
                </span>
              </label>

              {err && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive font-mono text-xs px-4 py-3">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !consent}
                className="w-full bg-primary text-background font-display text-2xl uppercase py-5 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Objednať a zaplatiť
              </button>
            </form>

            {/* Order summary */}
            <div className="border border-border bg-card lg:sticky lg:top-28">
              <div className="px-5 py-4 border-b border-border">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Zhrnutie objednávky
                </span>
              </div>

              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-3 p-4">
                    <div className="w-14 h-16 shrink-0 overflow-hidden border border-border">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-base uppercase leading-tight truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.colorImageUrl && (
                          <img
                            src={item.colorImageUrl}
                            alt={item.colorName ?? ""}
                            className="w-4 h-4 object-cover border border-border"
                          />
                        )}
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground truncate">
                          {[item.colorName, item.size ? `Vel. ${item.size}` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          ×{item.qty}
                        </span>
                        <span className="font-mono text-sm tabular-nums">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-5 py-4 border-t border-border flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Celkom
                </span>
                <span className="font-display text-3xl uppercase tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
