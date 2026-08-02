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

export interface OrderSummary {
  /** 상태별 주문 건수. 필터 탭에 표시한다. */
  counts: Record<string, number>;
  totalCount: number;
  /** 취소를 뺀 박스 개수 합계 — 실제로 몇 박스를 따야 하는지. */
  totalBoxes: number;
  shippedCount: number;
  shippedBoxes: number;
  /** 취소를 뺀 금액 합계. */
  revenue: number;
}

const EMPTY_SUMMARY: OrderSummary = {
  counts: {},
  totalCount: 0,
  totalBoxes: 0,
  shippedCount: 0,
  shippedBoxes: 0,
  revenue: 0,
};

/** 필터와 무관하게 전체 주문을 기준으로 낸 집계. */
export async function fetchOrderSummary(): Promise<OrderSummary> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("status, quantity, total_price");

  if (error) {
    console.error("주문 집계 조회 실패:", error.message);
    return EMPTY_SUMMARY;
  }

  const summary: OrderSummary = { ...EMPTY_SUMMARY, counts: {} };

  for (const row of data ?? []) {
    summary.counts[row.status] = (summary.counts[row.status] ?? 0) + 1;
    summary.totalCount += 1;

    if (row.status === "cancelled") continue;

    summary.totalBoxes += row.quantity;
    summary.revenue += row.total_price;

    if (row.status === "shipped") {
      summary.shippedCount += 1;
      summary.shippedBoxes += row.quantity;
    }
  }

  return summary;
}
