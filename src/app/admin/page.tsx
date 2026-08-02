import type { Metadata } from "next";
import Link from "next/link";
import { updateOrderStatus } from "@/app/admin/actions";
import { AdminHeader } from "@/app/admin/admin-header";
import { DeleteOrderButton } from "@/app/admin/delete-order-button";
import { SettingsForm } from "@/app/admin/settings-form";
import { StatCard } from "@/app/admin/stat-card";
import { formatKst } from "@/lib/kst";
import { fetchOrderSummary, fetchOrders } from "@/lib/order-queries";
import {
  ORDER_FILTERS,
  ORDER_FILTER_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  UNSHIPPED,
  parseOrderFilter,
  type OrderFilter,
  type OrderStatus,
} from "@/lib/orders";
import { BOX_OPTIONS, formatPrice } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import { requireAdmin } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "주문 관리",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-cream-200 text-bark-600",
  paid: "bg-peach-100 text-peach-700",
  shipped: "bg-leaf-500/15 text-leaf-600",
  cancelled: "bg-bark-900/8 text-bark-400",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status: statusParam } = await searchParams;
  const filter = parseOrderFilter(statusParam);

  const [orders, summary, settings] = await Promise.all([
    fetchOrders(filter),
    fetchOrderSummary(),
    getSiteSettings(),
  ]);

  const filterCount = (value: OrderFilter) =>
    value === UNSHIPPED ? summary.unshippedCount : (summary.counts[value] ?? 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminHeader current="/admin" />

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="총 주문" value={`${summary.totalCount}건`} />
        <StatCard
          label="총 주문 수량"
          value={`${summary.totalBoxes}박스`}
          hint="취소 제외"
        />
        <StatCard
          label="입금 확인 수량"
          value={`${summary.depositedBoxes}박스`}
          hint={`${summary.depositedCount}건 · 발송 완료 포함`}
        />
        <StatCard
          label="남은 발송 수량"
          value={`${summary.unshippedBoxes}박스`}
          hint={`입금 확인 ${summary.paidBoxes} · 입금 대기 ${summary.pendingBoxes}박스`}
        />
        <StatCard
          label="발송 완료"
          value={`${summary.shippedCount}건`}
          hint={`${summary.shippedBoxes}박스`}
        />
        <StatCard
          label="합계 금액"
          value={formatPrice(summary.revenue)}
          hint={`입금 확인 ${formatPrice(summary.depositedRevenue)}`}
        />
      </div>

      <div className="mt-6">
        {settings ? (
          <SettingsForm settings={settings} />
        ) : (
          <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 ring-1 ring-red-200">
            사이트 설정을 불러오지 못했습니다.
          </p>
        )}
      </div>

      <nav className="mt-10 flex flex-wrap gap-2">
        <FilterTab
          href="/admin"
          label="전체"
          count={summary.totalCount}
          active={!filter}
        />
        {ORDER_FILTERS.map((value) => (
          <FilterTab
            key={value}
            href={`/admin?status=${value}`}
            label={ORDER_FILTER_LABEL[value]}
            count={filterCount(value)}
            active={filter === value}
          />
        ))}
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-cream-100/70 px-4 py-3 ring-1 ring-cream-200">
        <span className="mr-1 text-xs font-semibold text-bark-500">
          CSV 내려받기
        </span>
        <CsvLink
          href="/api/admin/orders/export"
          label="전체"
          count={summary.totalCount}
        />
        {ORDER_FILTERS.map((value) => (
          <CsvLink
            key={value}
            href={`/api/admin/orders/export?status=${value}`}
            label={ORDER_FILTER_LABEL[value]}
            count={filterCount(value)}
          />
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {orders.length === 0 && (
          <p className="rounded-2xl bg-cream-100/60 px-6 py-14 text-center text-sm text-bark-400 ring-1 ring-cream-200">
            해당하는 주문이 없습니다.
          </p>
        )}

        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl bg-white p-5 ring-1 ring-cream-200 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-base font-semibold text-bark-900 tabular-nums">
                  {order.order_no}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[order.status]}`}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
                {!order.recipient_same && (
                  <span className="rounded-full bg-peach-50 px-2.5 py-1 text-xs text-peach-700">
                    선물
                  </span>
                )}
                {order.is_remote_area && (
                  <span className="rounded-full bg-cream-100 px-2.5 py-1 text-xs text-bark-500">
                    도서산간
                  </span>
                )}
              </div>
              <span className="text-xs text-bark-300 tabular-nums">
                {formatKst(order.created_at)}
              </span>
            </div>

            <dl className="mt-5 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
              <Row label="주문자">
                {order.orderer_name} · {order.orderer_phone}
              </Row>
              <Row label="입금자명">{order.depositor_name}</Row>
              <Row label="상품">
                {BOX_OPTIONS.find((box) => box.id === order.box_id)?.name ??
                  order.box_id}{" "}
                × {order.quantity}
              </Row>
              <Row label="금액">
                {formatPrice(order.total_price)}
                {order.shipping_fee > 0 &&
                  ` (배송비 ${formatPrice(order.shipping_fee)} 포함)`}
              </Row>
              <Row label="받는 분">
                {order.recipient_name} · {order.recipient_phone}
              </Row>
              <Row label="배송지">
                ({order.postcode}) {order.address1} {order.address2}
              </Row>
              {order.memo && <Row label="요청사항">{order.memo}</Row>}
            </dl>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-4">
              <form
                action={updateOrderStatus}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="id" value={order.id} />
                <select
                  name="status"
                  defaultValue={order.status}
                  aria-label="주문 상태"
                  className="rounded-lg bg-white px-3 py-2 text-sm text-bark-800 ring-1 outline-none ring-cream-300 focus:ring-peach-400"
                >
                  {ORDER_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {ORDER_STATUS_LABEL[value]}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-bark-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bark-800"
                >
                  상태 변경
                </button>
              </form>

              <DeleteOrderButton id={order.id} orderNo={order.order_no} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function FilterTab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-bark-900 px-4 py-2 text-sm font-medium text-cream-50"
          : "rounded-full px-4 py-2 text-sm text-bark-500 ring-1 ring-cream-300 transition-colors hover:text-bark-900"
      }
    >
      {label} <span className="tabular-nums">{count}</span>
    </Link>
  );
}

function CsvLink({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count: number;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-bark-600 ring-1 ring-cream-300 transition-colors hover:text-peach-700 hover:ring-peach-300"
    >
      {label}
      <span className="text-bark-300 tabular-nums">{count}</span>
    </a>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 text-bark-300">{label}</dt>
      <dd className="text-bark-700">{children}</dd>
    </div>
  );
}
