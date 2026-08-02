import { BoxSection } from "@/components/box-section";
import { ClosingCta } from "@/components/closing-cta";
import { FaqSection } from "@/components/faq-section";
import { HeroSection } from "@/components/hero-section";
import { MobileOrderBar } from "@/components/mobile-order-bar";
import { OrderGuideSection } from "@/components/order-guide-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VarietySection } from "@/components/variety-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <VarietySection />
        <BoxSection />
        <OrderGuideSection />
        <FaqSection />
        <ClosingCta />
      </main>
      <SiteFooter />
      {/* 모바일 하단 고정 버튼에 푸터가 가리지 않도록 띄운다 */}
      <div aria-hidden className="h-20 sm:hidden" />
      <MobileOrderBar />
    </>
  );
}
