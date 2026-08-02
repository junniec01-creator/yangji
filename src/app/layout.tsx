import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/products";

// 한글 폰트는 Google Fonts가 unicode-range 단위로 쪼개어 제공한다.
// next/font의 `subsets`에는 한글 서브셋 이름이 없으므로 `preload: false`로
// 전체 서브셋을 받아 두고, 브라우저가 필요한 구간만 내려받게 한다.
const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  preload: false,
  display: "swap",
});

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.farmName} · ${SITE.tagline}`,
    template: `%s | ${SITE.farmName}`,
  },
  description: SITE.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffcf8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
