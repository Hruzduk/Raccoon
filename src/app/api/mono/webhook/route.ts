import { verifyMonoWebhook } from "@/lib/mono";
import { applyMonoStatus } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-sign");
  const valid = await verifyMonoWebhook(raw, signature).catch(() => false);
  if (!valid) return new Response("invalid signature", { status: 400 });

  let payload: {
    invoiceId?: string;
    status?: string;
    reference?: string;
    modifiedDate?: string;
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("invalid json", { status: 400 });
  }
  await applyMonoStatus(payload);
  return new Response("ok", { status: 200 });
}
