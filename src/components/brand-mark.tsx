/** 복숭아를 단순화한 로고 마크. 사진이 준비되기 전까지 브랜드 역할을 한다. */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 29c-6.1 0-11-4.4-11-10.3C5 13.2 9.4 9 16 9s11 4.2 11 9.7C27 24.6 22.1 29 16 29Z"
        fill="url(#peach-body)"
      />
      <path
        d="M16 9.6c-1.6 3.4-1.8 7.3-.6 11"
        stroke="#a83a22"
        strokeOpacity="0.25"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M16.6 8.7c.3-3 2.5-5.3 5.6-5.7.4 3.2-1.9 5.9-5.6 5.7Z"
        fill="#6b8f5e"
      />
      <defs>
        <linearGradient
          id="peach-body"
          x1="7"
          y1="10"
          x2="25"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fca287" />
          <stop offset="1" stopColor="#e9613f" />
        </linearGradient>
      </defs>
    </svg>
  );
}
