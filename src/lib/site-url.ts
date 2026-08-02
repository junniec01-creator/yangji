/**
 * 절대 URL을 만들 때 쓰는 사이트 주소.
 *
 * 우선순위:
 *   1. NEXT_PUBLIC_SITE_URL — 실제 도메인을 연결하면 여기에 넣는다.
 *   2. Vercel이 배포마다 넣어 주는 프로덕션 도메인.
 *   3. 로컬 개발 주소.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:3000";
}
