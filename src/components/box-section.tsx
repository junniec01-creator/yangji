import Link from "next/link";
import { BOX_OPTIONS, SHIPPING, formatPrice } from "@/lib/products";

export function BoxSection() {
  return (
    <section id="boxes" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-widest text-peach-600 uppercase">
            Boxes
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-snug font-semibold text-balance text-bark-900 sm:text-4xl">
            박스 규격과 가격
          </h2>
          <p className="mt-4 leading-relaxed text-bark-600">
            과일 개수는 그해 알 크기에 따라 한두 개 차이가 날 수 있습니다.
            무게를 기준으로 담아 드립니다.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {BOX_OPTIONS.map((box) => (
            <article
              key={box.id}
              className={
                box.featured
                  ? "relative flex flex-col rounded-3xl border-2 border-peach-400 bg-white p-8 shadow-xl shadow-peach-500/10"
                  : "relative flex flex-col rounded-3xl border border-cream-200 bg-white p-8"
              }
            >
              {box.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-peach-500 px-3 py-1 text-xs font-semibold text-white">
                  가장 많이 나갑니다
                </span>
              )}

              <h3 className="font-serif text-xl font-semibold text-bark-900">
                {box.name}
              </h3>
              <p className="mt-1.5 text-sm text-bark-500">
                {box.weightLabel} · {box.countLabel}
              </p>

              <p className="mt-6 font-serif text-4xl font-semibold tracking-tight text-bark-900">
                {formatPrice(box.price)}
              </p>
              <p className="mt-1.5 text-sm text-leaf-600">배송비 무료</p>

              <p className="mt-6 flex-1 leading-relaxed text-bark-600">
                {box.summary}
              </p>

              <p className="mt-6 rounded-xl bg-cream-100 px-4 py-3 text-sm text-bark-600">
                추천 · {box.bestFor}
              </p>

              <Link
                href={`/order?box=${box.id}`}
                className={
                  box.featured
                    ? "mt-6 inline-flex h-12 items-center justify-center rounded-full bg-peach-500 text-sm font-semibold text-white transition-colors hover:bg-peach-600"
                    : "mt-6 inline-flex h-12 items-center justify-center rounded-full border border-cream-300 text-sm font-semibold text-bark-700 transition-colors hover:border-peach-300 hover:text-peach-700"
                }
              >
                이 박스로 주문하기
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 rounded-2xl border border-cream-200 bg-cream-100/70 px-6 py-4 text-sm leading-relaxed text-bark-600">
          전 상품 배송비는 무료입니다. 다만 {SHIPPING.remoteLabel} 지역은 택배사
          추가 요금 {formatPrice(SHIPPING.remoteSurcharge)}이 붙습니다.
        </p>
      </div>
    </section>
  );
}
