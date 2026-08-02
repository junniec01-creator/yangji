import { SITE } from "@/lib/products";

export function SiteFooter() {
  return (
    <footer className="border-t border-cream-200 bg-cream-100/60 pb-24 sm:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-6 w-6 rounded-full bg-gradient-to-br from-peach-300 to-peach-500"
          />
          <span className="font-serif text-base font-semibold text-bark-900">
            {SITE.farmName}
          </span>
        </div>

        <dl className="mt-6 grid gap-x-10 gap-y-2 text-sm text-bark-500 sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="shrink-0 text-bark-400">대표</dt>
            <dd>{SITE.ownerName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-bark-400">연락처</dt>
            <dd>{SITE.phone}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-bark-400">주소</dt>
            <dd>{SITE.address}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-bark-400">사업자등록번호</dt>
            <dd>{SITE.businessNumber}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-bark-400">통신판매업신고</dt>
            <dd>{SITE.mailOrderNumber}</dd>
          </div>
        </dl>

        <p className="mt-8 text-xs text-bark-400">
          © {SITE.farmName}. 사진과 문구는 준비 중인 예시입니다.
        </p>
      </div>
    </footer>
  );
}
