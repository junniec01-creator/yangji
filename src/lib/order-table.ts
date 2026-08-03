import "server-only";
import { formatKst } from "@/lib/kst";
import type { OrderRow } from "@/lib/order-queries";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { BOX_OPTIONS, sellerName } from "@/lib/products";
import type { SiteSettings } from "@/lib/site-settings";

/**
 * 엑셀과 CSV가 같은 표를 쓰도록 한 곳에서 만든다.
 * 택배사 양식에 그대로 붙여넣을 수 있게 보내는 사람을 앞쪽에 둔다.
 */
export const ORDER_TABLE_HEADERS = [
  "주문번호",
  "주문일시",
  "상태",
  "판매자",
  "보내는 분",
  "보내는 분 연락처",
  "보내는 분 우편번호",
  "보내는 분 주소",
  "보내는 분 상세주소",
  "받는 분",
  "받는 분 연락처",
  "받는 분 우편번호",
  "받는 분 주소",
  "받는 분 상세주소",
  "박스",
  "수량",
  "단가",
  "배송비",
  "합계",
  "주문자",
  "주문자 연락처",
  "입금자명",
  "도서산간",
  "요청사항",
] as const;

/** 열 너비(엑셀 기준). 헤더 순서와 같다. */
export const ORDER_TABLE_WIDTHS = [
  14, 17, 10, 10, 14, 16, 14, 34, 18, 12, 16, 14, 34, 18, 12, 7, 10, 9, 11, 12,
  16, 12, 10, 30,
] as const;

export function toOrderRows(
  orders: OrderRow[],
  sender: SiteSettings | null,
): (string | number)[][] {
  return orders.map((order) => [
    order.order_no,
    formatKst(order.created_at),
    ORDER_STATUS_LABEL[order.status],
    sellerName(order.seller_id),
    sender?.senderName ?? "",
    sender?.senderPhone ?? "",
    sender?.senderPostcode ?? "",
    sender?.senderAddress1 ?? "",
    sender?.senderAddress2 ?? "",
    order.recipient_name,
    order.recipient_phone,
    order.postcode,
    order.address1,
    order.address2,
    BOX_OPTIONS.find((box) => box.id === order.box_id)?.name ?? order.box_id,
    order.quantity,
    order.unit_price,
    order.shipping_fee,
    order.total_price,
    order.orderer_name,
    order.orderer_phone,
    order.depositor_name,
    order.is_remote_area ? "Y" : "",
    order.memo,
  ]);
}
