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
        <p className="text-sm font-semibold tracking-widest text-peach-600 uppercase">
          Admin
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-bark-900">
          {SITE.farmName} 관리자
        </h1>
        <p className="mt-2 text-sm text-bark-500">
          주문 확인과 사이트 설정을 위한 화면입니다.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
