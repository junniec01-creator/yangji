import type { NextRequest } from "next/server";
import writeXlsxFile from "write-excel-file/node";
import { toCsv } from "@/lib/csv";
import { formatKst } from "@/lib/kst";
import { fetchOrders } from "@/lib/order-queries";
import {
  ORDER_TABLE_HEADERS,
  ORDER_TABLE_WIDTHS,
  toOrderRows,
} from "@/lib/order-table";
import { parseOrderFilter, parseSellerId } from "@/lib/orders";
import { getSiteSettings } from "@/lib/site-settings";
import { requireAdmin } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

/** 제목 줄. 엑셀에서 눈에 띄도록 브랜드 주황을 깔고 흰 글씨로 굵게. */
const HEADER_STYLE = {
  backgroundColor: "#E9613F",
  textColor: "#FFFFFF",
  fontWeight: "bold",
  align: "center",
  borderColor: "#CF4A2C",
  borderStyle: "thin",
} as const;

export async function GET(request: NextRequest) {
  await requireAdmin();

  const params = request.nextUrl.searchParams;
  const filter = parseOrderFilter(params.get("status"));
  const seller = parseSellerId(params.get("seller"));
  const asCsv = params.get("format") === "csv";

  const [orders, settings] = await Promise.all([
    fetchOrders(filter, seller),
    getSiteSettings(),
  ]);

  const rows = toOrderRows(orders, settings);
  const scope = [seller ?? "all", filter ?? "all"].join("-");
  const stamp = formatKst(new Date().toISOString()).slice(0, 10);
  const filename = `orders-${scope}-${stamp}.${asCsv ? "csv" : "xlsx"}`;

  const body = asCsv
    ? toCsv([...ORDER_TABLE_HEADERS], rows)
    : await writeXlsxFile(
        [
          ORDER_TABLE_HEADERS.map((title) => ({
            value: title,
            ...HEADER_STYLE,
          })),
          ...rows.map((row) =>
            row.map((value) =>
              typeof value === "number"
                ? { type: Number, value }
                : { type: String, value: String(value) },
            ),
          ),
        ],
        {
          sheet: "주문",
          // 제목 줄을 고정해 두면 아래로 훑어도 어느 칸인지 보인다.
          stickyRowsCount: 1,
          columns: ORDER_TABLE_WIDTHS.map((width) => ({ width })),
        },
      ).toBuffer();

  return new Response(new Uint8Array(Buffer.from(body as Uint8Array | string)), {
    headers: {
      "Content-Type": asCsv
        ? "text/csv; charset=utf-8"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
