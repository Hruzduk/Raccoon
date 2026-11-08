import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { products, type Locale, type Silk } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "@/i18n/navigation";
import { getEurRate } from "@/lib/rate";
import { getStock } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  return { title: t("title") };
}

const filters = [
  { id: "all", href: "/catalog" },
  { id: "satin", href: "/catalog?silk=satin" },
  { id: "twill", href: "/catalog?silk=twill" },
] as const;

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ silk?: string }>;
}) {
  const { locale } = await params;
  const { silk } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("catalog");
  const stock = await getStock();
  const eurRate = await getEurRate();
  const active: Silk | "all" = silk === "satin" || silk === "twill" ? silk : "all";
  const list = products.filter((product) => active === "all" || product.silk === active);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="font-display text-6xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.id}
            href={filter.href}
            className={`min-h-11 border px-4 py-2 text-sm ${
              active === filter.id ? "border-ink bg-ink text-paper" : "border-line"
            }`}
            aria-current={active === filter.id ? "true" : undefined}
          >
            {t(filter.id)}
          </Link>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="mt-10 text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              locale={locale as Locale}
              eurRate={eurRate}
              stock={stock}
            />
          ))}
        </div>
      )}
    </div>
  );
}
