import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 관리자 영역의 1차 관문. 두 가지 일을 한다.
 *   1. Supabase 세션 토큰을 갱신해 쿠키에 다시 심는다.
 *   2. 로그인하지 않은 요청을 로그인 화면으로 돌린다.
 *
 * 여기서의 검사는 낙관적이다(프리페치에도 실행되므로 무거운 조회를 하지 않는다).
 * 진짜 권한 검사는 각 페이지·Server Action·라우트 핸들러의 requireAdmin이 한다.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  // 환경변수가 없으면 통과시킨다. 페이지 쪽에서 안내 화면을 띄운다.
  if (!url || !anonKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (user && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
