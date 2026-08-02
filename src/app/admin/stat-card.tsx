export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4 ring-1 ring-cream-200">
      <p className="text-xs text-bark-400">{label}</p>
      <p className="mt-1.5 text-xl font-semibold text-bark-900 tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-bark-300">{hint}</p>}
    </div>
  );
}
