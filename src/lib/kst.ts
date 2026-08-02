/**
 * 한국 시간(UTC+9) 계산.
 *
 * Intl은 실행 환경의 로케일 데이터에 따라 결과가 달라질 수 있어 쓰지 않고,
 * UTC에 9시간을 더해 직접 조립한다.
 */

export const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** 2026-08-03 00:10 (한국 시간). 파싱할 수 없는 값이면 빈 문자열. */
export function formatKst(iso: string): string {
  const utc = new Date(iso);
  if (Number.isNaN(utc.getTime())) return "";

  const kst = new Date(utc.getTime() + KST_OFFSET_MS);

  return (
    `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())}` +
    ` ${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}`
  );
}

/**
 * 어느 시각이 속한 한국 날짜의 자정을 epoch 밀리초로 돌려준다.
 * 이 값을 그대로 `new Date()`에 넣으면 UTC 필드가 곧 한국 날짜가 된다.
 */
export function kstDayStart(ms: number): number {
  return Math.floor((ms + KST_OFFSET_MS) / DAY_MS) * DAY_MS;
}

/** kstDayStart 값 → "2026-08-03" */
export function dayKey(dayStart: number): string {
  const date = new Date(dayStart);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** kstDayStart 값 → "8/3" */
export function dayShortLabel(dayStart: number): string {
  const date = new Date(dayStart);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}
