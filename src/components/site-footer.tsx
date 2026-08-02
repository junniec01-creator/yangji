import { BrandMark } from "@/components/brand-mark";
import { SITE } from "@/lib/products";

export function SiteFooter() {
  return (
    <footer className="border-t border-cream-200">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-6 w-6" />
            <span className="font-display text-base font-bold text-bark-900">
              {SITE.farmName}
            </span>
          </div>

          <dl className="grid gap-x-12 gap-y-2.5 text-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 text-bark-300">대표</dt>
              <dd className="text-bark-500">{SITE.ownerName}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 text-bark-300">연락처</dt>
              <dd className="text-bark-500 tabular-nums">{SITE.phone}</dd>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <dt className="w-12 shrink-0 text-bark-300">주소</dt>
              <dd className="text-bark-500">{SITE.address}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-12 text-xs text-bark-300">
          © {SITE.farmName}. 사진과 문구는 준비 중인 예시입니다.
        </p>
      </div>
    </footer>
  );
}
