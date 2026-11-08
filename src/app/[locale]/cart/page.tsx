import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartView } from "@/components/CartView";
import type { Locale } from "@/data/products";
import { getEurRate } from "@/lib/rate";
import { getStock } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: t("title") };
}

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");
  const stock = await getStock();
  const eurRate = await getEurRate();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="font-display text-6xl">{t("title")}</h1>
      <CartView locale={locale as Locale} eurRate={eurRate} stock={stock} />
    </div>
  );
}
