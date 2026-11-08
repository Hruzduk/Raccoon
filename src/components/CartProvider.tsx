"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  slug: string;
  sizeId: string;
  qty: number;
};

type CartValue = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (line: CartLine, max: number) => void;
  setQty: (slug: string, sizeId: string, qty: number, max: number) => void;
  remove: (slug: string, sizeId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = "shovkana-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      /* keep an empty bag */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      ready,
      add: (line, max) => {
        setLines((current) => {
          const index = current.findIndex(
            (item) => item.slug === line.slug && item.sizeId === line.sizeId,
          );
          if (index === -1) {
            return [...current, { ...line, qty: Math.min(Math.max(1, line.qty), max) }];
          }
          const next = [...current];
          next[index] = {
            ...next[index],
            qty: Math.min(max, next[index].qty + line.qty),
          };
          return next;
        });
      },
      setQty: (slug, sizeId, qty, max) => {
        setLines((current) =>
          current.map((item) =>
            item.slug === slug && item.sizeId === sizeId
              ? { ...item, qty: Math.max(1, Math.min(max, qty)) }
              : item,
          ),
        );
      },
      remove: (slug, sizeId) => {
        setLines((current) =>
          current.filter((item) => !(item.slug === slug && item.sizeId === sizeId)),
        );
      },
      clear: () => setLines([]),
    }),
    [lines, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartProvider is missing");
  return value;
}
