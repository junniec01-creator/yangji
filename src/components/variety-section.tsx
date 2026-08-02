import { PhotoPlaceholder } from "@/components/photo-placeholder";
import { SEASON, VARIETIES } from "@/lib/products";

export function VarietySection() {
  return (
    <section id="peaches" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-widest text-peach-600 uppercase">
            Varieties
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-snug font-semibold text-balance text-bark-900 sm:text-4xl">
            같은 복숭아가 아닙니다
          </h2>
          <p className="mt-4 leading-relaxed text-bark-600">
            {SEASON.note} 주문하실 때 원하는 품종이 있으시면 요청사항에 적어
            주세요. 수확 상황이 맞으면 맞춰 보내드립니다.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {VARIETIES.map((variety) => (
            <article
              key={variety.name}
              className="group overflow-hidden rounded-3xl border border-cream-200 bg-cream-50 transition-shadow hover:shadow-lg hover:shadow-bark-900/5"
            >
              <PhotoPlaceholder
                label={`${variety.name} 단면 사진 (가로 3:2 권장)`}
                className="aspect-3/2 w-full rounded-none border-0 border-b border-dashed"
              />
              <div className="p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-serif text-2xl font-semibold text-bark-900">
                    {variety.name}
                  </h3>
                  <span className="rounded-full bg-peach-100 px-3 py-1 text-xs font-medium text-peach-700">
                    {variety.brixLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-leaf-600">
                  {variety.periodLabel}
                </p>
                <p className="mt-4 leading-relaxed text-bark-600">
                  {variety.note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
