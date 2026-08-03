import type { Metadata } from "next";
import { AdminHeader } from "@/app/admin/admin-header";
import { KakaoSection } from "@/app/admin/kakao-section";
import { SellerAccountForm } from "@/app/admin/seller-account-form";
import { SettingsForm } from "@/app/admin/settings-form";
import { isKakaoConfigured, listRecipients } from "@/lib/kakao";
import { SELLERS } from "@/lib/products";
import { getSellerAccounts } from "@/lib/seller-settings";
import { getSiteSettings } from "@/lib/site-settings";
import { requireAdmin } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "사이트 설정",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ kakao?: string; why?: string }>;
}) {
  await requireAdmin();

  const configured = isKakaoConfigured();

  const [{ kakao, why }, settings, accounts, recipients] = await Promise.all([
    searchParams,
    getSiteSettings(),
    getSellerAccounts(),
    configured ? listRecipients() : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <AdminHeader current="/admin/settings" />

      <div className="mt-8 space-y-4">
        {settings ? (
          <SettingsForm settings={settings} />
        ) : (
          <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 ring-1 ring-red-200">
            사이트 설정을 불러오지 못했습니다.
          </p>
        )}

        <section className="rounded-3xl bg-white p-6 ring-1 ring-cream-200 sm:p-7">
          <h2 className="font-display text-lg font-bold text-bark-900">
            판매자별 입금 계좌
          </h2>
          <p className="mt-1.5 text-sm text-bark-500 break-keep">
            손님이 주문서에서 고른 판매자에 따라 주문 완료 화면에 여기 계좌가
            안내됩니다. 비워 두면 계좌 대신 연락 안내가 나갑니다.
          </p>

          <div className="mt-5 space-y-3">
            {SELLERS.map((seller) => {
              const account = accounts.find(
                (item) => item.sellerId === seller.id,
              );
              if (!account) return null;
              return (
                <SellerAccountForm
                  key={seller.id}
                  name={seller.name}
                  account={account}
                />
              );
            })}
          </div>
        </section>

        <KakaoSection
          recipients={recipients}
          configured={configured}
          result={kakao}
          reason={why}
        />
      </div>
    </div>
  );
}
