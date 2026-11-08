import { getTranslations } from "next-intl/server";
import { formatSize, lowestPrice, type Product } from "@/data/products";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/data/products";
import { formatEur, formatUah } from "@/lib/money";
import { SilkField } from "./SilkField";

export async function ProductCard({
  product,
  locale,
  eurRate,
  stock,
}: {
  product: Product;
  locale: Locale;
  eurRate: number | null;
  stock: Record<string, number>;
}) {
  const t = await getTranslations("catalog");
  const silk = await getTranslations("silk");
  const available = product.sizes.some((item) => (stock[`${product.slug}:${item.id}`] ?? 0) > 0);
  const several = product.sizes.length > 1;
  const price = several ? lowestPrice(product) : product.sizes[0].priceUah;
  const priceLabel = several ? t("from", { price: formatUah(price, locale) }) : formatUah(price, locale);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
        <SilkField
          colors={product.colors}
          image={product.images[0]}
          alt={product.name[locale]}
        />
        {available ? null : (
          <span className="absolute bottom-3 left-3 bg-paper/90 px-2 py-1 text-[11px] tracking-[0.14em] uppercase">
            {t("sold")}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-3xl leading-none">{product.name[locale]}</h2>
        <p className="text-right text-sm tabular-nums">
          {priceLabel}
          {eurRate ? <span className="mt-1 block text-muted">≈ {formatEur(price, eurRate, locale)}</span> : null}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted">
        {silk(product.silk)}
        {" · "}
        {product.sizes.map((item) => formatSize(item.widthCm, item.heightCm)).join(", ")}
      </p>
    </Link>
  );
}
