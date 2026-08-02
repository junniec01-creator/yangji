import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * 관리자 로그인 세션을 다루는 클라이언트.
 * 공개(anon) 키를 쓰며 주문 데이터에는 접근하지 않는다 — RLS 정책이 없어
 * 막혀 있고, 데이터 조회는 service_role 클라이언트가 따로 담당한다.
 */
export async function createAuthClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local에 SUPABASE_URL과 SUPABASE_ANON_KEY를 설정하세요.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component에서는 쿠키를 쓸 수 없다. 세션 갱신은 proxy가 맡는다.
        }
      },
    },
  });
}

/**
 * 로그인한 관리자만 통과시킨다. 아니면 로그인 화면으로 보낸다.
 * proxy의 검사는 낙관적(쿠키 유무)일 뿐이므로, 실제 검증은 페이지·액션·
 * 라우트 핸들러마다 이 함수로 다시 한다.
 */
export async function requireAdmin() {
  let user = null;

  try {
    const supabase = await createAuthClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (cause) {
    console.error(
      "관리자 인증 확인 실패:",
      cause instanceof Error ? cause.message : cause,
    );
  }

  // redirect는 예외를 던지므로 try 바깥에서 호출한다.
  if (!user) redirect("/admin/login");
  return user;
}
