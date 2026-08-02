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
      className={`flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-cream-300 bg-cream-100 text-center ${className}`}
    >
      <span
        aria-hidden
        className="h-10 w-10 rounded-full bg-peach-200 ring-4 ring-peach-100"
      />
      <span className="px-6 text-xs leading-relaxed text-bark-400">{label}</span>
    </div>
  );
}
