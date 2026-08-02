import type { NextRequest } from "next/server";
import { ensureAccessToken, isKakaoConfigured, listRecipients } from "@/lib/kakao";

export const dynamic = "force-dynamic";

/**
 * 카카오 리프레시 토큰 살려 두기.
 *
 * 리프레시 토큰은 2개월간 한 번도 쓰지 않으면 만료된다. 수확철이 아니면
 * 알림이 몇 달씩 없을 수 있으므로 하루 한 번 갱신 요청을 보내 둔다.
 * 만료가 1개월 이내로 남았을 때 새 리프레시 토큰이 함께 발급된다.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isKakaoConfigured()) {
    return Response.json({ skipped: "카카오 앱 키 없음" });
  }

  const recipients = await listRecipients();
  let ok = 0;
  let failed = 0;

  for (const recipient of recipients) {
    // 만료가 가깝지 않아도 리프레시 토큰 자체를 써 둬야 하므로 강제로 갱신한다.
    const token = await ensureAccessToken({
      ...recipient,
      access_expires_at: null,
    });
    if (token) ok += 1;
    else failed += 1;
  }

  return Response.json({ total: recipients.length, ok, failed });
}
