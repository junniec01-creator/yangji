import type { Metadata } from "next";
import Link from "next/link";
import { signOut, updateOrderStatus } from "@/app/admin/actions";
import { DeleteOrderButton } from "@/app/admin/delete-order-button";
import { SettingsForm } from "@/app/admin/settings-form";
import { formatKst } from "@/lib/csv";
import { countOrdersByStatus, fetchOrders } from "@/lib/order-queries";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/lib/orders";
import { BOX_OPTIONS, SITE, formatPrice } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import { requireAdmin } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "주문 관리",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-cream-200 text-bark-700",
  paid: "bg-peach-100 text-peach-700",
  shipped: "bg-leaf-500/15 text-leaf-600",
  cancelled: "bg-bark-900/10 text-bark-500",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status: statusParam } = await searchParams;
  const status = ORDER_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;

  const [orders, counts, settings] = await Promise.all([
    fetchOrders(status),
    countOrdersByStatus(),
    getSiteSettings(),
  ]);

  const totalCount = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total_price, 0);

  const exportHref = status
    ? `/api/admin/orders/export?status=${status}`
    : "/api/admin/orders/export";

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-widest text-peach-600 uppercase">
            Admin
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-bark-900">
            {SITE.farmName} 주문 관리
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-bark-500 transition-colors hover:text-peach-600"
          >
            사이트 보기
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-cream-300 px-4 py-2 text-sm text-bark-600 transition-colors hover:border-peach-300 hover:text-peach-700"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <div className="mt-8">
        {settings ? (
          <SettingsForm settings={settings} />
        ) : (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            사이트 설정을 불러오지 못했습니다.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-cream-200 bg-white px-6 py-5">
          <p className="text-sm text-bark-500">
            {status ? `${ORDER_STATUS_LABEL[status]} 주문` : "전체 주문"}
          </p>
          <p className="mt-1 font-serif text-3xl font-semibold text-bark-900">
            {orders.length}건
          </p>
        </div>
        <div className="rounded-2xl border border-cream-200 bg-white px-6 py-5">
          <p className="text-sm text-bark-500">합계 금액 (취소 제외)</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-bark-900">
            {formatPrice(revenue)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-2">
          <FilterTab
            href="/admin"
            label="전체"
            count={totalCount}
            active={!status}
          />
          {ORDER_STATUSES.map((value) => (
            <FilterTab
              key={value}
              href={`/admin?status=${value}`}
              label={ORDER_STATUS_LABEL[value]}
              count={counts[value] ?? 0}
              active={status === value}
            />
          ))}
        </nav>

        <a
          href={exportHref}
          className="inline-flex h-10 items-center justify-center rounded-full bg-peach-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-peach-600"
        >
          CSV 내려받기
        </a>
      </div>

      <div className="mt-6 space-y-4">
        {orders.length === 0 && (
          <p className="rounded-2xl border border-dashed border-cream-300 bg-cream-100/50 px-6 py-12 text-center text-sm text-bark-500">
            해당하는 주문이 없습니다.
          </p>
        )}

        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-cream-200 bg-white p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-serif text-lg font-semibold text-bark-900">
                  {order.order_no}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[order.status]}`}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
                {order.is_remote_area && (
                  <span className="rounded-full bg-peach-50 px-3 py-1 text-xs text-peach-700">
                    도서산간
                  </span>
                )}
              </div>
              <span className="text-xs text-bark-400">
                {formatKst(order.created_at)}
              </span>
            </div>

            <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
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
                {!order.recipient_same && (
                  <span className="ml-2 text-xs text-peach-600">선물</span>
                )}
              </Row>
              <Row label="배송지">
                ({order.postcode}) {order.address1} {order.address2}
              </Row>
              {order.memo && <Row label="요청사항">{order.memo}</Row>}
            </dl>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-4">
              <form action={updateOrderStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select
                  name="status"
                  defaultValue={order.status}
                  aria-label="주문 상태"
                  className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-bark-800 outline-none focus:border-peach-400"
                >
                  {ORDER_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {ORDER_STATUS_LABEL[value]}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-bark-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bark-900"
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
          ? "rounded-full bg-bark-800 px-4 py-2 text-sm font-medium text-white"
          : "rounded-full border border-cream-300 px-4 py-2 text-sm text-bark-600 transition-colors hover:border-peach-300"
      }
    >
      {label} {count}
    </Link>
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
      <dt className="w-20 shrink-0 text-bark-400">{label}</dt>
      <dd className="text-bark-800">{children}</dd>
    </div>
  );
}
