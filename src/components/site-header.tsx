import Link from "next/link";
import { SITE } from "@/lib/products";

const NAV_ITEMS = [
  { href: "#peaches", label: "복숭아 소개" },
  { href: "#boxes", label: "박스 규격" },
  { href: "#guide", label: "주문·배송" },
  { href: "#faq", label: "자주 묻는 질문" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-200/80 bg-cream-50/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-bark-900 transition-opacity hover:opacity-70"
        >
          <span
            aria-hidden
            className="h-7 w-7 rounded-full bg-gradient-to-br from-peach-300 to-peach-500"
          />
          <span className="font-serif text-lg font-semibold tracking-tight">
            {SITE.farmName}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-bark-600 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-peach-600"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href="/order"
          className="hidden rounded-full bg-peach-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-peach-500/25 transition-colors hover:bg-peach-600 sm:inline-flex"
        >
          주문하기
        </Link>
      </div>
    </header>
  );
}
