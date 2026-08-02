import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/app/admin/admin-header";
import { StatCard } from "@/app/admin/stat-card";
import { LineChart, type ChartPoint } from "@/app/admin/stats/line-chart";
import { dayShortLabel } from "@/lib/kst";
import {
  STATS_RANGES,
  STATS_RANGE_LABEL,
  fetchDailyStats,
  parseStatsRange,
} from "@/lib/order-stats";
import { formatPrice } from "@/lib/products";
import { requireAdmin } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "판매 통계",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdmin();

  const { days: daysParam } = await searchParams;
  const range = parseStatsRange(daysParam);
  const stats = await fetchDailyStats(range);

  const boxPoints: ChartPoint[] = stats.map((stat) => ({
    date: stat.date,
    label: dayShortLabel(stat.dayStart),
    value: stat.boxes,
  }));
  const revenuePoints: ChartPoint[] = stats.map((stat) => ({
    date: stat.date,
    label: dayShortLabel(stat.dayStart),
    value: stat.revenue,
  }));

  const orders = stats.reduce((sum, stat) => sum + stat.orders, 0);
  const boxes = stats.reduce((sum, stat) => sum + stat.boxes, 0);
  const revenue = stats.reduce((sum, stat) => sum + stat.revenue, 0);
  const activeDays = stats.filter((stat) => stat.orders > 0).length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminHeader current="/admin/stats" />

      <nav className="mt-8 flex flex-wrap gap-2">
        {STATS_RANGES.map((value) => (
          <Link
            key={value}
            href={`/admin/stats?days=${value}`}
            className={
              value === range
                ? "rounded-full bg-bark-900 px-4 py-2 text-sm font-medium text-cream-50"
                : "rounded-full px-4 py-2 text-sm text-bark-500 ring-1 ring-cream-300 transition-colors hover:text-bark-900"
            }
          >
            {STATS_RANGE_LABEL[value]}
          </Link>
        ))}
      </nav>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="주문" value={`${orders}건`} />
        <StatCard label="판매량" value={`${boxes}박스`} />
        <StatCard label="수익" value={formatPrice(revenue)} />
        <StatCard
          label="주문이 있던 날"
          value={`${activeDays}일`}
          hint={`전체 ${stats.length}일 중`}
        />
      </div>

      <p className="mt-3 text-xs text-bark-400">
        취소한 주문은 빼고 셉니다. 날짜는 한국 시간 기준입니다.
      </p>

      <div className="mt-5 space-y-4">
        <LineChart title="일별 판매량" points={boxPoints} format="boxes" />
        <LineChart title="일별 수익" points={revenuePoints} format="won" />
      </div>
    </div>
  );
}
