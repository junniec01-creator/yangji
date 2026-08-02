import { BOX_OPTIONS, SHIPPING, type BoxId } from "@/lib/products";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "입금 대기",
  paid: "입금 확인",
  shipped: "발송 완료",
  cancelled: "취소",
};

/**
 * 목록·CSV 필터에는 실제 상태 외에 "남은 발송"이라는 가상 값을 하나 더 둔다.
 * 아직 부치지 않은 주문(입금 대기 + 입금 확인)을 한 번에 보기 위해서다.
 */
export const UNSHIPPED = "unshipped";

export const UNSHIPPED_STATUSES: readonly OrderStatus[] = ["pending", "paid"];

export type OrderFilter = OrderStatus | typeof UNSHIPPED;

export const ORDER_FILTERS: readonly OrderFilter[] = [
  UNSHIPPED,
  ...ORDER_STATUSES,
];

export const ORDER_FILTER_LABEL: Record<OrderFilter, string> = {
  ...ORDER_STATUS_LABEL,
  [UNSHIPPED]: "남은 발송",
};

/** 쿼리스트링 값을 필터로 바꾼다. 알 수 없는 값이면 undefined(= 전체). */
export function parseOrderFilter(
  value: string | null | undefined,
): OrderFilter | undefined {
  if (!value) return undefined;
  if (value === UNSHIPPED) return UNSHIPPED;
  return ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : undefined;
}

export const MAX_QUANTITY = 20;

export function isBoxId(value: string): value is BoxId {
  return BOX_OPTIONS.some((box) => box.id === value);
}

export interface PriceBreakdown {
  unitPrice: number;
  itemTotal: number;
  shippingFee: number;
  total: number;
}

export function calcPrice(
  boxId: BoxId,
  quantity: number,
  isRemote: boolean,
): PriceBreakdown {
  const unitPrice = BOX_OPTIONS.find((box) => box.id === boxId)?.price ?? 0;
  const itemTotal = unitPrice * quantity;
  const shippingFee = isRemote ? SHIPPING.remoteSurcharge : SHIPPING.baseFee;
  return { unitPrice, itemTotal, shippingFee, total: itemTotal + shippingFee };
}

/**
 * 제주 · 울릉도만 우편번호로 자동 판별한다.
 * 나머지 도서산간은 우편번호 대역이 흩어져 있어 관리자가 주문 확인 시
 * 직접 조정한다.
 */
export function isRemoteArea(postcode: string, address: string): boolean {
  const code = Number(postcode.replace(/\D/g, ""));
  if (Number.isFinite(code)) {
    if (code >= 63000 && code <= 63644) return true; // 제주특별자치도
    if (code >= 40200 && code <= 40240) return true; // 울릉군
  }
  return address.includes("제주특별자치도") || address.includes("울릉군");
}

/** 010-1234-5678 형태로 정규화. 형식이 아니면 null. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 11) return null;

  if (digits.startsWith("02")) {
    return digits.length === 9
      ? `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`
      : `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return null;
}
