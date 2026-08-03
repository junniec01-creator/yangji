import { formatPrice } from "@/lib/products";

export type ChartFormat = "boxes" | "won";

export interface ChartPoint {
  /** "8/3" */
  label: string;
  /** "2026-08-03" — 표 보기와 key에 쓴다. */
  date: string;
  value: number;
}

const VIEW_W = 720;
const VIEW_H = 240;
const PAD = { top: 26, right: 14, bottom: 26, left: 56 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;
const BASELINE = PAD.top + PLOT_H;
const TICKS = 4;

/** 눈금 간격을 보기 좋은 수로 올림한다. */
function niceStep(value: number): number {
  if (value <= 0) return 1;
  const base = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]) {
    if (value <= step * base) return step * base;
  }
  return 10 * base;
}

/** 눈금이 딱 떨어지도록 간격을 먼저 정하고 최대값을 그 배수로 잡는다. */
export function axisMax(peak: number, format: ChartFormat): number {
  const step = niceStep(peak / TICKS);
  // 박스는 개수라 소수 눈금이 나오면 안 된다.
  return (format === "boxes" ? Math.max(1, Math.ceil(step)) : step) * TICKS;
}

function axisLabel(value: number, format: ChartFormat): string {
  if (format === "boxes" || value < 10000) return String(value);
  const man = value / 10000;
  return `${Number.isInteger(man) ? man : Math.round(man * 10) / 10}만`;
}

function valueLabel(value: number, format: ChartFormat): string {
  return format === "boxes" ? `${value}박스` : formatPrice(value);
}

/**
 * 단일 계열 꺾은선. 계열이 하나뿐이라 범례 대신 제목이 이름을 대신하고,
 * 색은 브랜드 강조색 하나만 쓴다.
 *
 * 관리자 화면은 서버에서 그리므로 자바스크립트 없이 CSS만으로 호버 읽기를 만든다.
 */
export function LineChart({
  title,
  points,
  format,
  sharedMax,
}: {
  title: string;
  points: ChartPoint[];
  format: ChartFormat;
  /**
   * 두 그래프를 나란히 놓고 눈으로 비교할 때는 세로축을 맞춰야 한다.
   * 각자 축을 잡으면 3박스와 30박스가 같은 높이로 그려져 잘못 읽힌다.
   */
  sharedMax?: number;
}) {
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const peak = points.reduce((max, point) => Math.max(max, point.value), 0);
  const max = sharedMax ?? axisMax(peak, format);
  const count = points.length;

  const xOf = (index: number) =>
    count <= 1
      ? PAD.left + PLOT_W / 2
      : PAD.left + (index * PLOT_W) / (count - 1);
  const yOf = (value: number) => BASELINE - (value / max) * PLOT_H;

  const coords = points.map((point, index) => ({
    ...point,
    x: xOf(index),
    y: yOf(point.value),
  }));

  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = coords.length
    ? [
        `M ${coords[0].x},${BASELINE}`,
        ...coords.map((point) => `L ${point.x},${point.y}`),
        `L ${coords[coords.length - 1].x},${BASELINE}`,
        "Z",
      ].join(" ")
    : "";

  const band = count <= 1 ? PLOT_W : PLOT_W / (count - 1);

  // 라벨이 겹치지 않도록 최대 5개만 고른다.
  const labelSlots = Math.min(5, count);
  const labelled = new Set(
    Array.from({ length: labelSlots }, (_, slot) =>
      labelSlots <= 1 ? 0 : Math.round((slot * (count - 1)) / (labelSlots - 1)),
    ),
  );

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-cream-200 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-bold text-bark-900">
          {title}
        </h2>
        <p className="text-sm text-bark-400">
          기간 합계{" "}
          <span className="font-semibold text-bark-800 tabular-nums">
            {valueLabel(total, format)}
          </span>
        </p>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={`${title} 꺾은선 그래프. 자세한 수치는 아래 표로 보기에 있습니다.`}
        className="mt-4 h-auto w-full"
      >
        {Array.from({ length: TICKS + 1 }, (_, tick) => {
          const value = (max * (TICKS - tick)) / TICKS;
          const y = yOf(value);
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={PAD.left + PLOT_W}
                y1={y}
                y2={y}
                className="stroke-cream-200"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={PAD.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                className="fill-bark-300 tabular-nums"
              >
                {axisLabel(value, format)}
              </text>
            </g>
          );
        })}

        {coords.map((point, index) =>
          labelled.has(index) ? (
            <text
              key={`x-${point.date}`}
              x={point.x}
              y={VIEW_H - 8}
              textAnchor={
                index === 0 ? "start" : index === count - 1 ? "end" : "middle"
              }
              fontSize={11}
              className="fill-bark-300 tabular-nums"
            >
              {point.label}
            </text>
          ) : null,
        )}

        {area && <path d={area} className="fill-peach-500/10" />}

        <polyline
          points={line}
          fill="none"
          className="stroke-peach-500"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* 점이 하나뿐이면 선이 그려지지 않으므로 점을 찍어 준다 */}
        {count === 1 && (
          <circle
            cx={coords[0].x}
            cy={coords[0].y}
            r={4}
            className="fill-peach-500"
          />
        )}

        {coords.map((point) => {
          // 이웃한 점끼리 판정 영역이 겹치면 뒤에 그린 쪽이 앞을 가린다.
          const from = Math.max(PAD.left, point.x - band / 2);
          const to = Math.min(PAD.left + PLOT_W, point.x + band / 2);

          return (
            <g key={`hover-${point.date}`} className="group/point">
              <rect
                x={from}
                y={PAD.top}
                width={to - from}
                height={PLOT_H}
                fill="transparent"
              />
              <line
                x1={point.x}
                x2={point.x}
                y1={PAD.top}
                y2={BASELINE}
                className="stroke-cream-300 opacity-0 group-hover/point:opacity-100"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={4.5}
                className="fill-white stroke-peach-500 opacity-0 group-hover/point:opacity-100"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={PAD.left}
                y={15}
                fontSize={12}
                className="fill-bark-700 opacity-0 group-hover/point:opacity-100 tabular-nums"
              >
                {point.label} · {valueLabel(point.value, format)}
              </text>
            </g>
          );
        })}
      </svg>

      <details className="mt-4">
        <summary className="cursor-pointer text-xs text-bark-400 transition-colors hover:text-bark-700">
          표로 보기
        </summary>
        <div className="mt-3 max-h-64 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="text-xs text-bark-400">
                <th className="py-1.5 font-medium">날짜</th>
                <th className="py-1.5 text-right font-medium">{title}</th>
              </tr>
            </thead>
            <tbody className="text-bark-700">
              {points.map((point) => (
                <tr key={point.date} className="border-t border-cream-200">
                  <td className="py-1.5 tabular-nums">{point.date}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {valueLabel(point.value, format)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
