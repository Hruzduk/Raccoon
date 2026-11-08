import { createVerify } from "crypto";

const API = "https://api.monobank.ua";

export type BasketItem = {
  name: string;
  qty: number;
  sum: number;
  total: number;
  code: string;
};

type PubkeyCache = { key: Buffer; at: number };
let pubkeyCache: PubkeyCache | null = null;

export function monoToken() {
  return process.env.MONO_TOKEN?.trim() || "";
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function canReceiveWebhook(url: string) {
  return url.startsWith("https://") && !url.includes("localhost");
}

export async function createInvoice(input: {
  amount: number;
  reference: string;
  destination: string;
  redirectUrl: string;
  webHookUrl?: string;
  email?: string;
  basket: BasketItem[];
}) {
  const token = monoToken();
  if (!token) throw new Error("MONO_TOKEN is empty");

  const response = await fetch(`${API}/api/merchant/invoice/create`, {
    method: "POST",
    headers: {
      "X-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      ccy: 980,
      merchantPaymInfo: {
        reference: input.reference,
        destination: input.destination,
        customerEmails: input.email ? [input.email] : [],
        basketOrder: input.basket.map((item) => ({
          name: item.name,
          qty: item.qty,
          sum: item.sum,
          total: item.total,
          unit: "шт.",
          code: item.code,
        })),
      },
      redirectUrl: input.redirectUrl,
      ...(input.webHookUrl ? { webHookUrl: input.webHookUrl } : {}),
      validity: 60 * 60,
      paymentType: "debit",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Mono invoice ${response.status}: ${details}`);
  }

  return (await response.json()) as { invoiceId: string; pageUrl: string };
}

export async function getInvoiceStatus(invoiceId: string) {
  const token = monoToken();
  if (!token) return null;
  const response = await fetch(
    `${API}/api/merchant/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`,
    { headers: { "X-Token": token }, cache: "no-store" },
  );
  if (!response.ok) return null;
  return (await response.json()) as {
    invoiceId: string;
    status: string;
    reference?: string;
    modifiedDate?: string;
  };
}

async function publicKey() {
  const token = monoToken();
  if (!token) throw new Error("MONO_TOKEN is empty");
  if (pubkeyCache && Date.now() - pubkeyCache.at < 60 * 60 * 1000) return pubkeyCache.key;

  const response = await fetch(`${API}/api/merchant/pubkey`, {
    headers: { "X-Token": token },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Mono pubkey failed");
  const data = (await response.json()) as { key: string };
  const key = Buffer.from(data.key, "base64");
  pubkeyCache = { key, at: Date.now() };
  return key;
}

export async function verifyMonoWebhook(rawBody: string, xSign: string | null) {
  if (!xSign || !monoToken()) return false;
  const verify = createVerify("SHA256");
  verify.update(rawBody);
  verify.end();
  return verify.verify(await publicKey(), Buffer.from(xSign, "base64"));
}
