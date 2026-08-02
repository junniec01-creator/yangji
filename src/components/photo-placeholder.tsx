/**
 * 실제 농장 사진이 준비되기 전까지 자리를 잡아 두는 블록.
 * 사진을 받으면 이 컴포넌트를 next/image로 교체한다.
 */
export function PhotoPlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-cream-100 text-center ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,var(--color-peach-100),transparent_60%)]"
      />
      <span
        aria-hidden
        className="relative h-12 w-12 rounded-full bg-white/70 ring-1 ring-cream-300"
      />
      <span className="relative max-w-[16rem] px-6 text-xs leading-relaxed text-bark-400">
        {label}
      </span>
    </div>
  );
}
