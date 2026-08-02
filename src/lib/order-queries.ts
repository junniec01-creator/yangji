import "server-only";
import type { OrderStatus } from "@/lib/orders";
import type { BoxId } from "@/lib/products";
import { createServiceClient } from "@/lib/supabase";

export interface OrderRow {
  id: string;
  order_no: string;
  status: OrderStatus;
  orderer_name: string;
  orderer_phone: string;
  depositor_name: string;
  box_id: BoxId;
  quantity: number;
  unit_price: number;
  shipping_fee: number;
  total_price: number;
  recipient_same: boolean;
  recipient_name: string;
  recipient_phone: string;
  postcode: string;
  address1: string;
  address2: string;
  is_remote_area: boolean;
  memo: string;
  created_at: string;
}

const COLUMNS =
  "id, order_no, status, orderer_name, orderer_phone, depositor_name, box_id, quantity, unit_price, shipping_fee, total_price, recipient_same, recipient_name, recipient_phone, postcode, address1, address2, is_remote_area, memo, created_at";

/** 최신 주문부터. status를 주면 해당 상태만 걸러낸다. */
export async function fetchOrders(status?: OrderStatus): Promise<OrderRow[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("orders")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    console.error("주문 목록 조회 실패:", error.message);
    return [];
  }

  return (data ?? []) as OrderRow[];
}

/** 상태별 주문 건수. 필터 탭에 표시한다. */
export async function countOrdersByStatus(): Promise<Record<string, number>> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("orders").select("status");

  if (error) {
    console.error("주문 건수 조회 실패:", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}
