"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatSize } from "@/data/products";
import { useCart } from "./CartProvider";
import { Money } from "./Money";

type SizeChoice = {
  id: string;
  widthCm: number;
  heightCm: number;
  priceUah: number;
  stock: number;
};

export function AddToCart({
  slug,
  locale,
  eurRate,
  sizes,
}: {
  slug: string;
  locale: string;
  eurRate: number | null;
  sizes: SizeChoice[];
}) {
  const t = useTranslations("product");
  const cart = useCart();
  const firstAvailable = sizes.find((item) => item.stock > 0) ?? sizes[0];
  const [sizeId, setSizeId] = useState(firstAvailable.id);
  const [added, setAdded] = useState(false);
  const selected = sizes.find((item) => item.id === sizeId) ?? sizes[0];

  return (
    <div>
      <p className="text-xs tracking-[0.16em] uppercase text-muted">{t("size")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((item) => {
          const active = item.id === selected.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              disabled={item.stock < 1}
              onClick={() => setSizeId(item.id)}
              className={`min-h-11 border px-3 py-2 text-sm tabular-nums ${
                active ? "border-ink bg-ink text-paper" : "border-line bg-white"
              } disabled:opacity-40`}
            >
              {formatSize(item.widthCm, item.heightCm)} {t("cm")}
            </button>
          );
        })}
      </div>
      <p className="mt-6 font-display text-4xl">
        <Money uah={selected.priceUah} locale={locale} eurRate={eurRate} />
      </p>
      <button
        type="button"
        className="btn mt-6 w-full sm:w-auto"
        disabled={selected.stock < 1}
        onClick={() => {
          cart.add({ slug, sizeId: selected.id, qty: 1 }, selected.stock);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1600);
        }}
      >
        {selected.stock < 1 ? t("sold") : added ? t("added") : t("add")}
      </button>
    </div>
  );
}
