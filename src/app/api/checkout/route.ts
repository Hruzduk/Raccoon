import { NextResponse } from "next/server";
import { shop } from "@/data/shop";
import { getProduct, stockKey, type Locale } from "@/data/products";
import { uahToKop } from "@/lib/money";
import { canReceiveWebhook, createInvoice, monoToken, siteUrl } from "@/lib/mono";
import {
  attachInvoice,
  createOrderId,
  placeOrder,
  releaseOrder,
  type Delivery,
  type OrderItem,
} from "@/lib/store";

export const runtime = "nodejs";

type Payload = {
  locale?: string;
  items?: { slug?: string; sizeId?: string; qty?: number }[];
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  email?: unknown;
  country?: unknown;
  method?: unknown;
  city?: unknown;
  branch?: unknown;
  street?: unknown;
  apartment?: unknown;
  postcode?: unknown;
  comment?: unknown;
  consent?: unknown;
  company?: unknown;
};

function text(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function deliveryFrom(body: Payload): Delivery | null {
  const city = text(body.city, 80);
  if (body.country === "UA") {
    const method = body.method === "courier" ? "courier" : body.method === "branch" ? "branch" : null;
    if (!city || !method) return null;
    if (method === "branch") {
      const branch = text(body.branch, 120);
      if (!branch) return null;
      return { country: "UA", method, city, branch };
    }
    const street = text(body.street, 160);
    if (!street) return null;
    return { country: "UA", method, city, street, apartment: text(body.apartment, 40) };
  }
  if (body.country === "FR") {
    const street = text(body.street, 160);
    const postcode = text(body.postcode, 16);
    if (!city || !street || !postcode) return null;
    return { country: "FR", street, postcode, city };
  }
  return null;
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  if (text(body.company, 80)) {
    return NextResponse.json({ ok: true, orderId: "ignored" });
  }

  const locale: Locale = body.locale === "en" || body.locale === "fr" ? body.locale : "uk";
  const firstName = text(body.firstName, 80);
  const lastName = text(body.lastName, 80);
  const phone = text(body.phone, 30);
  const email = text(body.email, 120);
  const delivery = deliveryFrom(body);
  const phoneDigits = phone.replace(/\D/g, "");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!firstName || !lastName || phoneDigits.length < 8 || !emailOk || !delivery || body.consent !== true) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const merged = new Map<string, OrderItem>();
  for (const raw of body.items ?? []) {
    const product = raw.slug ? getProduct(raw.slug) : undefined;
    const size = product?.sizes.find((item) => item.id === raw.sizeId);
    const qty = Number(raw.qty);
    if (!product || !size || !Number.isInteger(qty) || qty < 1 || qty > 5) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }
    const key = stockKey(product.slug, size.id);
    const existing = merged.get(key);
    if (existing) {
      existing.qty += qty;
      if (existing.qty > 5) {
        return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
      }
    } else {
      merged.set(key, {
        slug: product.slug,
        sizeId: size.id,
        nameUk: `${product.name.uk}, ${size.widthCm}×${size.heightCm} см`,
        qty,
        priceUah: size.priceUah,
      });
    }
  }
  const items = [...merged.values()];

  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const goodsUah = items.reduce((sum, item) => sum + item.priceUah * item.qty, 0);
  const shippingUah = delivery.country === "FR" ? shop.franceShippingUah : 0;
  const orderId = createOrderId();
  const placed = await placeOrder({
    id: orderId,
    createdAt: new Date().toISOString(),
    locale,
    customer: { firstName, lastName, phone, email },
    delivery,
    comment: text(body.comment, 500),
    items,
    goodsUah,
    shippingUah,
    totalUah: goodsUah + shippingUah,
    status: monoToken() ? "pending_payment" : "awaiting_setup",
    stockHeld: true,
  });

  if ("error" in placed) {
    return NextResponse.json({ ok: false, error: "stock" }, { status: 409 });
  }

  if (!monoToken()) {
    return NextResponse.json({ ok: true, orderId, paymentUrl: null });
  }

  const basket = items.map((item) => ({
    name: item.nameUk,
    qty: item.qty,
    sum: uahToKop(item.priceUah),
    total: uahToKop(item.priceUah * item.qty),
    code: stockKey(item.slug, item.sizeId),
  }));
  if (shippingUah > 0) {
    basket.push({
      name: "Доставка до Франції",
      qty: 1,
      sum: uahToKop(shippingUah),
      total: uahToKop(shippingUah),
      code: "shipping-fr",
    });
  }

  const origin = siteUrl();
  try {
    const invoice = await createInvoice({
      amount: basket.reduce((sum, item) => sum + item.total, 0),
      reference: orderId,
      destination: `Замовлення ${orderId}, SHOVKANA`,
      redirectUrl: `${origin}/${locale}/checkout/result?order=${encodeURIComponent(orderId)}`,
      webHookUrl: canReceiveWebhook(origin) ? `${origin}/api/mono/webhook` : undefined,
      email,
      basket,
    });
    await attachInvoice(orderId, invoice.invoiceId, invoice.pageUrl);
    return NextResponse.json({ ok: true, orderId, paymentUrl: invoice.pageUrl });
  } catch (error) {
    console.error(error);
    await releaseOrder(orderId, "failed");
    return NextResponse.json({ ok: false, error: "payment" }, { status: 502 });
  }
}
