import type { Metadata, Viewport } from "next";
import { Gowun_Batang, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/products";
import { getSiteUrl } from "@/lib/site-url";

// 한글 폰트는 Google Fonts가 unicode-range 단위로 쪼개어 제공한다.
// next/font의 `subsets`에는 한글 서브셋 이름이 없으므로 `preload: false`로
// 전체 서브셋을 받아 두고, 브라우저가 필요한 구간만 내려받게 한다.
const plexKr = IBM_Plex_Sans_KR({
  variable: "--font-plex-kr",
  weight: ["300", "400", "500", "600", "700"],
  preload: false,
  display: "swap",
});

const gowun = Gowun_Batang({
  variable: "--font-gowun",
  weight: ["400", "700"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE.farmName} · ${SITE.tagline}`,
    template: `%s | ${SITE.farmName}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE.farmName,
    title: `${SITE.farmName} · ${SITE.tagline}`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdfbf8",
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
      className={`${plexKr.variable} ${gowun.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
