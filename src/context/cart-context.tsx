import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = { id: number; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (id: number, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  lastAddedId: number | null;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "kynox-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = (id: number, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { id, qty }];
    });
    setLastAddedId(id);
    setTimeout(() => setLastAddedId(null), 600);
  };

  const remove = (id: number) => setItems((prev) => prev.filter((p) => p.id !== id));

  const setQty = (id: number, qty: number) => {
    if (qty <= 0) return remove(id);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  };

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
        add,
        remove,
        setQty,
        clear,
        lastAddedId,
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
