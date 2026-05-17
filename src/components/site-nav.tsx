import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function SiteNav({ active }: { active?: "home" | "store" }) {
  const { count, open, lastAddedId } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const bump = lastAddedId !== null;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 mix-blend-difference px-4 sm:px-6 lg:px-12 py-5 sm:py-8 flex justify-between items-center">
        <Link to="/" className="font-display text-xl sm:text-2xl tracking-tighter uppercase">
          KYNOX
        </Link>

        <div className="hidden md:flex gap-6 lg:gap-10 text-xs font-bold uppercase tracking-widest">
          <Link
            to="/"
            className={active === "home" ? "text-primary" : "hover:text-primary transition-colors"}
          >
            Domov
          </Link>
          <Link
            to="/store"
            className={active === "store" ? "text-primary" : "hover:text-primary transition-colors"}
          >
            Store
          </Link>
          <a href="/#join" className="hover:text-primary transition-colors">
            Pridaj sa
          </a>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={open}
            aria-label="Otvoriť košík"
            className={`relative grid place-items-center w-10 h-10 border border-foreground hover:bg-foreground hover:text-background transition-all ${
              bump ? "animate-cart-bump" : ""
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 grid place-items-center bg-primary text-background font-mono text-[10px] font-bold">
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Zavrieť menu" : "Otvoriť menu"}
            className="md:hidden grid place-items-center w-10 h-10 border border-foreground hover:bg-foreground hover:text-background transition-all"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — rendered above cart (z-[55]) but below cart overlay (z-[60]) */}
      {menuOpen && (
        <div className="fixed inset-0 z-[55] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-md"
            onClick={() => setMenuOpen(false)}
          />
          {/* Links */}
          <div className="relative h-full flex flex-col items-center justify-center gap-10 font-display uppercase text-5xl">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="hover:text-primary transition-colors"
            >
              Domov
            </Link>
            <Link
              to="/store"
              onClick={() => setMenuOpen(false)}
              className="hover:text-primary transition-colors"
            >
              Store
            </Link>
            <a
              href="/#join"
              onClick={() => setMenuOpen(false)}
              className="hover:text-primary transition-colors"
            >
              Pridaj sa
            </a>
          </div>
        </div>
      )}
    </>
  );
}
