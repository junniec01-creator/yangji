import { PhotoPlaceholder } from "@/components/photo-placeholder";
import { SectionHeading } from "@/components/section-heading";
import { SEASON, VARIETIES } from "@/lib/products";

export function VarietySection() {
  return (
    <section id="peaches" className="scroll-mt-16 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Varieties"
          title="같은 복숭아가 아닙니다"
          description={`${SEASON.note} 원하는 품종이 있으시면 주문할 때 요청사항에 적어 주세요. 수확 상황이 맞으면 맞춰 보내드립니다.`}
        />

        <div className="mt-14 grid gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-12">
          {VARIETIES.map((variety) => (
            <article key={variety.name}>
              <PhotoPlaceholder
                label={`${variety.name} 단면 사진 (가로 3:2 권장)`}
                className="aspect-3/2 w-full rounded-2xl ring-1 ring-cream-200"
              />
              <div className="mt-6">
                <div className="flex items-baseline gap-3">
                  <h3 className="font-display text-2xl font-bold text-bark-900">
                    {variety.name}
                  </h3>
                  <span className="text-sm font-medium text-peach-600 tabular-nums">
                    {variety.brixLabel}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-leaf-600">
                  {variety.periodLabel}
                </p>
                <p className="mt-4 leading-[1.85] text-bark-500 break-keep">
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
