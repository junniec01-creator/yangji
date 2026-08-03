"use server";

import { redirect } from "next/navigation";
import type { OrderFormState } from "@/app/order/form-state";
import {
  MAX_QUANTITY,
  calcPrice,
  isBoxId,
  isRemoteArea,
  isSellerId,
  normalizePhone,
} from "@/lib/orders";
import { getSiteSettings } from "@/lib/site-settings";
import { createServiceClient } from "@/lib/supabase";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitOrder(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const settings = await getSiteSettings();
  if (!settings) {
    return {
      message: "주문 시스템에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      fieldErrors: {},
    };
  }
  if (!settings.isOrderOpen) {
    return { message: settings.closedMessage, fieldErrors: {} };
  }

  const fieldErrors: Record<string, string> = {};

  // 판매자 — 수익 분배의 기준이라 기본값 없이 반드시 고르게 한다.
  const sellerId = text(formData, "sellerId");
  if (!isSellerId(sellerId)) {
    fieldErrors.sellerId = "소개해 주신 분을 선택해 주세요.";
  }

  // 주문자
  const ordererName = text(formData, "ordererName");
  if (ordererName.length < 2 || ordererName.length > 20) {
    fieldErrors.ordererName = "성함을 2~20자로 입력해 주세요.";
  }

  const ordererPhone = normalizePhone(text(formData, "ordererPhone"));
  if (!ordererPhone) {
    fieldErrors.ordererPhone = "연락처를 숫자 9~11자리로 입력해 주세요.";
  }

  // 상품
  const boxIdRaw = text(formData, "boxId");
  if (!isBoxId(boxIdRaw)) {
    fieldErrors.boxId = "박스 크기를 선택해 주세요.";
  }

  const quantity = Number(text(formData, "quantity"));
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    fieldErrors.quantity = `수량은 1~${MAX_QUANTITY}개 사이로 입력해 주세요.`;
  }

  // 수령인
  const recipientSame = formData.get("recipientSame") === "on";
  const recipientName = recipientSame
    ? ordererName
    : text(formData, "recipientName");
  const recipientPhone = recipientSame
    ? ordererPhone
    : normalizePhone(text(formData, "recipientPhone"));

  if (!recipientSame) {
    if (recipientName.length < 2 || recipientName.length > 20) {
      fieldErrors.recipientName = "받으실 분 성함을 2~20자로 입력해 주세요.";
    }
    if (!recipientPhone) {
      fieldErrors.recipientPhone =
        "받으실 분 연락처를 숫자 9~11자리로 입력해 주세요.";
    }
  }

  // 배송지
  const postcode = text(formData, "postcode");
  if (!/^\d{5}$/.test(postcode)) {
    fieldErrors.postcode = "우편번호 찾기로 주소를 선택해 주세요.";
  }

  const address1 = text(formData, "address1");
  if (!address1) {
    fieldErrors.address1 = "우편번호 찾기로 주소를 선택해 주세요.";
  }

  const address2 = text(formData, "address2");
  if (address2.length > 100) {
    fieldErrors.address2 = "상세주소는 100자 이내로 입력해 주세요.";
  }

  // 결제
  const depositorName = text(formData, "depositorName");
  if (depositorName.length < 2 || depositorName.length > 20) {
    fieldErrors.depositorName = "입금자명을 2~20자로 입력해 주세요.";
  }

  const memo = text(formData, "memo");
  if (memo.length > 500) {
    fieldErrors.memo = "요청사항은 500자 이내로 입력해 주세요.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: "입력하신 내용을 다시 확인해 주세요.", fieldErrors };
  }

  // 여기까지 왔으면 위 검증에서 모두 통과한 값이다.
  const boxId = boxIdRaw as Parameters<typeof calcPrice>[0];
  const isRemote = isRemoteArea(postcode, address1);

  // 금액은 클라이언트가 보낸 값을 믿지 않고 서버에서 다시 계산한다.
  const price = calcPrice(boxId, quantity, isRemote);

  let orderNo: string;
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        seller_id: sellerId,
        orderer_name: ordererName,
        orderer_phone: ordererPhone,
        depositor_name: depositorName,
        box_id: boxId,
        quantity,
        unit_price: price.unitPrice,
        shipping_fee: price.shippingFee,
        total_price: price.total,
        recipient_same: recipientSame,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        postcode,
        address1,
        address2,
        is_remote_area: isRemote,
        memo,
      })
      .select("order_no")
      .single();

    if (error || !data) {
      console.error("주문 저장 실패:", error?.message);
      return {
        message: "주문을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        fieldErrors: {},
      };
    }

    orderNo = data.order_no;
  } catch (cause) {
    console.error(
      "주문 저장 실패:",
      cause instanceof Error ? cause.message : cause,
    );
    return {
      message: "주문을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      fieldErrors: {},
    };
  }

  // 완료 화면에서 계좌를 고르는 데 쓴다. 주문번호로 다시 조회하지 않는 이유는
  // 주문번호가 순번이라 남의 주문을 들여다볼 여지를 주지 않기 위해서다.
  const query = new URLSearchParams({ no: orderNo, seller: sellerId });

  // redirect는 예외를 던져 흐름을 끊으므로 try 바깥에서 호출한다.
  redirect(`/order/complete?${query}`);
}
