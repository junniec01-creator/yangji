"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import type { AdminFormState } from "@/app/admin/form-state";
import { notifyAll, removeRecipient } from "@/lib/kakao";
import { ORDER_STATUSES, isSellerId, type OrderStatus } from "@/lib/orders";
import { BOX_OPTIONS, formatPrice } from "@/lib/products";
import { createAuthClient, requireAdmin } from "@/lib/supabase-auth";
import { createServiceClient } from "@/lib/supabase";

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

interface MovedOrder {
  order_no: string;
  depositor_name: string;
  box_id: string;
  quantity: number;
  total_price: number;
  recipient_name: string;
  recipient_phone: string;
  postcode: string;
  address1: string;
  address2: string;
}

const MOVED_COLUMNS =
  "order_no, depositor_name, box_id, quantity, total_price, recipient_name, recipient_phone, postcode, address1, address2";

/**
 * 지금 상태가 from일 때만 to로 바꾸고, 실제로 바뀐 주문을 돌려준다.
 *
 * 관리자가 여럿이라 같은 주문의 버튼을 동시에 누를 수 있다. 상태를 조건에
 * 걸어 두면 두 번째 요청은 0건 업데이트로 끝나므로, 알림도 한 번만 나간다.
 */
async function transition(
  id: string,
  from: OrderStatus,
  to: OrderStatus,
): Promise<MovedOrder | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: to })
    .eq("id", id)
    .eq("status", from)
    .select(MOVED_COLUMNS);

  if (error) {
    console.error("주문 상태 변경 실패:", error.message);
    return null;
  }

  return ((data ?? [])[0] as MovedOrder | undefined) ?? null;
}

/** 카카오 텍스트 템플릿은 200자를 넘길 수 없다. */
function buildPaymentMessage(order: MovedOrder): string {
  const box =
    BOX_OPTIONS.find((option) => option.id === order.box_id)?.name ??
    order.box_id;

  const lines = [
    `입금 확인 · ${order.order_no}`,
    `${order.depositor_name} · ${box} × ${order.quantity}`,
    formatPrice(order.total_price),
    `받는 분 ${order.recipient_name} ${order.recipient_phone}`,
    `(${order.postcode}) ${order.address1} ${order.address2}`.trim(),
  ];

  const text = lines.join("\n");
  return text.length > 200 ? `${text.slice(0, 199)}…` : text;
}

/** 입금 대기 → 입금 확인. 실제로 바뀌었을 때만 관리자 전원에게 알린다. */
export async function confirmPayment(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const moved = await transition(id, "pending", "paid");
  revalidateAdmin();

  // 알림이 화면 반응을 붙잡지 않도록 응답 뒤로 미룬다.
  if (moved) after(() => notifyAll(buildPaymentMessage(moved), "/admin?tab=ship"));
}

/** 입금 대기 → 취소 */
export async function cancelOrder(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await transition(id, "pending", "cancelled");
  revalidateAdmin();
}

/** 입금 확인 → 발송 완료 */
export async function markShipped(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await transition(id, "paid", "shipped");
  revalidateAdmin();
}

/** 입금 확인된 주문을 한 번에 발송 완료로. */
export async function markAllShipped() {
  await requireAdmin();

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "shipped" })
    .eq("status", "paid");

  if (error) console.error("일괄 발송 처리 실패:", error.message);

  revalidateAdmin();
}

/** 주문 관리 화면의 드롭다운. 어느 상태로든 옮길 수 있다. */
export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !ORDER_STATUSES.includes(status as OrderStatus)) return;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) console.error("주문 상태 변경 실패:", error.message);

  revalidateAdmin();
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) console.error("주문 삭제 실패:", error.message);

  revalidateAdmin();
}

/** 설정 화면에서 수신자 하나를 뺀다. */
export async function disconnectKakao(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await removeRecipient(id);
  revalidatePath("/admin/settings");
}

/** 연결이 살아 있는지 눌러서 확인하는 용도. */
export async function sendKakaoTest() {
  await requireAdmin();

  const { failed } = await notifyAll(
    ["알림 연결 확인", "이 메시지가 보이면 정상입니다."].join("\n"),
  );

  revalidatePath("/admin/settings");
  redirect(`/admin/settings?kakao=${failed > 0 ? "testfail" : "test"}`);
}

export async function updateSettings(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const payload = {
    is_order_open: formData.get("isOrderOpen") === "on",
    closed_message: String(formData.get("closedMessage") ?? "").trim(),
    sender_name: String(formData.get("senderName") ?? "").trim(),
    sender_phone: String(formData.get("senderPhone") ?? "").trim(),
    sender_postcode: String(formData.get("senderPostcode") ?? "").trim(),
    sender_address1: String(formData.get("senderAddress1") ?? "").trim(),
    sender_address2: String(formData.get("senderAddress2") ?? "").trim(),
  };

  if (!payload.closed_message) {
    return { message: "마감 안내 문구를 입력해 주세요.", ok: false };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    console.error("사이트 설정 저장 실패:", error.message);
    return { message: "설정을 저장하지 못했습니다.", ok: false };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/order");

  return { message: "저장했습니다.", ok: true };
}

/** 판매자 한 명의 입금 계좌. 주문 완료 화면에 그대로 나간다. */
export async function updateSellerAccount(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const sellerId = String(formData.get("sellerId") ?? "");
  if (!isSellerId(sellerId)) {
    return { message: "알 수 없는 판매자입니다.", ok: false };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("seller_settings").upsert(
    {
      seller_id: sellerId,
      bank_name: String(formData.get("bankName") ?? "").trim(),
      bank_account: String(formData.get("bankAccount") ?? "").trim(),
      bank_holder: String(formData.get("bankHolder") ?? "").trim(),
    },
    { onConflict: "seller_id" },
  );

  if (error) {
    console.error("판매자 계좌 저장 실패:", error.message);
    return { message: "계좌를 저장하지 못했습니다.", ok: false };
  }

  revalidatePath("/admin/settings");

  return { message: "저장했습니다.", ok: true };
}
