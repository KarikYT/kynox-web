import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartLine = {
  /** stable line key = productId + color + size */
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  qty: number;
  colorName?: string | null;
  colorImageUrl?: string | null;
  size?: string | null;
};

type CartContextValue = {
  items: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (line: Omit<CartLine, "key" | "qty"> & { qty?: number }) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  lastAddedKey: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

const COOKIE_NAME = "kynox-cart-v2";

function readCookie(): CartLine[] {
  if (typeof document === "undefined") return [];
  const m = document.cookie.split("; ").find((row) => row.startsWith(COOKIE_NAME + "="));
  if (!m) return [];
  try {
    const v = decodeURIComponent(m.split("=")[1]);
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeCookie(items: CartLine[]) {
  if (typeof document === "undefined") return;
  const v = encodeURIComponent(JSON.stringify(items));
  // 60 days
  document.cookie = `${COOKIE_NAME}=${v}; Path=/; Max-Age=${60 * 60 * 24 * 60}; SameSite=Lax`;
}

function makeKey(productId: string, color?: string | null, size?: string | null): string {
  return `${productId}::${color ?? ""}::${size ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);

  useEffect(() => {
    setItems(readCookie());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeCookie(items);
  }, [items, hydrated]);

  const add: CartContextValue["add"] = (line) => {
    const qty = line.qty ?? 1;
    const key = makeKey(line.productId, line.colorName, line.size);
    setItems((prev) => {
      const found = prev.find((p) => p.key === key);
      if (found) return prev.map((p) => (p.key === key ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { ...line, qty, key }];
    });
    setLastAddedKey(key);
    setTimeout(() => setLastAddedKey(null), 600);
  };

  const remove = (key: string) => setItems((prev) => prev.filter((p) => p.key !== key));
  const setQty = (key: string, qty: number) => {
    if (qty <= 0) return remove(key);
    setItems((prev) => prev.map((p) => (p.key === key ? { ...p, qty } : p)));
  };
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
        add,
        remove,
        setQty,
        clear,
        lastAddedKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
