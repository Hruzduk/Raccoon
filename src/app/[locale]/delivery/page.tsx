import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { shop } from "@/data/shop";
import { Link } from "@/i18n/navigation";
import { formatUah } from "@/lib/money";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deliveryPage" });
  return { title: t("title") };
}

export default async function DeliveryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("deliveryPage");

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-6xl">{t("title")}</h1>
      <h2 className="mt-10 font-display text-4xl">{t("uaT")}</h2>
      <p className="mt-4 leading-7">{t("ua")}</p>
      <h2 className="mt-10 font-display text-4xl">{t("frT")}</h2>
      <p className="mt-4 leading-7">{t("fr", { price: formatUah(shop.franceShippingUah, locale) })}</p>
      <h2 className="mt-10 font-display text-4xl">{t("payT")}</h2>
      <p className="mt-4 leading-7">{t("pay")}</p>
      <p className="mt-8">
        <Link href="/offer" className="underline">
          {t("terms")}
        </Link>
      </p>
    </article>
  );
}
