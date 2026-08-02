import type { Metadata } from "next";
import { AdminHeader } from "@/app/admin/admin-header";
import { SettingsForm } from "@/app/admin/settings-form";
import { getSiteSettings } from "@/lib/site-settings";
import { requireAdmin } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "사이트 설정",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <AdminHeader current="/admin/settings" />

      <div className="mt-8">
        {settings ? (
          <SettingsForm settings={settings} />
        ) : (
          <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 ring-1 ring-red-200">
            사이트 설정을 불러오지 못했습니다.
          </p>
        )}
      </div>
    </div>
  );
}
