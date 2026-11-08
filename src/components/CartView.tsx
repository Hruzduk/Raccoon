"use client";

import { useTranslations } from "next-intl";
import { formatSize, getProduct, stockKey } from "@/data/products";
import type { Locale } from "@/data/products";
import { Link } from "@/i18n/navigation";
import { useCart } from "./CartProvider";
import { Money } from "./Money";

export function CartView({
  locale,
  eurRate,
  stock,
}: {
  locale: Locale;
  eurRate: number | null;
  stock: Record<string, number>;
}) {
  const t = useTranslations("cart");
  const productText = useTranslations("product");
  const cart = useCart();
  if (!cart.ready) return null;
  const rows = cart.lines.flatMap((line) => {
    const product = getProduct(line.slug);
    const size = product?.sizes.find((item) => item.id === line.sizeId);
    if (!product || !size) return [];
    return [{ line, product, size, max: stock[stockKey(product.slug, size.id)] ?? 0 }];
  });
  const goods = rows.reduce((sum, row) => sum + row.size.priceUah * row.line.qty, 0);

  if (rows.length === 0) {
    return (
      <div className="mt-10">
        <p className="text-muted">{t("empty")}</p>
        <Link href="/catalog" className="btn mt-6">
          {t("browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_.8fr]">
      <ul className="divide-y divide-line border-y border-line">
        {rows.map(({ line, product, size, max }) => (
          <li key={`${line.slug}-${line.sizeId}`} className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div>
              <Link href={`/product/${product.slug}`} className="font-display text-3xl leading-none">
                {product.name[locale]}
              </Link>
              <p className="mt-2 text-sm text-muted">
                {formatSize(size.widthCm, size.heightCm)} {productText("cm")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-muted">
                {t("qty")}
                <input
                  className="ml-2 w-16 border border-line bg-white px-2 py-2 text-center tabular-nums"
                  type="number"
                  min={1}
                  max={Math.max(1, max)}
                  value={line.qty}
                  onChange={(event) =>
                    cart.setQty(line.slug, line.sizeId, Number(event.target.value), Math.max(1, max))
                  }
                />
              </label>
              <p className="min-w-28 text-right text-sm">
                <Money uah={size.priceUah * line.qty} locale={locale} eurRate={eurRate} />
              </p>
              <button
                type="button"
                className="text-sm text-muted underline"
                onClick={() => cart.remove(line.slug, line.sizeId)}
              >
                {t("remove")}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit border border-line bg-ivory p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span>{t("goods")}</span>
          <Money uah={goods} locale={locale} eurRate={eurRate} />
        </div>
        <Link href="/checkout" className="btn mt-6 w-full">
          {t("checkout")}
        </Link>
      </aside>
    </div>
  );
}
