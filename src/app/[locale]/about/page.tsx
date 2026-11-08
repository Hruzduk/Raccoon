import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { shop } from "@/data/shop";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-6xl">{t("title")}</h1>
      <p className="mt-6 text-lg leading-8">{t("lead")}</p>
      <h2 className="mt-12 font-display text-4xl">{t("artist")}</h2>
      <p className="mt-4 leading-7 text-muted">{t("artistText")}</p>
      <p className="mt-3">
        <a href={shop.artistInstagram} className="underline" target="_blank" rel="noreferrer">
          @anna_rook_art
        </a>
      </p>
      <h2 className="mt-12 font-display text-4xl">{t("repeatTitle")}</h2>
      <p className="mt-4 leading-7">{t("repeat")}</p>
      <h2 className="mt-12 font-display text-4xl">{t("whereTitle")}</h2>
      <p className="mt-4 leading-7">{t("where")}</p>
      <p className="mt-4 leading-7 text-muted">{t("twilly")}</p>
    </article>
  );
}
