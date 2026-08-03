"use client";

import { useActionState } from "react";
import { updateSellerAccount } from "@/app/admin/actions";
import { INITIAL_ADMIN_FORM_STATE } from "@/app/admin/form-state";
import type { SellerAccount } from "@/lib/seller-settings";

const INPUT_CLASS =
  "w-full rounded-xl bg-white px-4 py-2.5 text-sm text-bark-800 ring-1 outline-none ring-cream-300 transition-shadow placeholder:text-bark-300 focus:ring-2 focus:ring-peach-400";

/** 판매자 한 명의 계좌. 손님이 그 판매자를 고르면 이 계좌가 안내된다. */
export function SellerAccountForm({
  name,
  account,
}: {
  name: string;
  account: SellerAccount;
}) {
  const [state, formAction, pending] = useActionState(
    updateSellerAccount,
    INITIAL_ADMIN_FORM_STATE,
  );

  return (
    <form action={formAction} className="rounded-2xl bg-cream-100/70 p-5">
      <input type="hidden" name="sellerId" value={account.sellerId} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-bark-900">{name}</h3>
        {state.message && (
          <p
            role="status"
            className={
              state.ok
                ? "text-xs font-medium text-leaf-600"
                : "text-xs font-medium text-red-600"
            }
          >
            {state.message}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor={`bankName-${account.sellerId}`}
            className="mb-1.5 block text-xs font-medium text-bark-500"
          >
            은행
          </label>
          <input
            id={`bankName-${account.sellerId}`}
            name="bankName"
            defaultValue={account.bankName}
            placeholder="농협"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor={`bankAccount-${account.sellerId}`}
            className="mb-1.5 block text-xs font-medium text-bark-500"
          >
            계좌번호
          </label>
          <input
            id={`bankAccount-${account.sellerId}`}
            name="bankAccount"
            defaultValue={account.bankAccount}
            placeholder="000-0000-0000-00"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor={`bankHolder-${account.sellerId}`}
            className="mb-1.5 block text-xs font-medium text-bark-500"
          >
            예금주
          </label>
          <input
            id={`bankHolder-${account.sellerId}`}
            name="bankHolder"
            defaultValue={account.bankHolder}
            placeholder={name}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-bark-900 px-6 text-xs font-semibold text-cream-50 transition-colors hover:bg-bark-800 disabled:opacity-60"
      >
        {pending ? "저장 중..." : "계좌 저장"}
      </button>
    </form>
  );
}
