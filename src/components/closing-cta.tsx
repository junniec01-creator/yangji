import Link from "next/link";
import { SEASON } from "@/lib/products";

export function ClosingCta() {
  return (
    <section className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-peach-500 px-8 py-20 text-center sm:px-16 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_20%_0%,rgba(255,255,255,0.28),transparent_60%)]"
        />
        <div className="relative">
          <h2 className="font-display text-[clamp(1.875rem,5vw,3rem)] leading-[1.25] font-bold text-white">
            올여름 복숭아, 지금 예약하세요
          </h2>
          <p className="mx-auto mt-6 max-w-md leading-[1.85] text-white/80 break-keep">
            {SEASON.periodLabel} 사이 수확되는 대로 순서대로 보내드립니다.
            수확이 끝나면 주문을 닫습니다.
          </p>
          <Link
            href="/order"
            className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-[0.9375rem] font-semibold text-peach-600 shadow-lg shadow-peach-700/20 transition-transform hover:scale-[1.02]"
          >
            주문서 작성하기
          </Link>
        </div>
      </div>
    </section>
  );
}
