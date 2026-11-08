import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatSize, getProduct, type Locale } from "@/data/products";
import { Money } from "@/components/Money";
import { Link } from "@/i18n/navigation";
import { getInvoiceStatus } from "@/lib/mono";
import { getEurRate } from "@/lib/rate";
import { applyMonoStatus, getOrder, type OrderStatus } from "@/lib/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "result" });
  return { title: t("title", { id: "" }).trim() };
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order: orderId } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("result");
  const checkout = await getTranslations("checkout");
  const language = locale as Locale;

  if (!orderId) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p>{t("missing")}</p>
      </div>
    );
  }

  let order = await getOrder(orderId);
  if (order?.monoInvoiceId && (order.status === "pending_payment" || order.status === "paid")) {
    const status = await getInvoiceStatus(order.monoInvoiceId);
    if (status) {
      await applyMonoStatus(status);
      order = await getOrder(orderId);
    }
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p>{t("missing")}</p>
      </div>
    );
  }

  const eurRate = await getEurRate();
  const status = order.status as OrderStatus;

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-5xl">{t("title", { id: order.id })}</h1>
      <p className="mt-6 text-lg leading-8">{t(status)}</p>
      {status === "pending_payment" && order.paymentUrl ? (
        <a href={order.paymentUrl} className="btn mt-8">
          {t("payAgain")}
        </a>
      ) : null}
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {order.items.map((item) => {
          const product = getProduct(item.slug);
          const size = product?.sizes.find((entry) => entry.id === item.sizeId);
          return (
            <li key={`${item.slug}-${item.sizeId}`} className="flex justify-between gap-4 py-4 text-sm">
              <span>
                {product ? product.name[language] : item.nameUk}
                {size ? ` · ${formatSize(size.widthCm, size.heightCm)}` : null} × {item.qty}
              </span>
              <Money uah={item.priceUah * item.qty} locale={locale} eurRate={null} />
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex justify-between text-sm">
        <span>{checkout("shipping")}</span>
        <span>
          {order.shippingUah > 0 ? (
            <Money uah={order.shippingUah} locale={locale} eurRate={null} />
          ) : (
            checkout("shippingUa")
          )}
        </span>
      </div>
      <p className="mt-4 text-right font-display text-4xl">
        <Money uah={order.totalUah} locale={locale} eurRate={eurRate} />
      </p>
      <Link href="/catalog" className="mt-8 inline-block text-sm underline">
        {t("back")}
      </Link>
    </div>
  );
}
