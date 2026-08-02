"use client";

import { deleteOrder } from "@/app/admin/actions";

export function DeleteOrderButton({
  id,
  orderNo,
}: {
  id: string;
  orderNo: string;
}) {
  return (
    <form
      action={deleteOrder}
      onSubmit={(event) => {
        if (!confirm(`주문 ${orderNo}을(를) 삭제할까요? 되돌릴 수 없습니다.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-bark-400 underline-offset-4 transition-colors hover:text-red-600 hover:underline"
      >
        삭제
      </button>
    </form>
  );
}
