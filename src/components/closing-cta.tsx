import Link from "next/link";
import { SEASON } from "@/lib/products";

export function ClosingCta() {
  return (
    <section className="px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-peach-400 via-peach-500 to-peach-600 px-8 py-16 text-center sm:px-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/15 blur-2xl"
        />
        <div className="relative">
          <h2 className="font-serif text-3xl leading-snug font-semibold text-balance text-white sm:text-4xl">
            올여름 복숭아, 지금 예약하세요
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-white/85">
            {SEASON.periodLabel} 사이 수확되는 대로 순서대로 보내드립니다.
            수확이 끝나면 주문을 닫습니다.
          </p>
          <Link
            href="/order"
            className="mt-9 inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-base font-semibold text-peach-600 shadow-lg shadow-peach-700/20 transition-transform hover:scale-[1.02]"
          >
            주문서 작성하기
          </Link>
        </div>
      </div>
    </section>
  );
}
