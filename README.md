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
| `KAKAO_REST_API_KEY` | (선택) 카카오 개발자 콘솔의 REST API 키. 없으면 카카오 알림 기능이 화면에서 비활성으로 표시된다 |
| `KAKAO_CLIENT_SECRET` | (선택) 카카오 앱에서 Client Secret을 켰다면 넣는다 |
| `CRON_SECRET` | (선택) 토큰 갱신 크론을 보호한다. 넣으면 `Authorization: Bearer` 가 맞아야 실행된다 |

## 데이터베이스

`supabase/schema.sql`을 Supabase 대시보드의 SQL Editor에서 실행한다.
여러 번 실행해도 안전하다.

- `orders` — 주문. 주문번호는 `P260803-0001` 형태로 자동 생성된다.
- `site_settings` — 항상 `id = 1` 한 행. 주문 마감 스위치와 입금 계좌 정보.
- `kakao_recipients` — 카카오 알림을 받을 관리자. 토큰은 갱신될 때마다 값이
  바뀌므로 환경변수가 아니라 여기에 둔다.

두 테이블 모두 RLS를 켜고 정책을 만들지 않았다. 따라서 브라우저에서 직접
접근하는 경로는 전부 막혀 있고, 서버가 `service_role` 키로만 읽고 쓴다.

## 관리자 화면

- `/admin` — **주문 확인.** 매일 보는 화면. `입금 확인` / `발송` 탭으로 나뉘고
  버튼 한 번으로 처리한다. 상태 전이는 현재 상태를 조건에 걸어 두어, 관리자가
  여럿이 동시에 눌러도 한 번만 반영된다.
- `/admin/orders` — **주문 관리.** 집계 카드, 상태 필터(전체 · 남은 발송 ·
  상태별), 상태 드롭다운, 삭제. 상태별 CSV를 각각 내려받을 수 있다.
  "남은 발송"은 아직 부치지 않은 주문(입금 대기 + 입금 확인)을 뜻하며
  목록·CSV·집계 모두 같은 기준을 쓴다.
- `/admin/stats` — 일별 판매량·수익 꺾은선. 기간은 7 · 30 · 90일과 전체 중 고른다.
  취소한 주문은 빼고 세며 날짜는 한국 시간 기준이다.
- `/admin/settings` — 마감 스위치, 입금 계좌, 카카오 알림 연결.

## 카카오 알림

주문 확인 화면에서 `입금 확인`을 누르면 등록된 관리자 전원의 카카오톡
'나와의 채팅'으로 주문 내역이 간다. 카카오톡 메시지 API의 **나에게 보내기**를
쓰므로 앱 검수나 비즈앱 전환, 사업자등록이 필요 없다. 대신 **받을 사람이 각자
자기 카카오 계정으로 한 번씩 연결**해야 한다.

준비 절차:

1. [카카오 개발자 콘솔](https://developers.kakao.com)에서 애플리케이션 추가
2. 카카오 로그인 활성화 ON
3. Redirect URI에 `{사이트 주소}/api/kakao/callback` 등록
4. 동의항목에서 **카카오톡 메시지 전송(`talk_message`)** 활성화
5. REST API 키를 `KAKAO_REST_API_KEY`에 넣고 배포
6. 받을 사람마다 `/admin/settings`에서 `내 카카오톡 연결하기`를 누른다

리프레시 토큰은 2개월간 한 번도 쓰지 않으면 만료된다. 수확철이 아니면 알림이
몇 달씩 없을 수 있으므로 `vercel.json`의 크론이 매일 한 번
`/api/cron/kakao-refresh`를 호출해 살려 둔다. Vercel Hobby 플랜은 하루 1회
실행 제한이 있는데 이 용도에는 충분하다.

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
