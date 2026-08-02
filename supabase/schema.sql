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

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx     on public.orders (status);

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

  -- 입금 계좌 안내
  bank_name      text not null default '',
  bank_account   text not null default '',
  bank_holder    text not null default '',

  updated_at     timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — 브라우저에서 오는 접근은 전부 막는다.
--
-- 정책을 하나도 만들지 않으므로 anon/authenticated 키로는 읽기·쓰기가 모두
-- 거부된다. 서버(Server Action / Route Handler)에서 service_role 키로만
-- 접근하며, 그 키는 RLS를 우회한다.
-- ---------------------------------------------------------------------------
alter table public.orders        enable row level security;
alter table public.site_settings enable row level security;
