import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <div className="max-w-xl">
      <p
        className={`text-xs font-semibold tracking-[0.18em] uppercase ${
          isDark ? "text-peach-300" : "text-peach-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] leading-[1.25] font-bold ${
          isDark ? "text-cream-50" : "text-bark-900"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-5 leading-[1.85] break-keep ${
            isDark ? "text-cream-200/65" : "text-bark-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
