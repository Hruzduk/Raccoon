import { getTranslations, setRequestLocale } from "next-intl/server";
import { products, type Locale } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { SilkField } from "@/components/SilkField";
import { Link } from "@/i18n/navigation";
import { getEurRate } from "@/lib/rate";
import { getStock } from "@/lib/store";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const stock = await getStock();
  const eurRate = await getEurRate();
  const featured = products.slice(0, 4);
  const hero = products[0];
  const second = products[2];

  return (
    <>
      <p className="border-b border-line px-5 py-3 text-center text-[11px] tracking-[0.18em] uppercase text-muted">
        {t("bar")}
      </p>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase text-gold">{t("eyebrow")}</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.92] md:text-7xl">{t("title")}</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-muted">{t("lead")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog" className="btn">
              {t("catalog")}
            </Link>
            <Link href="/about" className="btn btn-ghost">
              {t("about")}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-[3/4]">
            <SilkField colors={hero.colors} alt={hero.name[locale as Locale]} />
          </div>
          <div className="mt-10 aspect-[3/4]">
            <SilkField colors={second.colors} alt={second.name[locale as Locale]} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-5xl">{t("featured")}</h2>
          <Link href="/catalog" className="text-sm underline">
            {t("all")}
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              locale={locale as Locale}
              eurRate={eurRate}
              stock={stock}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-5">
        <h2 className="font-display text-5xl">{t("processTitle")}</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {(["1", "2", "3", "4"] as const).map((step) => (
            <li key={step} className="border-t border-line pt-4">
              <p className="text-xs tracking-[0.16em] text-gold">0{step}</p>
              <h3 className="mt-3 font-display text-3xl">{t(`step${step}t`)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{t(`step${step}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl gap-6 bg-plum px-8 py-12 text-paper md:grid-cols-[1fr_1.4fr] md:px-12">
        <h2 className="font-display text-5xl leading-none">{t("noteTitle")}</h2>
        <p className="text-lg leading-8">{t("note")}</p>
      </section>
    </>
  );
}
