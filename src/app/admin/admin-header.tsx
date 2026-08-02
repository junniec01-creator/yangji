import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { BrandMark } from "@/components/brand-mark";
import { SITE } from "@/lib/products";

const TABS = [
  { href: "/admin", label: "주문 목록" },
  { href: "/admin/stats", label: "통계" },
] as const;

export function AdminHeader({ current }: { current: string }) {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-7 w-7" />
          <h1 className="font-display text-xl font-bold text-bark-900">
            {SITE.farmName} 주문 관리
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-bark-400 transition-colors hover:text-bark-900"
          >
            사이트 보기
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full px-4 py-2 text-sm text-bark-500 ring-1 ring-cream-300 transition-colors hover:text-bark-900"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <nav className="mt-6 flex gap-1 border-b border-cream-200">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              tab.href === current
                ? "-mb-px border-b-2 border-peach-500 px-4 py-2.5 text-sm font-semibold text-bark-900"
                : "-mb-px border-b-2 border-transparent px-4 py-2.5 text-sm text-bark-400 transition-colors hover:text-bark-700"
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
