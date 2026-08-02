import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "주문하기",
};

export default function OrderPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-24">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl font-semibold text-bark-900">
            주문서를 준비하고 있습니다
          </h1>
          <p className="mt-4 leading-relaxed text-bark-600">
            박스 크기와 수량, 배송지를 입력하는 주문 폼은 다음 단계에서
            만들어집니다.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-cream-300 px-8 text-sm font-semibold text-bark-700 transition-colors hover:border-peach-300 hover:text-peach-700"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
