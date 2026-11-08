import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { shop } from "@/data/shop";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "offer" });
  return { title: t("title") };
}

export default async function OfferPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("offer");
  const seller = shop.fopName || t("sellerPending");

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-6xl">{t("title")}</h1>
      <div className="mt-8 space-y-5 leading-7">
        <p>{t("seller", { name: seller })}</p>
        {shop.fopTaxId ? <p>{t("tax", { id: shop.fopTaxId })}</p> : null}
        <p>{t("goods")}</p>
        <p>{t("payment")}</p>
        <p>{t("delivery")}</p>
        <p>{t("returns")}</p>
        <p>{t("data")}</p>
      </div>
    </article>
  );
}
