import { supabase } from "../lib/supabase";

/*
 * Porudzbine za admin. Citanje i izmena statusa idu kroz RLS pravila
 * "admin read/manage orders" — bez prijavljenog admina baza vraca prazno.
 *
 * Porudzbinu UPISUJE edge funkcija create-order (service_role), ne frontend,
 * da se cena ne bi falsifikovala. Ovde se samo gleda i menja status.
 */

/* Redosled je i tok posla: nova -> u pripremi -> poslato -> isporuceno.
   "placeno" i "otkazano" stoje sa strane. */
export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Nova",
  paid: "Plaćeno",
  processing: "U pripremi",
  shipped: "Poslato",
  delivered: "Isporučeno",
  cancelled: "Otkazano",
};

/* Sledeci logican korak — dugme "jedan klik napred" u listi. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "processing",
  paid: "processing",
  processing: "shipped",
  shipped: "delivered",
};

export interface OrderItem {
  id: string;
  productName: string;
  collectionName: string | null;
  model: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
}

interface OrderRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  order_items: {
    id: string;
    product_name: string;
    collection_name: string | null;
    model: string;
    unit_price: number | string;
    quantity: number;
    line_total: number | string;
  }[];
}

const SELECT = `
  id, order_number, status, created_at,
  customer_name, customer_email, customer_phone,
  shipping_address, shipping_city, shipping_country,
  subtotal, shipping, total,
  order_items ( id, product_name, collection_name, model, unit_price, quantity, line_total )
`;

function normalize(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    number: row.order_number,
    status: row.status,
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    address: row.shipping_address,
    city: row.shipping_city,
    country: row.shipping_country,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    items: (row.order_items ?? []).map((it) => ({
      id: it.id,
      productName: it.product_name,
      collectionName: it.collection_name,
      model: it.model,
      unitPrice: Number(it.unit_price),
      quantity: it.quantity,
      lineTotal: Number(it.line_total),
    })),
  };
}

/** Sve porudzbine, najnovija prva, sa artiklima. */
export async function fetchOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as OrderRow[]).map(normalize);
}

/** Menja status jedne porudzbine. */
export async function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
