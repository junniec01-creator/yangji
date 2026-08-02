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

  revalidatePath("/admin");
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) console.error("주문 삭제 실패:", error.message);

  revalidatePath("/admin");
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

  revalidatePath("/admin");
  revalidatePath("/order");

  return { message: "저장했습니다.", ok: true };
}
