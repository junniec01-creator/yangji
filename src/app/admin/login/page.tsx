import type { Metadata } from "next";
import { LoginForm } from "@/app/admin/login/login-form";
import { SITE } from "@/lib/products";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold tracking-[0.18em] text-peach-600 uppercase">
          Admin
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold text-bark-900">
          {SITE.farmName} 관리자
        </h1>
        <p className="mt-2.5 text-sm text-bark-400">
          주문 확인과 사이트 설정을 위한 화면입니다.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
