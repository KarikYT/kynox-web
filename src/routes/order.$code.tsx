import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getOrderByCode } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/products";
import { SiteNav } from "@/components/site-nav";
import { Loader2, Package, CheckCircle2, Truck, Clock, CircleDollarSign, XCircle } from "lucide-react";

export const Route = createFileRoute("/order/$code")({
  component: OrderPage,
});

type OrderStatus = "caka_na_platbu" | "zaplatene" | "spracovava_sa" | "poslane" | "dorucene";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.FC<any> }[] = [
  { key: "caka_na_platbu", label: "Čaká na platbu", icon: Clock },
  { key: "zaplatene", label: "Zaplatené", icon: CircleDollarSign },
  { key: "spracovava_sa", label: "Spracováva sa", icon: Package },
  { key: "poslane", label: "Posláne", icon: Truck },
  { key: "dorucene", label: "Doručené", icon: CheckCircle2 },
];

function getStepIndex(status: string): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function OrderPage() {
  const { code } = Route.useParams();
  const [data, setData] = useState<{ order: any; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    setLoaded(true);
    getOrderByCode({ data: { code } })
      .then((res) => {
        if (!res) setNotFound(true);
        else setData(res as any);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav active="store" />

      <main className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          {loading && (
            <div className="py-24 flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="font-mono text-[10px] uppercase tracking-widest">Načítavam...</span>
            </div>
          )}

          {!loading && notFound && (
            <div className="py-24 flex flex-col items-center gap-6 text-center">
              <XCircle className="w-12 h-12 text-destructive" />
              <h1 className="font-display text-4xl uppercase italic">Objednávka nenájdená</h1>
              <p className="font-mono text-xs text-muted-foreground">
                Skontrolujte kód objednávky alebo link z e-mailu.
              </p>
              <Link
                to="/store"
                className="font-mono text-[10px] uppercase tracking-widest border border-border px-5 py-2.5 hover:bg-foreground hover:text-background transition-all"
              >
                Späť do storu
              </Link>
            </div>
          )}

          {!loading && data && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-display text-5xl sm:text-6xl uppercase italic tracking-tighter mb-2">
                  Objednávka
                </h1>
                <span className="font-mono text-xl tracking-widest text-primary font-bold">
                  {data.order.code}
                </span>
              </div>

              {/* Status timeline */}
              <div className="border border-border bg-card px-5 py-6 mb-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-5">
                  Stav objednávky
                </span>
                <div className="relative">
                  {/* progress line */}
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />
                  <div className="space-y-5">
                    {STATUS_STEPS.map((step, i) => {
                      const currentIdx = getStepIndex(data.order.status);
                      const done = i <= currentIdx;
                      const active = i === currentIdx;
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="relative flex items-center gap-4 pl-2">
                          <div
                            className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              active
                                ? "border-primary bg-primary text-background scale-110"
                                : done
                                  ? "border-primary/60 bg-primary/20 text-primary"
                                  : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                          </div>
                          <span
                            className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                              active
                                ? "text-foreground font-bold"
                                : done
                                  ? "text-foreground/70"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                            {active && (
                              <span className="ml-2 text-primary">← aktuálny stav</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border border-border bg-card mb-6">
                <div className="px-5 py-3 border-b border-border">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Objednané položky
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {data.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-start justify-between gap-4 px-5 py-3">
                      <div>
                        <p className="font-display text-base uppercase leading-tight">
                          {item.name_snapshot}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                          {[
                            item.color_name,
                            item.size ? `vel. ${item.size}` : null,
                            `×${item.qty}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <span className="font-mono text-sm tabular-nums shrink-0">
                        {formatPrice(Number(item.price_snapshot) * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Spolu
                  </span>
                  <span className="font-display text-2xl uppercase tabular-nums">
                    {formatPrice(Number(data.order.total))}
                  </span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="border border-border bg-card divide-y divide-border mb-8">
                <InfoRow label="E-mail" value={data.order.email} />
                <InfoRow label="Telefón" value={data.order.phone} />
                <InfoRow label="Adresa" value={data.order.address} />
                <InfoRow
                  label="Dátum objednávky"
                  value={new Date(data.order.created_at).toLocaleString("sk-SK")}
                />
              </div>

              {/* Payment reminder if pending */}
              {data.order.status === "caka_na_platbu" && (
                <div className="border border-yellow-400/40 bg-yellow-400/5 px-5 py-4 mb-8">
                  <p className="font-mono text-xs text-yellow-300 leading-relaxed mb-3">
                    ⏳ Objednávka čaká na platbu. Zašlite sumu na bankový účet:
                  </p>
                  <code className="font-mono text-sm font-bold block mb-1">SK9402000000004746544651</code>
                  <p className="font-mono text-[10px] text-yellow-300/70">
                    Variabilný symbol: {data.order.code.replace(/[^0-9]/g, "")}
                    {" · "}
                    Suma: {formatPrice(Number(data.order.total))}
                  </p>
                </div>
              )}

              <Link
                to="/store"
                className="block text-center font-mono text-[10px] uppercase tracking-widest border border-border px-5 py-3 hover:bg-foreground hover:text-background transition-all"
              >
                Späť do storu
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3 flex gap-4 items-start">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-32 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="font-mono text-xs break-words flex-1">{value}</span>
    </div>
  );
}
