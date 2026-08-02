import "server-only";
import { DAY_MS, dayKey, kstDayStart } from "@/lib/kst";
import { createServiceClient } from "@/lib/supabase";

export interface DailyStat {
  /** 한국 날짜 자정의 epoch 밀리초. 눈금 라벨을 만들 때 쓴다. */
  dayStart: number;
  /** "2026-08-03" */
  date: string;
  orders: number;
  boxes: number;
  revenue: number;
}

export const STATS_RANGES = [7, 30, 90, 0] as const;

export type StatsRange = (typeof STATS_RANGES)[number];

/** 0은 "전체 기간"을 뜻한다. */
export const STATS_RANGE_LABEL: Record<StatsRange, string> = {
  7: "최근 7일",
  30: "최근 30일",
  90: "최근 90일",
  0: "전체",
};

export const DEFAULT_STATS_RANGE: StatsRange = 30;

export function parseStatsRange(value: string | null | undefined): StatsRange {
  const parsed = Number(value);
  return STATS_RANGES.includes(parsed as StatsRange)
    ? (parsed as StatsRange)
    : DEFAULT_STATS_RANGE;
}

/**
 * 주문이 없는 날도 0으로 채운 일별 집계. 취소는 빼고 센다.
 * days가 0이면 첫 주문일부터 오늘까지 전부 돌려준다.
 */
export async function fetchDailyStats(days: StatsRange): Promise<DailyStat[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("quantity, total_price, created_at")
    .neq("status", "cancelled");

  if (error) {
    console.error("일별 집계 조회 실패:", error.message);
    return [];
  }

  const buckets = new Map<number, { orders: number; boxes: number; revenue: number }>();
  let earliest = Number.POSITIVE_INFINITY;

  for (const row of data ?? []) {
    const created = new Date(row.created_at).getTime();
    if (Number.isNaN(created)) continue;

    const dayStart = kstDayStart(created);
    earliest = Math.min(earliest, dayStart);

    const bucket = buckets.get(dayStart) ?? { orders: 0, boxes: 0, revenue: 0 };
    bucket.orders += 1;
    bucket.boxes += row.quantity;
    bucket.revenue += row.total_price;
    buckets.set(dayStart, bucket);
  }

  const today = kstDayStart(Date.now());
  const from =
    days > 0
      ? today - (days - 1) * DAY_MS
      : Number.isFinite(earliest)
        ? Math.min(earliest, today)
        : today;

  const stats: DailyStat[] = [];
  for (let dayStart = from; dayStart <= today; dayStart += DAY_MS) {
    const bucket = buckets.get(dayStart);
    stats.push({
      dayStart,
      date: dayKey(dayStart),
      orders: bucket?.orders ?? 0,
      boxes: bucket?.boxes ?? 0,
      revenue: bucket?.revenue ?? 0,
    });
  }

  return stats;
}
