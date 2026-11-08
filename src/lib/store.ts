import { promises as fs } from "fs";
import path from "path";
import { products, stockKey, type Product } from "@/data/products";

export type Delivery =
  | {
      country: "UA";
      method: "branch" | "courier";
      city: string;
      branch?: string;
      street?: string;
      apartment?: string;
    }
  | {
      country: "FR";
      street: string;
      postcode: string;
      city: string;
    };

export type OrderItem = {
  slug: string;
  sizeId: string;
  nameUk: string;
  qty: number;
  priceUah: number;
};

export type OrderStatus =
  | "pending_payment"
  | "awaiting_setup"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";

export type Order = {
  id: string;
  createdAt: string;
  locale: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  delivery: Delivery;
  comment: string;
  items: OrderItem[];
  goodsUah: number;
  shippingUah: number;
  totalUah: number;
  status: OrderStatus;
  stockHeld: boolean;
  monoInvoiceId?: string;
  paymentUrl?: string;
  monoModifiedDate?: string;
};

type Store = {
  orders: Order[];
  stock: Record<string, number>;
};

const file = path.join(process.cwd(), "data", "store.json");

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function mergeStock(saved: Record<string, number> | undefined) {
  const stock: Record<string, number> = {};
  for (const product of products) {
    for (const item of product.sizes) {
      const key = stockKey(product.slug, item.id);
      const value = saved?.[key];
      stock[key] = typeof value === "number" ? value : item.initialStock;
    }
  }
  return stock;
}

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      stock: parsed.stock && typeof parsed.stock === "object" ? parsed.stock : {},
    };
  } catch {
    return { orders: [], stock: {} };
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
}

export async function getStock() {
  const store = await readStore();
  return mergeStock(store.stock);
}

export function productSize(product: Product, sizeId: string) {
  return product.sizes.find((item) => item.id === sizeId);
}

export async function placeOrder(order: Order) {
  return enqueue(async () => {
    const store = await readStore();
    const stock = mergeStock(store.stock);

    for (const item of order.items) {
      const key = stockKey(item.slug, item.sizeId);
      if ((stock[key] ?? 0) < item.qty) return { error: "stock" as const };
    }

    for (const item of order.items) {
      stock[stockKey(item.slug, item.sizeId)] -= item.qty;
    }

    store.orders.push(order);
    store.stock = stock;
    await writeStore(store);
    return { order };
  });
}

export async function attachInvoice(orderId: string, invoiceId: string, paymentUrl: string) {
  return enqueue(async () => {
    const store = await readStore();
    const order = store.orders.find((item) => item.id === orderId);
    if (!order) return;
    order.monoInvoiceId = invoiceId;
    order.paymentUrl = paymentUrl;
    order.status = "pending_payment";
    await writeStore(store);
  });
}

export async function releaseOrder(orderId: string, status: OrderStatus = "failed") {
  return enqueue(async () => {
    const store = await readStore();
    const stock = mergeStock(store.stock);
    const order = store.orders.find((item) => item.id === orderId);
    if (!order) return;
    if (order.stockHeld) {
      for (const item of order.items) {
        const key = stockKey(item.slug, item.sizeId);
        stock[key] = (stock[key] ?? 0) + item.qty;
      }
      order.stockHeld = false;
    }
    order.status = status;
    store.stock = stock;
    await writeStore(store);
  });
}

export async function getOrder(orderId: string) {
  const store = await readStore();
  return store.orders.find((item) => item.id === orderId) ?? null;
}

export async function applyMonoStatus(input: {
  invoiceId?: string;
  reference?: string;
  status?: string;
  modifiedDate?: string;
}) {
  return enqueue(async () => {
    const store = await readStore();
    const stock = mergeStock(store.stock);
    const order = store.orders.find(
      (item) =>
        (input.reference && item.id === input.reference) ||
        (input.invoiceId && item.monoInvoiceId === input.invoiceId),
    );
    if (!order || !input.status) return;

    if (
      order.monoModifiedDate &&
      input.modifiedDate &&
      Date.parse(input.modifiedDate) < Date.parse(order.monoModifiedDate)
    ) {
      return;
    }
    if (input.modifiedDate) order.monoModifiedDate = input.modifiedDate;

    if (input.status === "success") {
      order.status = "paid";
    } else if (input.status === "failure" || input.status === "expired" || input.status === "reversed") {
      if (order.stockHeld) {
        for (const item of order.items) {
          const key = stockKey(item.slug, item.sizeId);
          stock[key] = (stock[key] ?? 0) + item.qty;
        }
        order.stockHeld = false;
      }
      order.status =
        input.status === "reversed" ? "refunded" : input.status === "expired" ? "expired" : "failed";
    }

    store.stock = stock;
    await writeStore(store);
  });
}

export function createOrderId() {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const salt = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SK-${stamp}-${salt}`;
}
