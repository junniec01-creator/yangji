import { SectionHeading } from "@/components/section-heading";
import { FAQS } from "@/lib/products";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-16 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" />

        <div className="mt-12 border-t border-cream-200">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group border-b border-cream-200 py-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-medium text-bark-800 transition-colors hover:text-peach-600 break-keep">
                {faq.q}
                <span
                  aria-hidden
                  className="relative h-4 w-4 shrink-0 text-peach-500"
                >
                  <span className="absolute top-1/2 left-0 h-px w-4 -translate-y-1/2 bg-current" />
                  <span className="absolute top-0 left-1/2 h-4 w-px -translate-x-1/2 bg-current transition-transform group-open:rotate-90 group-open:opacity-0" />
                </span>
              </summary>
              <p className="mt-4 pr-10 leading-[1.85] text-bark-500 break-keep">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
