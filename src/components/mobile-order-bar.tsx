import Link from "next/link";
import { BOX_OPTIONS, formatPrice } from "@/lib/products";

const lowestPrice = Math.min(...BOX_OPTIONS.map((box) => box.price));

/** 모바일에서만 화면 하단에 붙는 주문 CTA. */
export function MobileOrderBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-cream-200 bg-cream-50/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
      <div className="flex items-center gap-4">
        <div className="min-w-0">
          <p className="text-[0.6875rem] text-bark-400">소과 박스부터</p>
          <p className="text-lg leading-tight font-semibold text-bark-900 tabular-nums">
            {formatPrice(lowestPrice)}
          </p>
        </div>
        <Link
          href="/order"
          className="flex h-12 flex-1 items-center justify-center rounded-full bg-peach-500 text-sm font-semibold text-white"
        >
          주문하기
        </Link>
      </div>
    </div>
  );
}
