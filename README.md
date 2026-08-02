# 양지농원 복숭아 주문 사이트

Next.js 16 (App Router) + Tailwind CSS 4 + Supabase.

방문자가 상품 소개를 보고 주문서를 넣으면, 관리자가 `/admin`에서 주문을 확인하고
상태를 바꾸거나 CSV로 내려받는다.

## 개발 환경

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npx eslint .     # 린트
npx tsc --noEmit # 타입 검사
```

> `dev`/`build` 스크립트의 `--webpack` 플래그는 제거하지 말 것.
> 개발 머신의 Windows Smart App Control이 `@next/swc-win32-x64-msvc` 네이티브
> 바이너리를 차단해 Turbopack이 동작하지 않는다. 빌드 로그의
> `Attempted to load @next/swc-win32-x64-msvc ... blocked` 경고는 정상이다.

## 환경변수

`.env.local` (로컬) 또는 Vercel 프로젝트 설정(배포)에 넣는다. Supabase 값은
대시보드 → Project Settings → API 에서 얻는다.

| 이름 | 설명 |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | `anon public` (또는 `Publishable key`). 관리자 로그인에 쓴다 |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role`. RLS를 우회하므로 서버에서만 쓰고 절대 노출하지 않는다 |
| `NEXT_PUBLIC_SITE_URL` | (선택) 실제 도메인. 없으면 Vercel 도메인을 쓴다 |

## 데이터베이스

`supabase/schema.sql`을 Supabase 대시보드의 SQL Editor에서 실행한다.
여러 번 실행해도 안전하다.

- `orders` — 주문. 주문번호는 `P260803-0001` 형태로 자동 생성된다.
- `site_settings` — 항상 `id = 1` 한 행. 주문 마감 스위치와 입금 계좌 정보.

두 테이블 모두 RLS를 켜고 정책을 만들지 않았다. 따라서 브라우저에서 직접
접근하는 경로는 전부 막혀 있고, 서버가 `service_role` 키로만 읽고 쓴다.

## 관리자 계정

Supabase 대시보드 → Authentication → Users → `Add user`에서 만든다.
`Auto Confirm User`를 켜야 이메일 인증 없이 바로 로그인된다.

## 자주 고치게 되는 곳

- `src/lib/products.ts` — 농장명·연락처·주소, 박스 규격과 가격, 품종 소개,
  주문 단계 안내, FAQ. 가격을 바꾸면 사이트 전체에 반영된다. 이미 접수된
  주문은 주문 시점 단가를 따로 저장하므로 금액이 바뀌지 않는다.
- `src/app/globals.css` — 색상과 폰트 토큰.
- 사진 자리는 `PhotoPlaceholder`로 잡아 두었다. 사진이 준비되면 `next/image`로
  교체한다. 필요한 사진: 대표 사진(세로 4:5) 1장, 백도·황도 단면(가로 3:2) 각 1장.

## 배포

GitHub 저장소에 push하면 Vercel이 자동으로 재배포한다.
Vercel 프로젝트에 위 환경변수를 등록해 두어야 한다.
