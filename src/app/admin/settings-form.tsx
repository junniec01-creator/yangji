"use client";

import { useActionState, useState } from "react";
import { updateSettings } from "@/app/admin/actions";
import { INITIAL_ADMIN_FORM_STATE } from "@/app/admin/form-state";
import type { SiteSettings } from "@/lib/site-settings";

const INPUT_CLASS =
  "w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-bark-800 outline-none transition-colors placeholder:text-bark-400 focus:border-peach-400 focus:ring-2 focus:ring-peach-200";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(
    updateSettings,
    INITIAL_ADMIN_FORM_STATE,
  );
  const [isOrderOpen, setIsOrderOpen] = useState(settings.isOrderOpen);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-cream-200 bg-white p-6 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-xl font-semibold text-bark-900">
          사이트 설정
        </h2>
        {state.message && (
          <p
            role="status"
            className={
              state.ok
                ? "text-sm font-medium text-leaf-600"
                : "text-sm font-medium text-red-600"
            }
          >
            {state.message}
          </p>
        )}
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-cream-100 px-4 py-3.5">
        <input
          type="checkbox"
          name="isOrderOpen"
          checked={isOrderOpen}
          onChange={(event) => setIsOrderOpen(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-peach-500"
        />
        <span>
          <span className="block text-sm font-semibold text-bark-800">
            주문 받는 중
          </span>
          <span className="mt-0.5 block text-xs text-bark-500">
            끄면 주문 폼 대신 아래 마감 안내가 나옵니다.
          </span>
        </span>
      </label>

      <div className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="closedMessage"
            className="mb-2 block text-sm font-semibold text-bark-800"
          >
            마감 안내 문구
          </label>
          <textarea
            id="closedMessage"
            name="closedMessage"
            rows={2}
            defaultValue={settings.closedMessage}
            className={`${INPUT_CLASS} resize-none`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="bankName"
              className="mb-2 block text-sm font-semibold text-bark-800"
            >
              은행
            </label>
            <input
              id="bankName"
              name="bankName"
              defaultValue={settings.bankName}
              placeholder="농협"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label
              htmlFor="bankAccount"
              className="mb-2 block text-sm font-semibold text-bark-800"
            >
              계좌번호
            </label>
            <input
              id="bankAccount"
              name="bankAccount"
              defaultValue={settings.bankAccount}
              placeholder="000-0000-0000-00"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label
              htmlFor="bankHolder"
              className="mb-2 block text-sm font-semibold text-bark-800"
            >
              예금주
            </label>
            <input
              id="bankHolder"
              name="bankHolder"
              defaultValue={settings.bankHolder}
              placeholder="박상철"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-bark-800 px-7 text-sm font-semibold text-white transition-colors hover:bg-bark-900 disabled:opacity-60"
      >
        {pending ? "저장 중..." : "설정 저장"}
      </button>
    </form>
  );
}
