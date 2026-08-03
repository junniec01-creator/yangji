import type { Metadata } from "next";
import Link from "next/link";
import { parseSellerId } from "@/lib/orders";
import { SHIPPING, SITE, sellerName } from "@/lib/products";
import { getSellerAccount } from "@/lib/seller-settings";

export const metadata: Metadata = {
  title: "주문 접수 완료",
};

export const dynamic = "force-dynamic";

/**
 * 주문번호는 순번이라 추측이 가능하므로, 이 화면에서는 주문번호와 입금 안내만
 * 보여주고 주문자·배송지 같은 개인정보는 조회하지 않는다.
 * 계좌도 주문을 다시 뒤지지 않고, 접수 직후 넘겨받은 판매자로만 고른다.
 */
export default async function OrderCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; seller?: string }>;
}) {
  const { no, seller: sellerParam } = await searchParams;
  const seller = parseSellerId(sellerParam);
  const account = seller ? await getSellerAccount(seller) : null;

  const hasBankInfo = Boolean(account?.bankAccount);

  return (
    <div className="mx-auto max-w-xl px-5 py-16 sm:py-24">
      <div className="text-center">
        <span
          aria-hidden
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-peach-100 text-2xl text-peach-600"
        >
          ✓
        </span>
        <h1 className="mt-7 font-display text-[clamp(1.75rem,5vw,2.5rem)] leading-[1.25] font-bold text-bark-900">
          주문이 접수되었습니다
        </h1>
        <p className="mt-5 leading-[1.85] text-bark-500 break-keep">
          아직 결제가 끝난 것은 아닙니다. 아래 계좌로 입금해 주시면 확인 뒤
          발송해 드립니다.
        </p>
      </div>

      {no && (
        <div className="mt-10 rounded-2xl bg-cream-100 px-6 py-5 text-center">
          <p className="text-xs text-bark-400">주문번호</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-wide text-bark-900 tabular-nums">
            {no}
          </p>
        </div>
      )}

      <section className="mt-4 rounded-3xl bg-white p-7 ring-1 ring-cream-200">
        <h2 className="font-display text-lg font-bold text-bark-900">
          입금 계좌
          {seller && (
            <span className="ml-2 text-sm font-medium text-peach-600">
              {sellerName(seller)}
            </span>
          )}
        </h2>
        {hasBankInfo ? (
          <dl className="mt-6 space-y-3.5 text-sm">
            <div className="flex gap-5">
              <dt className="w-16 shrink-0 text-bark-400">은행</dt>
              <dd className="font-medium text-bark-800">{account?.bankName}</dd>
            </div>
            <div className="flex gap-5">
              <dt className="w-16 shrink-0 text-bark-400">계좌번호</dt>
              <dd className="font-medium text-bark-800 tabular-nums">
                {account?.bankAccount}
              </dd>
            </div>
            <div className="flex gap-5">
              <dt className="w-16 shrink-0 text-bark-400">예금주</dt>
              <dd className="font-medium text-bark-800">
                {account?.bankHolder}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-5 rounded-xl bg-cream-100 px-4 py-3.5 text-sm leading-relaxed text-bark-600 break-keep">
            계좌 정보가 아직 등록되지 않았습니다. {SITE.phone}으로 연락 주시면
            안내해 드리겠습니다.
          </p>
        )}

        <p className="mt-7 border-t border-cream-200 pt-5 text-sm leading-[1.8] text-bark-400 break-keep">
          입금이 확인되면 주문 상태가 바뀌고, {SHIPPING.leadTimeLabel}.
          입금자명이 주문서에 적으신 것과 다르면 {SITE.phone}으로 알려 주세요.
        </p>
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold text-bark-700 ring-1 ring-cream-300 transition-colors hover:text-peach-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
