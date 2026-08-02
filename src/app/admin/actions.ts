"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AdminFormState } from "@/app/admin/form-state";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
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

/**
 * 지금 상태가 from일 때만 to로 바꾸고, 실제로 바뀌었는지를 돌려준다.
 *
 * 관리자가 여럿이라 같은 주문의 버튼을 동시에 누를 수 있다. 상태를 조건에
 * 걸어 두면 두 번째 요청은 0건 업데이트로 끝나므로, 알림도 한 번만 나간다.
 */
async function transition(
  id: string,
  from: OrderStatus,
  to: OrderStatus,
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: to })
    .eq("id", id)
    .eq("status", from)
    .select("id");

  if (error) {
    console.error("주문 상태 변경 실패:", error.message);
    return false;
  }

  return (data ?? []).length > 0;
}

/** 입금 대기 → 입금 확인 */
export async function confirmPayment(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await transition(id, "pending", "paid");
  revalidateAdmin();
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

export async function updateSettings(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const payload = {
    is_order_open: formData.get("isOrderOpen") === "on",
    closed_message: String(formData.get("closedMessage") ?? "").trim(),
    bank_name: String(formData.get("bankName") ?? "").trim(),
    bank_account: String(formData.get("bankAccount") ?? "").trim(),
    bank_holder: String(formData.get("bankHolder") ?? "").trim(),
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
