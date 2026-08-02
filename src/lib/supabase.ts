import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * service_role 키는 RLS를 우회한다. 절대 클라이언트 번들에 들어가면 안 되므로
 * NEXT_PUBLIC_ 접두사를 붙이지 않고, 이 모듈은 server-only로 잠가 둔다.
 */
export function createServiceClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local에 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정하세요.",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
