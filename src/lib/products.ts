/**
 * 사이트 전역에서 쓰는 상품 · 브랜드 상수.
 *
 * 가격과 규격은 가안이므로 확정되면 이 파일의 숫자만 고치면
 * 랜딩 페이지 · 주문 폼 · 관리자 화면에 모두 반영된다.
 * 연락처와 주소도 예시값이므로 실제 값이 정해지면 여기서 교체한다.
 */

export const SITE = {
  farmName: "양지농원",
  ownerName: "박상철",
  tagline: "나무에서 익힌 복숭아",
  description:
    "새벽에 따서 그날 보내는 산지 직송 복숭아. 백도와 황도를 한 상자씩 손으로 골라 담습니다.",
  phone: "010-2430-3844",
  address: "강원특별자치도 양양군 서면 용천2길 18 (용천리) 양지농원",
} as const;

export type SellerId = "keum" | "park";

export interface Seller {
  id: SellerId;
  name: string;
}

/**
 * 수익을 나눠 갖는 판매자.
 *
 * 주문에는 이름이 아니라 id를 저장한다. 표기가 바뀌어도 지난 주문이
 * 깨지지 않게 하기 위해서다. 사람이 바뀌면 이 배열만 고치면 된다.
 */
export const SELLERS: readonly Seller[] = [
  { id: "keum", name: "김금춘" },
  { id: "park", name: "박태준" },
] as const;

/** 저장된 id를 이름으로. 빈 값이거나 명단에 없으면 "미지정". */
export function sellerName(id: string): string {
  return SELLERS.find((seller) => seller.id === id)?.name ?? "미지정";
}

export const SEASON = {
  label: "2026 여름 수확",
  periodLabel: "7월 중순 ~ 8월 말",
  note: "품종이 바뀌는 시기라 주차별로 보내드리는 복숭아가 달라집니다.",
} as const;

export type BoxId = "small" | "medium" | "large";

export interface BoxOption {
  id: BoxId;
  name: string;
  weightLabel: string;
  countLabel: string;
  price: number;
  summary: string;
  bestFor: string;
  /** 규격표에서 강조 표시할 기본 추천 박스 */
  featured: boolean;
}

export const BOX_OPTIONS: readonly BoxOption[] = [
  {
    id: "small",
    name: "소과 박스",
    weightLabel: "2.5kg",
    countLabel: "8~10과",
    price: 30000,
    summary: "둘이서 일주일이면 딱 떨어지는 양입니다.",
    bestFor: "1~2인 가구 · 맛보기",
    featured: false,
  },
  {
    id: "medium",
    name: "중과 박스",
    weightLabel: "4.5kg",
    countLabel: "14~16과",
    price: 50000,
    summary: "가장 많이 나가는 크기입니다. 나눠 드시기에도 넉넉합니다.",
    bestFor: "3~4인 가족 · 부모님 선물",
    featured: true,
  },
  {
    id: "large",
    name: "대과 박스",
    weightLabel: "7.5kg",
    countLabel: "24~28과",
    price: 75000,
    summary: "알이 굵은 것들로만 채웁니다. 선물용으로 많이 찾으십니다.",
    bestFor: "명절·거래처 선물 · 대가족",
    featured: false,
  },
] as const;

export const SHIPPING = {
  baseFee: 0,
  remoteSurcharge: 3000,
  remoteLabel: "제주 · 도서산간",
  leadTimeLabel: "입금 확인 후 1~2일 이내 발송",
  courierLabel: "택배 배송 (주말·공휴일 발송 제외)",
} as const;

export const VARIETIES = [
  {
    name: "백도",
    periodLabel: "7월 중순 ~ 8월 초",
    brixLabel: "12~14 Brix",
    note: "과육이 희고 부드럽습니다. 물렁하게 익혀 드시는 걸 좋아하신다면 이쪽입니다.",
  },
  {
    name: "황도",
    periodLabel: "8월 초 ~ 8월 말",
    brixLabel: "13~15 Brix",
    note: "살이 단단하고 향이 진합니다. 아삭한 식감을 좋아하시면 황도를 추천드립니다.",
  },
] as const;

export const ORDER_STEPS = [
  {
    title: "주문서 작성",
    body: "박스 크기와 수량, 받으실 분 정보를 남겨 주세요. 선물이라면 수령인을 따로 적으실 수 있습니다.",
  },
  {
    title: "계좌 입금",
    body: "주문 완료 화면에 안내되는 계좌로 입금해 주세요. 입금자명이 다르면 요청사항에 적어 주시면 됩니다.",
  },
  {
    title: "입금 확인",
    body: "확인되는 대로 주문 상태가 '입금 완료'로 바뀝니다. 확인은 보통 반나절 안에 끝납니다.",
  },
  {
    title: "수확 · 발송",
    body: "발송일 새벽에 따서 그날 바로 보냅니다. 미리 따 두었다가 보내지 않습니다.",
  },
] as const;

export const FAQS = [
  {
    q: "언제까지 주문할 수 있나요?",
    a: "수확이 끝나면 주문을 닫습니다. 보통 8월 말이지만 그해 작황에 따라 앞뒤로 며칠 차이가 납니다. 마감되면 이 사이트에 바로 안내가 뜹니다.",
  },
  {
    q: "복숭아가 무를까 걱정됩니다.",
    a: "완전히 무르기 직전 단계에서 따서 보냅니다. 받으신 뒤 상온에 하루 이틀 두시면 가장 맛있습니다. 바로 냉장고에 넣으시면 단맛이 덜 오릅니다.",
  },
  {
    q: "선물로 보내고 싶은데 가격표가 같이 가나요?",
    a: "거래명세서나 가격이 적힌 종이는 넣지 않습니다. 주문 시 '주문자와 수령인이 다릅니다'를 선택하시면 받으실 분 주소로만 보내드립니다.",
  },
  {
    q: "배송비가 따로 있나요?",
    a: "전 상품 무료 배송입니다. 다만 제주와 도서산간 지역은 택배사 추가 요금 3,000원이 붙습니다.",
  },
  {
    q: "상한 복숭아가 왔습니다.",
    a: "받으신 당일에 사진과 함께 연락 주세요. 확인되면 다음 발송분으로 다시 보내드리거나 해당 금액을 돌려드립니다.",
  },
  {
    q: "카드 결제는 안 되나요?",
    a: "지금은 계좌이체만 받고 있습니다. 주문 후 안내되는 계좌로 입금해 주시면 됩니다.",
  },
] as const;

/** 30000 → "30,000원" */
export function formatPrice(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}
