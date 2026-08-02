import type { Metadata } from "next";
import Link from "next/link";
import { SHIPPING, SITE } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "주문 접수 완료",
};

export const dynamic = "force-dynamic";

/**
 * 주문번호는 순번이라 추측이 가능하므로, 이 화면에서는 주문번호와 입금 안내만
 * 보여주고 주문자·배송지 같은 개인정보는 조회하지 않는다.
 */
export default async function OrderCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  const [{ no }, settings] = await Promise.all([
    searchParams,
    getSiteSettings(),
  ]);

  const hasBankInfo = Boolean(settings?.bankAccount);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <div className="text-center">
        <span
          aria-hidden
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-peach-100 text-3xl text-peach-600"
        >
          ✓
        </span>
        <h1 className="mt-6 font-serif text-3xl leading-snug font-semibold text-bark-900 sm:text-4xl">
          주문이 접수되었습니다
        </h1>
        <p className="mt-4 leading-relaxed text-bark-600">
          아직 결제가 끝난 것은 아닙니다. 아래 계좌로 입금해 주시면 확인 뒤
          발송해 드립니다.
        </p>
      </div>

      {no && (
        <div className="mt-10 rounded-2xl border border-cream-200 bg-cream-100/70 px-6 py-5 text-center">
          <p className="text-sm text-bark-500">주문번호</p>
          <p className="mt-1 font-serif text-2xl font-semibold tracking-wide text-bark-900">
            {no}
          </p>
        </div>
      )}

      <section className="mt-6 rounded-3xl border border-cream-200 bg-white p-7">
        <h2 className="font-serif text-xl font-semibold text-bark-900">
          입금 계좌
        </h2>
        {hasBankInfo ? (
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-bark-500">은행</dt>
              <dd className="font-medium text-bark-800">{settings?.bankName}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-bark-500">계좌번호</dt>
              <dd className="font-medium text-bark-800">
                {settings?.bankAccount}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-bark-500">예금주</dt>
              <dd className="font-medium text-bark-800">
                {settings?.bankHolder}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-5 rounded-xl bg-cream-100 px-4 py-3 text-sm leading-relaxed text-bark-600">
            계좌 정보가 아직 등록되지 않았습니다. {SITE.phone}으로 연락 주시면
            안내해 드리겠습니다.
          </p>
        )}

        <p className="mt-6 text-sm leading-relaxed text-bark-500">
          입금이 확인되면 주문 상태가 바뀌고, {SHIPPING.leadTimeLabel}.
          입금자명이 주문서에 적으신 것과 다르면 {SITE.phone}으로 알려 주세요.
        </p>
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full border border-cream-300 px-8 text-sm font-semibold text-bark-700 transition-colors hover:border-peach-300 hover:text-peach-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
