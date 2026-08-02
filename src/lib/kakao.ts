import "server-only";
import { createServiceClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site-url";

/**
 * 카카오톡 "나에게 보내기".
 *
 * 이 API는 토큰 주인 본인에게만 보낸다. 그래서 관리자마다 한 번씩 카카오
 * 로그인을 해서 토큰을 남겨 두고, 알림이 필요할 때 사람 수만큼 호출한다.
 * 친구에게 보내기와 달리 앱 검수나 비즈앱 전환이 필요 없다.
 */

const AUTH_HOST = "https://kauth.kakao.com";
const API_HOST = "https://kapi.kakao.com";

/** 액세스 토큰이 이만큼 남았으면 미리 갱신한다. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

/** 연결을 시작한 브라우저와 돌아온 브라우저가 같은지 대조하는 쿠키. */
export const STATE_COOKIE = "kakao_oauth_state";

export interface KakaoRecipient {
  id: string;
  kakao_user_id: string;
  nickname: string;
  refresh_token: string;
  access_token: string;
  access_expires_at: string | null;
  last_error: string;
  last_sent_at: string | null;
}

const COLUMNS =
  "id, kakao_user_id, nickname, refresh_token, access_token, access_expires_at, last_error, last_sent_at";

export function getKakaoRestKey(): string | null {
  return process.env.KAKAO_REST_API_KEY || null;
}

export function isKakaoConfigured(): boolean {
  return Boolean(getKakaoRestKey());
}

export function getKakaoRedirectUri(): string {
  return `${getSiteUrl()}/api/kakao/callback`;
}

/** 관리자를 카카오 로그인으로 보내는 주소. scope는 메시지 전송 권한만 받는다. */
export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getKakaoRestKey() ?? "",
    redirect_uri: getKakaoRedirectUri(),
    response_type: "code",
    scope: "talk_message",
    state,
  });
  return `${AUTH_HOST}/oauth/authorize?${params}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

async function requestToken(
  body: Record<string, string>,
): Promise<TokenResponse | null> {
  const restKey = getKakaoRestKey();
  if (!restKey) return null;

  const params = new URLSearchParams({ client_id: restKey, ...body });
  const secret = process.env.KAKAO_CLIENT_SECRET;
  if (secret) params.set("client_secret", secret);

  try {
    const response = await fetch(`${AUTH_HOST}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      cache: "no-store",
    });

    const payload = await response.json();

    if (!response.ok) {
      console.error(
        "카카오 토큰 요청 실패:",
        `${response.status} ${JSON.stringify(payload)}`,
      );
      return null;
    }

    return payload as TokenResponse;
  } catch (cause) {
    console.error(
      "카카오 토큰 요청 실패:",
      cause instanceof Error ? cause.message : cause,
    );
    return null;
  }
}

export async function exchangeCode(code: string): Promise<TokenResponse | null> {
  return requestToken({
    grant_type: "authorization_code",
    redirect_uri: getKakaoRedirectUri(),
    code,
  });
}

/** 카카오 회원번호와 닉네임. 수신자를 화면에 구분해 보여주려고 읽는다. */
export async function fetchKakaoProfile(
  accessToken: string,
): Promise<{ id: string; nickname: string } | null> {
  try {
    const response = await fetch(
      `${API_HOST}/v2/user/me?secure_resource=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("카카오 프로필 조회 실패:", String(response.status));
      return null;
    }

    const payload = await response.json();
    return {
      id: String(payload.id),
      nickname: String(payload.properties?.nickname ?? ""),
    };
  } catch (cause) {
    console.error(
      "카카오 프로필 조회 실패:",
      cause instanceof Error ? cause.message : cause,
    );
    return null;
  }
}

export async function listRecipients(): Promise<KakaoRecipient[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("kakao_recipients")
    .select(COLUMNS)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("카카오 수신자 조회 실패:", error.message);
    return [];
  }

  return (data ?? []) as KakaoRecipient[];
}

export async function upsertRecipient(input: {
  kakaoUserId: string;
  nickname: string;
  refreshToken: string;
  accessToken: string;
  expiresIn: number;
}): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("kakao_recipients").upsert(
    {
      kakao_user_id: input.kakaoUserId,
      nickname: input.nickname,
      refresh_token: input.refreshToken,
      access_token: input.accessToken,
      access_expires_at: new Date(
        Date.now() + input.expiresIn * 1000,
      ).toISOString(),
      last_error: "",
    },
    { onConflict: "kakao_user_id" },
  );

  if (error) {
    console.error("카카오 수신자 저장 실패:", error.message);
    return false;
  }

  return true;
}

export async function removeRecipient(id: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("kakao_recipients")
    .delete()
    .eq("id", id);

  if (error) console.error("카카오 수신자 삭제 실패:", error.message);
}

async function markError(id: string, message: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("kakao_recipients")
    .update({ last_error: message })
    .eq("id", id);
}

/**
 * 쓸 수 있는 액세스 토큰을 돌려준다. 만료가 가까우면 미리 갱신한다.
 *
 * 리프레시 토큰은 2개월간 한 번도 쓰지 않으면 만료된다. 수확철이 아니면
 * 알림이 뜸해지므로 하루 한 번 도는 크론이 이 함수를 호출해 살려 둔다.
 */
export async function ensureAccessToken(
  recipient: KakaoRecipient,
): Promise<string | null> {
  const expiresAt = recipient.access_expires_at
    ? new Date(recipient.access_expires_at).getTime()
    : 0;

  if (recipient.access_token && expiresAt - REFRESH_MARGIN_MS > Date.now()) {
    return recipient.access_token;
  }

  const token = await requestToken({
    grant_type: "refresh_token",
    refresh_token: recipient.refresh_token,
  });

  if (!token) {
    await markError(recipient.id, "토큰 갱신에 실패했습니다. 다시 연결해 주세요.");
    return null;
  }

  const supabase = createServiceClient();
  const patch: Record<string, string> = {
    access_token: token.access_token,
    access_expires_at: new Date(
      Date.now() + token.expires_in * 1000,
    ).toISOString(),
    last_error: "",
  };
  // 만료가 1개월 이내로 남았을 때만 새 리프레시 토큰이 함께 온다.
  if (token.refresh_token) patch.refresh_token = token.refresh_token;

  const { error } = await supabase
    .from("kakao_recipients")
    .update(patch)
    .eq("id", recipient.id);

  if (error) console.error("카카오 토큰 저장 실패:", error.message);

  return token.access_token;
}

async function sendToOne(
  recipient: KakaoRecipient,
  text: string,
  linkUrl: string,
): Promise<boolean> {
  const accessToken = await ensureAccessToken(recipient);
  if (!accessToken) return false;

  const templateObject = {
    object_type: "text",
    text,
    link: { web_url: linkUrl, mobile_web_url: linkUrl },
    button_title: "주문 확인",
  };

  try {
    const response = await fetch(`${API_HOST}/v2/api/talk/memo/default/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        template_object: JSON.stringify(templateObject),
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("카카오 알림 발송 실패:", `${response.status} ${detail}`);
      await markError(recipient.id, `발송 실패 (${response.status})`);
      return false;
    }

    const supabase = createServiceClient();
    await supabase
      .from("kakao_recipients")
      .update({ last_sent_at: new Date().toISOString(), last_error: "" })
      .eq("id", recipient.id);

    return true;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error("카카오 알림 발송 실패:", message);
    await markError(recipient.id, "발송 실패");
    return false;
  }
}

/**
 * 등록된 수신자 전원에게 보낸다.
 * 한 사람의 토큰이 죽어 있어도 나머지는 받아야 하므로 개별로 처리한다.
 */
export async function notifyAll(
  text: string,
  path = "/admin",
): Promise<{ sent: number; failed: number }> {
  if (!isKakaoConfigured()) return { sent: 0, failed: 0 };

  const recipients = await listRecipients();
  if (recipients.length === 0) return { sent: 0, failed: 0 };

  const linkUrl = `${getSiteUrl()}${path}`;
  const results = await Promise.allSettled(
    recipients.map((recipient) => sendToOne(recipient, text, linkUrl)),
  );

  let sent = 0;
  let failed = 0;
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) sent += 1;
    else failed += 1;
  }

  return { sent, failed };
}
