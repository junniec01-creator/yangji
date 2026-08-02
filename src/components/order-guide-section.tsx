import { ORDER_STEPS, SHIPPING } from "@/lib/products";

export function OrderGuideSection() {
  return (
    <section id="guide" className="scroll-mt-20 bg-bark-900 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-widest text-peach-300 uppercase">
            How to order
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-snug font-semibold text-balance text-cream-50 sm:text-4xl">
            주문부터 도착까지
          </h2>
          <p className="mt-4 leading-relaxed text-cream-200/70">
            지금은 계좌이체만 받고 있습니다. 카드 결제는 준비되는 대로
            안내드리겠습니다.
          </p>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ORDER_STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-white/15 pt-6">
              <span className="font-serif text-sm font-semibold text-peach-300">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-cream-50">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-200/70">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <p className="rounded-2xl bg-white/5 px-6 py-5 text-sm leading-relaxed text-cream-200/80">
            <span className="block font-semibold text-cream-50">발송 일정</span>
            {SHIPPING.leadTimeLabel} · {SHIPPING.courierLabel}
          </p>
          <p className="rounded-2xl bg-white/5 px-6 py-5 text-sm leading-relaxed text-cream-200/80">
            <span className="block font-semibold text-cream-50">
              받으신 다음에는
            </span>
            상온에 하루 이틀 두었다가 드시면 가장 답니다. 바로 냉장하면 단맛이 덜
            오릅니다.
          </p>
        </div>
      </div>
    </section>
  );
}
