import { SectionHeading } from "@/components/section-heading";
import { ORDER_STEPS, SHIPPING } from "@/lib/products";

export function OrderGuideSection() {
  return (
    <section
      id="guide"
      className="scroll-mt-16 bg-bark-900 py-20 text-cream-50 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="How to order"
          tone="dark"
          title="주문부터 도착까지"
          description="지금은 계좌이체만 받고 있습니다. 카드 결제는 준비되는 대로 안내드리겠습니다."
        />

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {ORDER_STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-peach-500/15 text-sm font-semibold text-peach-300 tabular-nums">
                {index + 1}
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-cream-50">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm leading-[1.8] text-cream-200/60 break-keep">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
          <div className="bg-bark-900 px-7 py-6">
            <p className="text-sm font-semibold text-cream-50">발송 일정</p>
            <p className="mt-2 text-sm leading-[1.8] text-cream-200/60 break-keep">
              {SHIPPING.leadTimeLabel} · {SHIPPING.courierLabel}
            </p>
          </div>
          <div className="bg-bark-900 px-7 py-6">
            <p className="text-sm font-semibold text-cream-50">
              받으신 다음에는
            </p>
            <p className="mt-2 text-sm leading-[1.8] text-cream-200/60 break-keep">
              상온에 하루 이틀 두었다가 드시면 가장 답니다. 바로 냉장하면 단맛이
              덜 오릅니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
