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
  let reason = "";

  if (params.get("error")) {
    reason = [params.get("error"), params.get("error_description")]
      .filter(Boolean)
      .join(" · ");
    console.error("카카오 연결 거부:", reason);
    result = "denied";
  } else {
    const code = params.get("code");
    const state = params.get("state");

    if (!code || !state || state !== expectedState) {
      result = "state";
    } else {
      const token = await exchangeCode(code);

      if (!token.ok) {
        result = "fail";
        reason = token.reason;
      } else {
        const profile = await fetchKakaoProfile(token.value.access_token);

        if (!profile.ok) {
          result = "fail";
          reason = profile.reason;
        } else {
          const saved = await upsertRecipient({
            kakaoUserId: profile.value.id,
            nickname: profile.value.nickname,
            refreshToken: token.value.refresh_token ?? "",
            accessToken: token.value.access_token,
            expiresIn: token.value.expires_in,
          });

          if (!saved) {
            result = "fail";
            reason = "수신자 저장 실패 (DB)";
          }
        }
      }
    }
  }

  const query = new URLSearchParams({ kakao: result });
  if (reason) query.set("why", reason.slice(0, 160));

  redirect(`/admin/settings?${query}`);
}
