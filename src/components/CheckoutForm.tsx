"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatSize, getProduct, stockKey, type Locale } from "@/data/products";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "./CartProvider";
import { Money } from "./Money";

type ErrorCode = "stock" | "invalid" | "payment" | null;

export function CheckoutForm({
  locale,
  eurRate,
  stock,
  franceShippingUah,
}: {
  locale: Locale;
  eurRate: number | null;
  stock: Record<string, number>;
  franceShippingUah: number;
}) {
  const t = useTranslations("checkout");
  const cart = useCart();
  const router = useRouter();
  const [country, setCountry] = useState<"UA" | "FR">("UA");
  const [method, setMethod] = useState<"branch" | "courier">("branch");
  const [error, setError] = useState<ErrorCode>(null);
  const [pending, setPending] = useState(false);

  const rows = useMemo(
    () =>
      cart.lines.flatMap((line) => {
        const product = getProduct(line.slug);
        const size = product?.sizes.find((item) => item.id === line.sizeId);
        if (!product || !size) return [];
        return [{ line, product, size }];
      }),
    [cart.lines],
  );

  const goods = rows.reduce((sum, row) => sum + row.size.priceUah * row.line.qty, 0);
  const shipping = country === "FR" ? franceShippingUah : 0;
  const total = goods + shipping;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      locale,
      items: rows.map((row) => ({
        slug: row.line.slug,
        sizeId: row.line.sizeId,
        qty: row.line.qty,
      })),
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      phone: form.get("phone"),
      email: form.get("email"),
      country,
      method,
      city: form.get("city"),
      branch: form.get("branch"),
      street: form.get("street"),
      apartment: form.get("apartment"),
      postcode: form.get("postcode"),
      comment: form.get("comment"),
      consent: form.get("consent") === "on",
      company: form.get("company"),
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        orderId?: string;
        paymentUrl?: string | null;
        error?: ErrorCode;
      };
      if (!response.ok || !data.ok || !data.orderId) {
        setError(data.error ?? "invalid");
        setPending(false);
        return;
      }
      cart.clear();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      router.push(`/checkout/result?order=${encodeURIComponent(data.orderId)}`);
    } catch {
      setError("payment");
      setPending(false);
    }
  }

  if (!cart.ready) return null;

  if (rows.length === 0) {
    return <p className="mt-8 text-muted">{t("empty")}</p>;
  }

  const oversold = rows.some(
    (row) => row.line.qty > (stock[stockKey(row.product.slug, row.size.id)] ?? 0),
  );

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="font-display text-3xl">{t("contact")}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              {t("firstName")}
              <input name="firstName" required autoComplete="given-name" />
            </label>
            <label className="field">
              {t("lastName")}
              <input name="lastName" required autoComplete="family-name" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              {t("phone")}
              <input name="phone" required autoComplete="tel" inputMode="tel" />
            </label>
            <label className="field">
              {t("email")}
              <input name="email" type="email" required autoComplete="email" />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-3xl">{t("delivery")}</legend>
          <div className="flex flex-wrap gap-2">
            {(["UA", "FR"] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={country === code}
                onClick={() => setCountry(code)}
                className={`min-h-11 border px-4 py-2 text-sm ${country === code ? "border-ink bg-ink text-paper" : "border-line"}`}
              >
                {code === "UA" ? t("ukraine") : t("france")}
              </button>
            ))}
          </div>
          {country === "UA" ? (
            <div className="flex flex-wrap gap-2">
              {(["branch", "courier"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={method === code}
                  onClick={() => setMethod(code)}
                  className={`min-h-11 border px-4 py-2 text-sm ${method === code ? "border-ink bg-ink text-paper" : "border-line"}`}
                >
                  {code === "branch" ? t("branch") : t("courier")}
                </button>
              ))}
            </div>
          ) : null}
          <label className="field">
            {t("city")}
            <input name="city" required autoComplete="address-level2" />
          </label>
          {country === "UA" && method === "branch" ? (
            <label className="field">
              {t("warehouse")}
              <input name="branch" required placeholder="№ 12" />
            </label>
          ) : (
            <label className="field">
              {t("street")}
              <input name="street" required autoComplete="street-address" />
            </label>
          )}
          {country === "FR" ? (
            <label className="field">
              {t("postcode")}
              <input name="postcode" required autoComplete="postal-code" />
            </label>
          ) : null}
          {country === "UA" && method === "courier" ? (
            <label className="field">
              {t("apartment")}
              <input name="apartment" autoComplete="address-line2" />
            </label>
          ) : null}
          <label className="field">
            {t("comment")}
            <textarea name="comment" />
          </label>
        </fieldset>

        <div className="space-y-2 text-sm">
          <label className="flex items-start gap-3">
            <input name="consent" type="checkbox" required className="mt-1" />
            <span>{t("consent")}</span>
          </label>
          <Link href="/offer" className="underline">
            {t("termsLink")}
          </Link>
        </div>
        <label className="field absolute left-[-9999px]" aria-hidden="true">
          {t("company")}
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <aside className="h-fit border border-line bg-ivory p-6">
        <ul className="space-y-3 text-sm">
          {rows.map((row) => (
            <li key={`${row.line.slug}-${row.line.sizeId}`} className="flex justify-between gap-4">
              <span>
                {row.product.name[locale]}
                <span className="block text-muted">
                  {formatSize(row.size.widthCm, row.size.heightCm)} × {row.line.qty}
                </span>
              </span>
              <Money uah={row.size.priceUah * row.line.qty} locale={locale} eurRate={null} />
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <span>{t("goods")}</span>
            <Money uah={goods} locale={locale} eurRate={null} />
          </div>
          <div className="flex justify-between gap-4">
            <span>{t("shipping")}</span>
            <span className="text-right">
              {country === "UA" ? t("shippingUa") : <Money uah={shipping} locale={locale} eurRate={null} />}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4 pt-2 text-base">
            <span>{t("total")}</span>
            <span className="font-display text-3xl">
              <Money uah={total} locale={locale} eurRate={eurRate} />
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">{t("uahNote")}</p>
        {error ? (
          <p className="mt-4 text-sm text-plum" role="alert">
            {error === "stock" ? t("errorStock") : error === "payment" ? t("errorPayment") : t("errorInvalid")}
          </p>
        ) : null}
        {oversold ? (
          <p className="mt-4 text-sm text-plum" role="alert">
            {t("errorStock")}
          </p>
        ) : null}
        <button type="submit" className="btn mt-5 w-full" disabled={pending || oversold}>
          {pending ? t("paying") : t("pay")}
        </button>
      </aside>
    </form>
  );
}
