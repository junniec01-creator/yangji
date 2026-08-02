import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  STATE_COOKIE,
  buildAuthorizeUrl,
  isKakaoConfigured,
} from "@/lib/kakao";
import { requireAdmin } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

/** 관리자를 카카오 로그인으로 보낸다. 돌아오는 곳은 /api/kakao/callback. */
export async function GET() {
  await requireAdmin();

  if (!isKakaoConfigured()) redirect("/admin/settings?kakao=unconfigured");

  const state = crypto.randomUUID();
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(buildAuthorizeUrl(state));
}
