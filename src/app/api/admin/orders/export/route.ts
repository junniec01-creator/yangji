import type { NextRequest } from "next/server";
import { toCsv } from "@/lib/csv";
import { formatKst } from "@/lib/kst";
import { fetchOrders } from "@/lib/order-queries";
import {
  ORDER_STATUS_LABEL,
  parseOrderFilter,
  parseSellerId,
} from "@/lib/orders";
import { BOX_OPTIONS, sellerName } from "@/lib/products";
import { requireAdmin } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

const HEADERS = [
  "주문번호",
  "주문일시",
  "상태",
  "판매자",
  "주문자",
  "주문자 연락처",
  "입금자명",
  "박스",
  "수량",
  "단가",
  "배송비",
  "합계",
  "수령인",
  "수령인 연락처",
  "우편번호",
  "주소",
  "상세주소",
  "도서산간",
  "요청사항",
];

export async function GET(request: NextRequest) {
  await requireAdmin();

  const params = request.nextUrl.searchParams;
  const filter = parseOrderFilter(params.get("status"));
  const seller = parseSellerId(params.get("seller"));
  const orders = await fetchOrders(filter, seller);

  const rows = orders.map((order) => [
    order.order_no,
    formatKst(order.created_at),
    ORDER_STATUS_LABEL[order.status],
    sellerName(order.seller_id),
    order.orderer_name,
    order.orderer_phone,
    order.depositor_name,
    BOX_OPTIONS.find((box) => box.id === order.box_id)?.name ?? order.box_id,
    order.quantity,
    order.unit_price,
    order.shipping_fee,
    order.total_price,
    order.recipient_name,
    order.recipient_phone,
    order.postcode,
    order.address1,
    order.address2,
    order.is_remote_area ? "Y" : "",
    order.memo,
  ]);

  const scope = [seller ?? "all", filter ?? "all"].join("-");
  const filename = `orders-${scope}-${formatKst(new Date().toISOString()).slice(0, 10)}.csv`;

  return new Response(toCsv(HEADERS, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
