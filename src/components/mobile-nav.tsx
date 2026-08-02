"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * 모바일·태블릿 헤더 메뉴.
 *
 * <details>로 만든 이유는 자바스크립트가 붙기 전에도 열고 닫히게 하기 위해서다.
 * 하이드레이션이 끝나면 링크를 누르거나 바깥·ESC를 눌렀을 때 닫히는 동작이 더해진다.
 */
export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const element = detailsRef.current;
      if (element?.open && !element.contains(event.target as Node)) {
        element.open = false;
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={detailsRef} className="relative lg:hidden">
      <summary
        aria-label="메뉴 열기"
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full text-bark-700 ring-1 ring-cream-300 transition-colors hover:text-bark-900 [&::-webkit-details-marker]:hidden"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="h-5 w-5"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </summary>

      <div className="absolute top-[calc(100%+0.625rem)] right-0 w-60 rounded-2xl bg-cream-50 p-2 ring-1 shadow-[0_24px_60px_-24px] ring-cream-200 shadow-bark-900/40">
        <nav className="flex flex-col">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="rounded-xl px-4 py-3 text-[0.9375rem] text-bark-600 transition-colors hover:bg-cream-100 hover:text-bark-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/order"
          onClick={close}
          className="mt-1.5 flex h-11 items-center justify-center rounded-xl bg-bark-900 text-sm font-medium text-cream-50 transition-colors hover:bg-bark-800"
        >
          주문하기
        </Link>
      </div>
    </details>
  );
}
