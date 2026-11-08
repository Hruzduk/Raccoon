import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "care" });
  return { title: t("title") };
}

const steps = ["wash", "dry", "iron", "keep"] as const;

export default async function CarePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("care");

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-6xl">{t("title")}</h1>
      <p className="mt-6 text-lg leading-8 text-muted">{t("lead")}</p>
      <div className="mt-10 space-y-8">
        {steps.map((step) => (
          <section key={step} className="border-t border-line pt-5">
            <h2 className="font-display text-4xl">{t(`${step}T`)}</h2>
            <p className="mt-3 leading-7">{t(step)}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
