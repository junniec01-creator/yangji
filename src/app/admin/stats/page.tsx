import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/app/admin/admin-header";
import { StatCard } from "@/app/admin/stat-card";
import { LineChart, axisMax, type ChartPoint } from "@/app/admin/stats/line-chart";
import { dayShortLabel } from "@/lib/kst";
import {
  STATS_RANGES,
  STATS_RANGE_LABEL,
  fetchDailyStats,
  parseStatsRange,
  type DailyStat,
} from "@/lib/order-stats";
import { SELLERS, formatPrice } from "@/lib/products";
import { requireAdmin } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "판매 통계",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface SellerStats {
  name: string;
  daily: DailyStat[];
  orders: number;
  boxes: number;
  revenue: number;
}

function toPoints(daily: DailyStat[], pick: (stat: DailyStat) => number) {
  return daily.map<ChartPoint>((stat) => ({
    date: stat.date,
    label: dayShortLabel(stat.dayStart),
    value: pick(stat),
  }));
}

function peakOf(all: SellerStats[], pick: (stat: DailyStat) => number) {
  return all.reduce(
    (max, seller) =>
      seller.daily.reduce((inner, stat) => Math.max(inner, pick(stat)), max),
    0,
  );
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdmin();

  const { days: daysParam } = await searchParams;
  const range = parseStatsRange(daysParam);

  const perSeller = await Promise.all(
    SELLERS.map(async (seller) => {
      const daily = await fetchDailyStats(range, seller.id);
      return {
        name: seller.name,
        daily,
        orders: daily.reduce((sum, stat) => sum + stat.orders, 0),
        boxes: daily.reduce((sum, stat) => sum + stat.boxes, 0),
        revenue: daily.reduce((sum, stat) => sum + stat.revenue, 0),
      } satisfies SellerStats;
    }),
  );

  const totalOrders = perSeller.reduce((sum, s) => sum + s.orders, 0);
  const totalBoxes = perSeller.reduce((sum, s) => sum + s.boxes, 0);
  const totalRevenue = perSeller.reduce((sum, s) => sum + s.revenue, 0);
  const days = perSeller[0]?.daily.length ?? 0;

  // 나란히 놓은 그래프끼리 축을 맞춘다.
  const boxMax = axisMax(peakOf(perSeller, (stat) => stat.boxes), "boxes");
  const wonMax = axisMax(peakOf(perSeller, (stat) => stat.revenue), "won");

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

      {/* 정산에 바로 쓰는 숫자라 맨 위에 크게 둔다. */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {perSeller.map((seller) => (
          <div
            key={seller.name}
            className="rounded-2xl bg-peach-500 px-6 py-5 text-white"
          >
            <p className="text-sm font-semibold text-white/80">{seller.name}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {formatPrice(seller.revenue)}
            </p>
            <p className="mt-1.5 text-sm text-white/80 tabular-nums">
              {seller.orders}건 · {seller.boxes}박스
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="전체 주문" value={`${totalOrders}건`} />
        <StatCard label="전체 판매량" value={`${totalBoxes}박스`} />
        <StatCard label="전체 수익" value={formatPrice(totalRevenue)} />
        <StatCard label="집계 기간" value={`${days}일`} />
      </div>

      <p className="mt-3 text-xs text-bark-400">
        취소한 주문은 빼고 셉니다. 날짜는 한국 시간 기준이고, 나란히 놓은 두
        그래프는 세로축을 맞춰 두었습니다.
      </p>

      <ChartRow title="일별 판매량">
        {perSeller.map((seller) => (
          <LineChart
            key={seller.name}
            title={seller.name}
            points={toPoints(seller.daily, (stat) => stat.boxes)}
            format="boxes"
            sharedMax={boxMax}
          />
        ))}
      </ChartRow>

      <ChartRow title="일별 수익">
        {perSeller.map((seller) => (
          <LineChart
            key={seller.name}
            title={seller.name}
            points={toPoints(seller.daily, (stat) => stat.revenue)}
            format="won"
            sharedMax={wonMax}
          />
        ))}
      </ChartRow>
    </div>
  );
}

function ChartRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-bold text-bark-900">{title}</h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}
