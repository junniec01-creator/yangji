import "server-only";
import {
  UNSHIPPED,
  UNSHIPPED_STATUSES,
  type OrderFilter,
  type OrderStatus,
} from "@/lib/orders";
import { SELLERS, type BoxId, type SellerId } from "@/lib/products";
import { createServiceClient } from "@/lib/supabase";

export interface OrderRow {
  id: string;
  order_no: string;
  status: OrderStatus;
  /** 빈 문자열이면 이 기능이 생기기 전 주문(= 미지정). */
  seller_id: string;
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
  "id, order_no, status, seller_id, orderer_name, orderer_phone, depositor_name, box_id, quantity, unit_price, shipping_fee, total_price, recipient_same, recipient_name, recipient_phone, postcode, address1, address2, is_remote_area, memo, created_at";

/** 최신 주문부터. filter는 상태, seller는 판매자로 걸러낸다. */
export async function fetchOrders(
  filter?: OrderFilter,
  seller?: SellerId,
): Promise<OrderRow[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("orders")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (filter === UNSHIPPED) {
    query = query.in("status", [...UNSHIPPED_STATUSES]);
  } else if (filter) {
    query = query.eq("status", filter);
  }

  if (seller) query = query.eq("seller_id", seller);

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
  /** 판매자별 주문 건수. 취소도 포함한 전체 기준. */
  sellerCounts: Record<string, number>;
  totalCount: number;
  /** 취소를 뺀 박스 개수 합계 — 실제로 몇 박스를 따야 하는지. */
  totalBoxes: number;
  pendingCount: number;
  pendingBoxes: number;
  paidCount: number;
  paidBoxes: number;
  shippedCount: number;
  shippedBoxes: number;
  /** 아직 부치지 않은 주문 = 입금 대기 + 입금 확인. */
  unshippedCount: number;
  unshippedBoxes: number;
  /** 입금이 확인된 물량 = 입금 확인 + 발송 완료. */
  depositedCount: number;
  depositedBoxes: number;
  /** 취소를 뺀 금액 합계. */
  revenue: number;
  /** 입금이 확인된 금액 합계. */
  depositedRevenue: number;
}

const EMPTY_SUMMARY: OrderSummary = {
  counts: {},
  sellerCounts: {},
  totalCount: 0,
  totalBoxes: 0,
  pendingCount: 0,
  pendingBoxes: 0,
  paidCount: 0,
  paidBoxes: 0,
  shippedCount: 0,
  shippedBoxes: 0,
  unshippedCount: 0,
  unshippedBoxes: 0,
  depositedCount: 0,
  depositedBoxes: 0,
  revenue: 0,
  depositedRevenue: 0,
};

/** 필터와 무관하게 전체 주문을 기준으로 낸 집계. */
export async function fetchOrderSummary(): Promise<OrderSummary> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("status, seller_id, quantity, total_price");

  if (error) {
    console.error("주문 집계 조회 실패:", error.message);
    return EMPTY_SUMMARY;
  }

  const summary: OrderSummary = {
    ...EMPTY_SUMMARY,
    counts: {},
    sellerCounts: Object.fromEntries(
      SELLERS.map((seller) => [seller.id, 0]),
    ),
  };

  for (const row of data ?? []) {
    summary.counts[row.status] = (summary.counts[row.status] ?? 0) + 1;
    summary.sellerCounts[row.seller_id] =
      (summary.sellerCounts[row.seller_id] ?? 0) + 1;
    summary.totalCount += 1;

    if (row.status === "cancelled") continue;

    summary.totalBoxes += row.quantity;
    summary.revenue += row.total_price;

    if (row.status === "pending") {
      summary.pendingCount += 1;
      summary.pendingBoxes += row.quantity;
    } else if (row.status === "paid") {
      summary.paidCount += 1;
      summary.paidBoxes += row.quantity;
    } else {
      summary.shippedCount += 1;
      summary.shippedBoxes += row.quantity;
    }

    // 아직 부치지 않은 물량 = 입금 대기 + 입금 확인
    if (row.status !== "shipped") {
      summary.unshippedCount += 1;
      summary.unshippedBoxes += row.quantity;
    }

    // 돈이 들어온 물량 = 입금 확인 + 발송 완료
    if (row.status !== "pending") {
      summary.depositedCount += 1;
      summary.depositedBoxes += row.quantity;
      summary.depositedRevenue += row.total_price;
    }
  }

  return summary;
}
