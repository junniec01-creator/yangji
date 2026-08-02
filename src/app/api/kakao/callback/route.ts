import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  STATE_COOKIE,
  exchangeCode,
  fetchKakaoProfile,
  upsertRecipient,
} from "@/lib/kakao";
import { requireAdmin } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

/**
 * 카카오 로그인에서 돌아오는 자리.
 * 받은 코드를 토큰으로 바꿔 수신자로 등록한다. 같은 사람이 다시 연결하면
 * 행이 늘지 않고 토큰만 갱신된다.
 */
export async function GET(request: NextRequest) {
  await requireAdmin();

  const params = request.nextUrl.searchParams;
  const jar = await cookies();
  const expectedState = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);

  // redirect는 예외를 던지므로 결과를 먼저 정한 뒤 마지막에 한 번만 호출한다.
  let result = "ok";

  if (params.get("error")) {
    console.error("카카오 연결 거부:", params.get("error") ?? "");
    result = "denied";
  } else {
    const code = params.get("code");
    const state = params.get("state");

    if (!code || !state || state !== expectedState) {
      result = "state";
    } else {
      const token = await exchangeCode(code);
      const profile = token ? await fetchKakaoProfile(token.access_token) : null;

      if (!token || !profile) {
        result = "fail";
      } else {
        const saved = await upsertRecipient({
          kakaoUserId: profile.id,
          nickname: profile.nickname,
          refreshToken: token.refresh_token ?? "",
          accessToken: token.access_token,
          expiresIn: token.expires_in,
        });
        result = saved ? "ok" : "fail";
      }
    }
  }

  redirect(`/admin/settings?kakao=${result}`);
}
