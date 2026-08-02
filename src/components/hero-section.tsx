import Link from "next/link";
import { PhotoPlaceholder } from "@/components/photo-placeholder";
import { BOX_OPTIONS, SEASON, SITE, formatPrice } from "@/lib/products";

const lowestPrice = Math.min(...BOX_OPTIONS.map((box) => box.price));

const FACTS = [
  { value: "당일", label: "새벽 수확 후 그날 발송" },
  { value: "12~15", label: "수확 기준 당도 (Brix)" },
  { value: "무료", label: `배송비 · ${formatPrice(lowestPrice)}부터` },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-64 h-[40rem] bg-[radial-gradient(60%_60%_at_70%_45%,var(--color-peach-100),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-12 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-bark-600">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-peach-500"
              />
              {SEASON.label} · {SEASON.periodLabel}
            </span>

            <h1 className="mt-7 font-display text-[clamp(2.5rem,8vw,4.25rem)] leading-[1.14] font-bold text-bark-900">
              나무에서 익힌
              <br />
              복숭아를 보냅니다
            </h1>

            <p className="mt-7 max-w-md text-[1.0625rem] leading-[1.85] text-bark-500 break-keep">
              덜 익은 것을 미리 따 두지 않습니다. {SITE.farmName}은 발송일
              새벽에 수확해, 한 상자씩 손으로 골라 담습니다.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/order"
                className="inline-flex h-14 items-center justify-center rounded-full bg-peach-500 px-9 text-[0.9375rem] font-semibold text-white shadow-[0_10px_30px_-10px] shadow-peach-500/60 transition-colors hover:bg-peach-600"
              >
                복숭아 주문하기
              </Link>
              <Link
                href="/#boxes"
                className="inline-flex h-14 items-center justify-center rounded-full px-7 text-[0.9375rem] font-medium text-bark-600 transition-colors hover:text-bark-900"
              >
                박스 규격 보기 →
              </Link>
            </div>

            <dl className="mt-14 grid grid-cols-3 gap-4 border-t border-cream-200 pt-8">
              {FACTS.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-display text-2xl font-bold text-bark-900 tabular-nums sm:text-[1.75rem]">
                    {fact.value}
                  </dt>
                  <dd className="mt-1.5 text-xs leading-relaxed text-bark-400 break-keep">
                    {fact.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <PhotoPlaceholder
              label="대표 사진 — 수확한 복숭아를 담은 박스 (세로 4:5 권장)"
              className="aspect-4/5 w-full rounded-[2rem] ring-1 ring-cream-200"
            />
            <div className="absolute -bottom-5 -left-3 hidden max-w-[15rem] rounded-2xl bg-white/95 p-5 ring-1 shadow-2xl ring-cream-200 shadow-bark-900/8 backdrop-blur sm:block">
              <p className="text-xs font-medium text-peach-600">수확 기준</p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-bark-600 break-keep">
                당도를 재서 기준에 못 미치면 며칠 더 두었다가 땁니다. 날짜에
                맞춰 미리 따지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
