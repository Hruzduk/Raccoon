import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProduct, products, stockKey, type Locale } from "@/data/products";
import { shop } from "@/data/shop";
import { AddToCart } from "@/components/AddToCart";
import { SilkField } from "@/components/SilkField";
import { Link } from "@/i18n/navigation";
import { getEurRate } from "@/lib/rate";
import { getStock } from "@/lib/store";

export function generateStaticParams() {
  return products.flatMap((product) =>
    ["uk", "en", "fr"].map((locale) => ({ locale, slug: product.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return { title: product.name[locale as Locale] };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = getProduct(slug);
  if (!product) notFound();
  const t = await getTranslations("product");
  const silk = await getTranslations("silk");
  const stock = await getStock();
  const eurRate = await getEurRate();
  const language = locale as Locale;

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2">
      <div className="aspect-[4/5] bg-ivory">
        <SilkField colors={product.colors} image={product.images[0]} alt={product.name[language]} />
      </div>
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-gold">{silk(product.silk)}</p>
        <h1 className="mt-3 font-display text-6xl leading-none">{product.name[language]}</h1>
        <p className="mt-6 max-w-md text-lg leading-8">{product.description[language]}</p>
        <ul className="mt-6 space-y-1 text-sm text-muted">
          <li>{t("silk")}</li>
          <li>{t("hem")}</li>
          {product.freehand ? <li>{t("freehand")}</li> : null}
          {product.bothSides ? <li>{t("bothSides")}</li> : null}
          <li>{t("unique")}</li>
        </ul>
        <div className="mt-8">
          <AddToCart
            slug={product.slug}
            locale={locale}
            eurRate={eurRate}
            sizes={product.sizes.map((item) => ({
              ...item,
              stock: stock[stockKey(product.slug, item.id)] ?? 0,
            }))}
          />
        </div>
        <p className="mt-8 text-sm">
          <a href={shop.instagram} className="underline" target="_blank" rel="noreferrer">
            {t("photos")}
          </a>
        </p>
        <p className="mt-3 text-sm">
          <Link href="/care" className="underline">
            {t("care")}
          </Link>
        </p>
      </div>
    </article>
  );
}
