import type { Metadata } from "next";
import Link from "next/link";
import { OrderForm } from "@/app/order/order-form";
import { isBoxId } from "@/lib/orders";
import { SEASON } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "주문하기",
};

// site_settings의 마감 스위치를 매 요청마다 반영해야 하므로 정적 생성하지 않는다.
export const dynamic = "force-dynamic";

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <h1 className="font-display text-3xl leading-snug font-bold text-bark-900">
        {title}
      </h1>
      <p className="mt-5 leading-[1.85] text-bark-500 break-keep">{body}</p>
      <Link
        href="/"
        className="mt-9 inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold text-bark-700 ring-1 ring-cream-300 transition-colors hover:text-peach-700"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ box?: string }>;
}) {
  const settings = await getSiteSettings();

  if (!settings) {
    return (
      <Notice
        title="주문 시스템 점검 중입니다"
        body="잠시 후 다시 시도해 주세요. 급하시면 농장으로 직접 연락 주시면 도와드리겠습니다."
      />
    );
  }

  if (!settings.isOrderOpen) {
    return <Notice title="지금은 주문을 받지 않습니다" body={settings.closedMessage} />;
  }

  const { box } = await searchParams;
  const defaultBoxId = box && isBoxId(box) ? box : "medium";

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-peach-600 uppercase">
          Order
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] leading-[1.25] font-bold text-bark-900">
          주문서 작성
        </h1>
        <p className="mt-5 max-w-xl leading-[1.85] text-bark-500 break-keep">
          {SEASON.periodLabel} 사이 수확되는 대로 순서대로 보내드립니다. 접수
          후 안내되는 계좌로 입금해 주시면 확인 뒤 발송됩니다.
        </p>
      </header>

      <OrderForm defaultBoxId={defaultBoxId} />
    </div>
  );
}
