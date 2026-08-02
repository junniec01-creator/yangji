import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { BOX_OPTIONS, SHIPPING, formatPrice } from "@/lib/products";

export function BoxSection() {
  return (
    <section id="boxes" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Boxes"
          title="박스 규격과 가격"
          description="과일 개수는 그해 알 크기에 따라 한두 개 차이가 날 수 있습니다. 무게를 기준으로 담아 드립니다."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {BOX_OPTIONS.map((box) => (
            <article
              key={box.id}
              className={`relative flex flex-col rounded-3xl bg-white p-8 ${
                box.featured
                  ? "ring-2 shadow-xl ring-peach-400 shadow-peach-500/10"
                  : "ring-1 ring-cream-200"
              }`}
            >
              {box.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-peach-500 px-3 py-1 text-xs font-semibold text-white">
                  가장 많이 나갑니다
                </span>
              )}

              <h3 className="font-display text-xl font-bold text-bark-900">
                {box.name}
              </h3>
              <p className="mt-2 text-sm text-bark-400 tabular-nums">
                {box.weightLabel} · {box.countLabel}
              </p>

              <p className="mt-7 text-[2.5rem] leading-none font-semibold text-bark-900 tabular-nums">
                {box.price.toLocaleString("ko-KR")}
                <span className="ml-1 text-base font-normal text-bark-400">
                  원
                </span>
              </p>
              <p className="mt-2.5 text-sm font-medium text-leaf-600">
                배송비 무료
              </p>

              <p className="mt-7 flex-1 leading-[1.8] text-bark-500 break-keep">
                {box.summary}
              </p>

              <p className="mt-7 border-t border-cream-200 pt-5 text-sm text-bark-400">
                추천 · {box.bestFor}
              </p>

              <Link
                href={`/order?box=${box.id}`}
                className={`mt-6 inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  box.featured
                    ? "bg-peach-500 text-white hover:bg-peach-600"
                    : "bg-cream-100 text-bark-700 hover:bg-cream-200"
                }`}
              >
                이 박스로 주문하기
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm leading-relaxed text-bark-400 break-keep">
          전 상품 배송비는 무료입니다. 다만 {SHIPPING.remoteLabel} 지역은 택배사
          추가 요금 {formatPrice(SHIPPING.remoteSurcharge)}이 붙습니다.
        </p>
      </div>
    </section>
  );
}
