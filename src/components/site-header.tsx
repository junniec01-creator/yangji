import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SITE } from "@/lib/products";

const NAV_ITEMS = [
  { href: "/#peaches", label: "복숭아 소개" },
  { href: "/#boxes", label: "박스 규격" },
  { href: "/#guide", label: "주문·배송" },
  { href: "/#faq", label: "자주 묻는 질문" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-200/70 bg-cream-50/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
        >
          <BrandMark className="h-7 w-7" />
          <span className="font-display text-lg font-bold text-bark-900">
            {SITE.farmName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[0.9375rem] text-bark-500 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-bark-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/order"
          className="hidden h-10 items-center rounded-full bg-bark-900 px-5 text-sm font-medium text-cream-50 transition-colors hover:bg-bark-800 sm:inline-flex"
        >
          주문하기
        </Link>
      </div>
    </header>
  );
}
