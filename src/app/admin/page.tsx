import type { Metadata } from "next";
import Link from "next/link";
import { cancelOrder, confirmPayment, markShipped } from "@/app/admin/actions";
import { AdminHeader } from "@/app/admin/admin-header";
import { ConfirmForm } from "@/app/admin/confirm-form";
import { formatKst } from "@/lib/kst";
import { fetchOrders, type OrderRow } from "@/lib/order-queries";
import { BOX_OPTIONS, formatPrice } from "@/lib/products";
import { requireAdmin } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "주문 확인",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function boxName(order: OrderRow) {
  return (
    BOX_OPTIONS.find((box) => box.id === order.box_id)?.name ?? order.box_id
  );
}

/**
 * 매일 보는 화면. 처리할 주문만 띄우고 버튼 한 번으로 넘긴다.
 *
 * 탭마다 강조하는 정보가 다르다. 입금 확인은 통장 내역과 대조하는 일이라
 * 입금자명과 금액을, 발송은 송장을 쓰는 일이라 품목과 배송지를 크게 둔다.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();

  const { tab } = await searchParams;
  const shipping = tab === "ship";

  const [pending, paid] = await Promise.all([
    fetchOrders("pending"),
    fetchOrders("paid"),
  ]);

  // 발송은 오래 기다린 주문부터 부치는 게 맞다.
  const toShip = [...paid].reverse();

  const pendingTotal = pending.reduce(
    (sum, order) => sum + order.total_price,
    0,
  );
  const shipBoxes = paid.reduce((sum, order) => sum + order.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <AdminHeader current="/admin" />

      <div className="mt-8 flex gap-2">
        <TabLink
          href="/admin"
          label="입금 확인"
          count={pending.length}
          active={!shipping}
        />
        <TabLink
          href="/admin?tab=ship"
          label="발송"
          count={paid.length}
          active={shipping}
        />
      </div>

      <p className="mt-3 text-sm text-bark-400">
        {shipping ? (
          <>
            부칠 주문 <strong className="text-bark-700">{paid.length}건</strong>{" "}
            · <strong className="text-bark-700">{shipBoxes}박스</strong>
          </>
        ) : (
          <>
            확인할 주문{" "}
            <strong className="text-bark-700">{pending.length}건</strong> · 합계{" "}
            <strong className="text-bark-700">
              {formatPrice(pendingTotal)}
            </strong>
          </>
        )}
      </p>

      <div className="mt-5 space-y-4">
        {shipping
          ? toShip.map((order) => <ShipCard key={order.id} order={order} />)
          : pending.map((order) => <PayCard key={order.id} order={order} />)}

        {(shipping ? toShip : pending).length === 0 && (
          <p className="rounded-2xl bg-cream-100/60 px-6 py-16 text-center text-sm text-bark-400 ring-1 ring-cream-200">
            {shipping ? "부칠 주문이 없습니다." : "확인할 주문이 없습니다."}
          </p>
        )}
      </div>
    </div>
  );
}

function PayCard({ order }: { order: OrderRow }) {
  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-cream-200 sm:p-6">
      <CardHead order={order} />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-xl bg-cream-100/70 px-4 py-3.5">
        <div>
          <p className="text-xs text-bark-400">입금자명</p>
          <p className="mt-0.5 text-xl font-semibold text-bark-900">
            {order.depositor_name}
          </p>
        </div>
        <p className="text-2xl font-semibold text-bark-900 tabular-nums">
          {formatPrice(order.total_price)}
        </p>
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-bark-600">
        <p>
          {boxName(order)} × {order.quantity}
          {order.shipping_fee > 0 &&
            ` · 배송비 ${formatPrice(order.shipping_fee)} 포함`}
        </p>
        <p>
          주문자 {order.orderer_name} · {order.orderer_phone}
        </p>
        <p className="break-keep">
          ({order.postcode}) {order.address1} {order.address2}
        </p>
        {order.memo && (
          <p className="text-peach-700 break-keep">요청사항 · {order.memo}</p>
        )}
      </div>

      <div className="mt-5 flex gap-2 border-t border-cream-200 pt-4">
        <form action={confirmPayment} className="flex-1">
          <input type="hidden" name="id" value={order.id} />
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-peach-500 text-sm font-semibold text-white transition-colors hover:bg-peach-600"
          >
            입금 확인
          </button>
        </form>

        <ConfirmForm
          action={cancelOrder}
          id={order.id}
          message={`주문 ${order.order_no}을(를) 취소할까요?`}
        >
          <button
            type="submit"
            className="h-11 rounded-xl px-5 text-sm font-medium text-bark-500 ring-1 ring-cream-300 transition-colors hover:text-red-600 hover:ring-red-300"
          >
            주문 취소
          </button>
        </ConfirmForm>
      </div>
    </article>
  );
}

function ShipCard({ order }: { order: OrderRow }) {
  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-cream-200 sm:p-6">
      <CardHead order={order} />

      <div className="mt-4 rounded-xl bg-cream-100/70 px-4 py-3.5">
        <p className="text-lg font-semibold text-bark-900">
          {boxName(order)} × {order.quantity}
        </p>
        <p className="mt-2 leading-relaxed text-bark-800 break-keep">
          ({order.postcode}) {order.address1} {order.address2}
        </p>
        <p className="mt-1.5 text-sm text-bark-500">
          {order.recipient_name} · {order.recipient_phone}
        </p>
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-bark-600">
        <p>
          주문자 {order.orderer_name} · {order.orderer_phone}
        </p>
        <p className="tabular-nums">
          {formatPrice(order.total_price)} · 입금자명 {order.depositor_name}
        </p>
        {order.memo && (
          <p className="text-peach-700 break-keep">요청사항 · {order.memo}</p>
        )}
      </div>

      <div className="mt-5 border-t border-cream-200 pt-4">
        <form action={markShipped}>
          <input type="hidden" name="id" value={order.id} />
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-bark-900 text-sm font-semibold text-white transition-colors hover:bg-bark-800"
          >
            발송 완료
          </button>
        </form>
      </div>
    </article>
  );
}

function CardHead({ order }: { order: OrderRow }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-bark-900 tabular-nums">
          {order.order_no}
        </span>
        {!order.recipient_same && (
          <span className="rounded-full bg-peach-50 px-2.5 py-0.5 text-xs text-peach-700">
            선물
          </span>
        )}
        {order.is_remote_area && (
          <span className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs text-bark-500">
            도서산간
          </span>
        )}
      </div>
      <span className="text-xs text-bark-300 tabular-nums">
        {formatKst(order.created_at)}
      </span>
    </div>
  );
}

function TabLink({
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
          ? "flex flex-1 items-center justify-center gap-2 rounded-xl bg-bark-900 px-4 py-3 text-sm font-semibold text-cream-50"
          : "flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-bark-500 ring-1 ring-cream-300 transition-colors hover:text-bark-900"
      }
    >
      {label}
      <span
        className={
          active
            ? "rounded-full bg-cream-50/20 px-2 py-0.5 text-xs tabular-nums"
            : "rounded-full bg-cream-100 px-2 py-0.5 text-xs text-bark-600 tabular-nums"
        }
      >
        {count}
      </span>
    </Link>
  );
}
