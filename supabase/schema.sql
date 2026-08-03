-- 양지농원 주문 사이트 스키마
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 실행한다.
-- 여러 번 실행해도 안전하도록 작성되어 있다.

-- ---------------------------------------------------------------------------
-- 주문번호 생성 (P260802-0001 형태)
-- ---------------------------------------------------------------------------
create sequence if not exists public.order_no_seq;

create or replace function public.generate_order_no()
returns text
language sql
volatile
as $$
  select 'P'
      || to_char(now() at time zone 'Asia/Seoul', 'YYMMDD')
      || '-'
      || lpad(nextval('public.order_no_seq')::text, 4, '0');
$$;

-- ---------------------------------------------------------------------------
-- updated_at 자동 갱신
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 주문
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_no        text not null unique default public.generate_order_no(),

  -- pending: 입금 대기 / paid: 입금 확인 / shipped: 발송 완료 / cancelled: 취소
  status          text not null default 'pending'
                    check (status in ('pending', 'paid', 'shipped', 'cancelled')),

  -- 주문자
  orderer_name    text not null,
  orderer_phone   text not null,
  depositor_name  text not null,

  -- 상품 (가격은 주문 시점 스냅샷 — 나중에 단가가 바뀌어도 과거 주문은 그대로 유지)
  box_id          text not null check (box_id in ('small', 'medium', 'large')),
  quantity        integer not null check (quantity between 1 and 99),
  unit_price      integer not null check (unit_price >= 0),
  shipping_fee    integer not null default 0 check (shipping_fee >= 0),
  total_price     integer not null check (total_price >= 0),

  -- 수령인 (선물 발송 대응)
  recipient_same  boolean not null default true,
  recipient_name  text not null,
  recipient_phone text not null,

  -- 배송지
  postcode        text not null,
  address1        text not null,
  address2        text not null default '',
  is_remote_area  boolean not null default false,

  memo            text not null default '',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 수익을 나눠 갖는 판매자. 명단은 src/lib/products.ts의 SELLERS에 있다.
-- 빈 문자열은 이 기능이 생기기 전에 들어온 주문(= 미지정)을 뜻한다.
alter table public.orders
  add column if not exists seller_id text not null default '';

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_seller_id_idx  on public.orders (seller_id);

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 사이트 설정 (항상 id = 1 인 한 행만 존재)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id             smallint primary key default 1 check (id = 1),

  -- 주문 마감 스위치
  is_order_open  boolean not null default true,
  closed_message text not null default '올해 수확이 마감되었습니다. 내년 여름에 다시 찾아주세요.',

  updated_at     timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- 보내는 사람. 택배 송장에 들어가며 농장 하나로 공통이다.
alter table public.site_settings
  add column if not exists sender_name     text not null default '',
  add column if not exists sender_phone    text not null default '',
  add column if not exists sender_postcode text not null default '',
  add column if not exists sender_address1 text not null default '',
  add column if not exists sender_address2 text not null default '';

-- 입금 계좌는 판매자마다 다르므로 seller_settings로 옮겼다.
alter table public.site_settings
  drop column if exists bank_name,
  drop column if exists bank_account,
  drop column if exists bank_holder;

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 판매자별 입금 계좌
--
-- 주문서에서 고른 판매자에 따라 주문 완료 화면에 다른 계좌가 뜬다.
-- 판매자 명단(id·이름)은 src/lib/products.ts의 SELLERS에 있고, 여기에는
-- 관리자가 화면에서 고쳐야 하는 값만 둔다.
-- ---------------------------------------------------------------------------
create table if not exists public.seller_settings (
  seller_id    text primary key,
  bank_name    text not null default '',
  bank_account text not null default '',
  bank_holder  text not null default '',
  updated_at   timestamptz not null default now()
);

insert into public.seller_settings (seller_id) values ('keum'), ('park')
  on conflict (seller_id) do nothing;

drop trigger if exists seller_settings_touch_updated_at on public.seller_settings;
create trigger seller_settings_touch_updated_at
  before update on public.seller_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 카카오 알림 수신자
--
-- 입금 확인을 누르면 여기 등록된 사람 전원에게 "나에게 보내기"로 알림이 간다.
-- 토큰은 갱신될 때마다 값이 바뀌므로 환경변수가 아니라 이 표에 둔다.
-- ---------------------------------------------------------------------------
create table if not exists public.kakao_recipients (
  id                uuid primary key default gen_random_uuid(),

  -- 카카오 회원번호. 같은 사람이 다시 연결하면 행을 새로 만들지 않고 갱신한다.
  kakao_user_id     text not null unique,
  nickname          text not null default '',

  refresh_token     text not null,
  access_token      text not null default '',
  access_expires_at timestamptz,

  -- 마지막 실패 사유. 비어 있으면 정상으로 본다.
  last_error        text not null default '',
  last_sent_at      timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists kakao_recipients_touch_updated_at on public.kakao_recipients;
create trigger kakao_recipients_touch_updated_at
  before update on public.kakao_recipients
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — 브라우저에서 오는 접근은 전부 막는다.
--
-- 정책을 하나도 만들지 않으므로 anon/authenticated 키로는 읽기·쓰기가 모두
-- 거부된다. 서버(Server Action / Route Handler)에서 service_role 키로만
-- 접근하며, 그 키는 RLS를 우회한다.
-- ---------------------------------------------------------------------------
alter table public.orders           enable row level security;
alter table public.site_settings    enable row level security;
alter table public.seller_settings  enable row level security;
alter table public.kakao_recipients enable row level security;
