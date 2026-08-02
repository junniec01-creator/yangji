import { FAQS } from "@/lib/products";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-sm font-semibold tracking-widest text-peach-600 uppercase">
          FAQ
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-snug font-semibold text-bark-900 sm:text-4xl">
          자주 묻는 질문
        </h2>

        <div className="mt-10 divide-y divide-cream-200 border-y border-cream-200">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-bark-800 transition-colors hover:text-peach-600">
                {faq.q}
                <span
                  aria-hidden
                  className="shrink-0 text-xl leading-none text-peach-500 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 pr-8 leading-relaxed text-bark-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
