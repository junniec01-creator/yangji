import Link from "next/link";
import { PhotoPlaceholder } from "@/components/photo-placeholder";
import { BOX_OPTIONS, SEASON, SITE, formatPrice } from "@/lib/products";

const lowestPrice = Math.min(...BOX_OPTIONS.map((box) => box.price));

const HIGHLIGHTS = [
  { title: "수확 당일 발송", body: "새벽에 따서 그날 보냅니다." },
  { title: "산지 직송", body: "중간 유통 없이 농장에서 바로." },
  { title: "무료 배송", body: `${formatPrice(lowestPrice)}부터, 배송비 없음.` },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* 배경 광원 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-peach-200/45 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-40 h-96 w-96 rounded-full bg-cream-200/70 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-peach-200 bg-peach-50 px-4 py-1.5 text-xs font-medium text-peach-700">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-peach-500"
              />
              {SEASON.label} · {SEASON.periodLabel}
            </span>

            <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.2] font-semibold tracking-tight text-balance text-bark-900 sm:text-6xl sm:leading-[1.15]">
              나무에서 익힌
              <br />
              복숭아를 보냅니다
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-bark-600 sm:text-lg">
              덜 익은 걸 미리 따 두지 않습니다. {SITE.farmName}은 발송일 새벽에
              수확해 한 상자씩 손으로 골라 담습니다.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/order"
                className="inline-flex h-13 items-center justify-center rounded-full bg-peach-500 px-8 text-base font-semibold text-white shadow-lg shadow-peach-500/25 transition-colors hover:bg-peach-600"
              >
                복숭아 주문하기
              </Link>
              <a
                href="#boxes"
                className="inline-flex h-13 items-center justify-center rounded-full border border-cream-300 bg-white/70 px-8 text-base font-medium text-bark-700 transition-colors hover:border-peach-300 hover:text-peach-700"
              >
                박스 규격 보기
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-x-6 gap-y-5 border-t border-cream-200 pt-8 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <div key={item.title}>
                  <dt className="text-sm font-semibold text-bark-800">
                    {item.title}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-bark-500">
                    {item.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <PhotoPlaceholder
              label="대표 사진 — 수확한 복숭아를 담은 박스 (세로 4:5 권장)"
              className="aspect-4/5 w-full shadow-sm"
            />
            <div className="absolute -bottom-6 -left-4 hidden w-52 rounded-2xl border border-cream-200 bg-white/95 p-4 shadow-xl shadow-bark-900/5 backdrop-blur sm:block">
              <p className="font-serif text-2xl font-semibold text-bark-900">
                12~15
                <span className="ml-1 text-sm font-sans font-medium text-bark-500">
                  Brix
                </span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-bark-500">
                수확 전 당도를 재고 기준에 못 미치면 며칠 더 둡니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
