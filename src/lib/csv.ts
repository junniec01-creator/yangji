/** 엑셀이 한글을 깨뜨리지 않도록 붙이는 UTF-8 BOM. */
const UTF8_BOM = "﻿";

/**
 * 셀 하나를 CSV 규칙에 맞게 감싼다.
 * `=`, `+`, `-`, `@`로 시작하는 값은 엑셀이 수식으로 해석하므로
 * 작은따옴표를 앞에 붙여 문자열로 고정한다.
 */
function escapeCell(value: unknown): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ];
  // 엑셀은 CRLF를 기대한다.
  return UTF8_BOM + lines.join("\r\n") + "\r\n";
}

/** 2026-08-03 00:10 (한국 시간) */
export function formatKst(iso: string): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}
