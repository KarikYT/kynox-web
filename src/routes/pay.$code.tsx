import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getOrderByCode } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/products";
import { SiteNav } from "@/components/site-nav";
import { Loader2, Copy, Check, CreditCard } from "lucide-react";

export const Route = createFileRoute("/pay/$code")({
  component: PayPage,
});

const IBAN = "SK9402000000004746544651";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors ml-2"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? "Skopírované" : "Kopírovať"}
    </button>
  );
}

function PayPage() {
  const { code } = Route.useParams();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    setLoaded(true);
    getOrderByCode({ data: { code } })
      .then((res) => setOrder(res))
      .finally(() => setLoading(false));
  }

  const variableSymbol = code.replace(/[^0-9]/g, "");
  const total = order ? Number(order.order.total) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav active="store" />

      <main className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 border border-border mb-6">
              <CreditCard className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-5xl sm:text-6xl uppercase italic tracking-tighter mb-3">
              Platba
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Objednávka bola prijatá
            </p>
          </div>

          {/* Order code badge */}
          <div className="border border-border bg-card px-5 py-4 mb-6 text-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
              Kód objednávky
            </span>
            <span className="font-display text-3xl uppercase tracking-widest text-primary">
              {code}
            </span>
          </div>

          {/* Card not available notice */}
          <div className="border border-yellow-400/40 bg-yellow-400/5 px-5 py-4 mb-8">
            <p className="font-mono text-xs text-yellow-300 leading-relaxed">
              ⚠️ Kartou sa ešte nedá platiť. Pošlite nám platbu na bankový účet prevodom.
            </p>
          </div>

          {/* Bank transfer details */}
          <div className="border border-border bg-card divide-y divide-border mb-8">
            <div className="px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                IBAN
              </span>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <code className="font-mono text-base sm:text-lg tracking-widest font-bold break-all">
                  {IBAN}
                </code>
                <CopyButton text={IBAN} />
              </div>
            </div>

            {loading ? (
              <div className="px-5 py-4 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-mono text-xs">Načítavam...</span>
              </div>
            ) : total !== null ? (
              <div className="px-5 py-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                  Suma na úhradu
                </span>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-display text-4xl uppercase tabular-nums text-primary">
                    {formatPrice(total)}
                  </span>
                  <CopyButton text={String(total)} />
                </div>
              </div>
            ) : null}

            <div className="px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                Variabilný symbol
              </span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm tracking-widest font-bold">
                  {variableSymbol || code}
                </code>
                <CopyButton text={variableSymbol || code} />
              </div>
            </div>

            <div className="px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                Správa pre prijímateľa
              </span>
              <code className="font-mono text-sm">Objednávka {code}</code>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3 text-center mb-10">
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              Po prijatí platby vás budeme kontaktovať e-mailom. Stav objednávky môžete sledovať
              kliknutím na odkaz v potvrdzovacom e-maile.
            </p>
            <p className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              Ďakujeme za nákup v KYNOX
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/store"
              className="flex-1 text-center font-mono text-[10px] uppercase tracking-widest border border-border px-5 py-3 hover:bg-foreground hover:text-background transition-all"
            >
              Späť do storu
            </Link>
            <Link
              to="/order/$code"
              params={{ code }}
              className="flex-1 text-center font-mono text-[10px] uppercase tracking-widest border border-primary text-primary px-5 py-3 hover:bg-primary hover:text-background transition-all"
            >
              Sledovať objednávku
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
