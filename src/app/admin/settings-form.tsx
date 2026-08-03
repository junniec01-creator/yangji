"use client";

import { useActionState, useState } from "react";
import { updateSettings } from "@/app/admin/actions";
import { INITIAL_ADMIN_FORM_STATE } from "@/app/admin/form-state";
import type { SiteSettings } from "@/lib/site-settings";

const INPUT_CLASS =
  "w-full rounded-xl bg-white px-4 py-2.5 text-sm text-bark-800 ring-1 outline-none ring-cream-300 transition-shadow placeholder:text-bark-300 focus:ring-2 focus:ring-peach-400";

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-bark-800"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(
    updateSettings,
    INITIAL_ADMIN_FORM_STATE,
  );
  const [isOrderOpen, setIsOrderOpen] = useState(settings.isOrderOpen);

  return (
    <form
      action={formAction}
      className="rounded-3xl bg-white p-6 ring-1 ring-cream-200 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-bark-900">
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

      <div className="mt-5">
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

      <div className="mt-7 border-t border-cream-200 pt-6">
        <h3 className="text-sm font-bold text-bark-900">보내는 사람</h3>
        <p className="mt-1.5 text-xs text-bark-500 break-keep">
          택배 송장에 들어갑니다. 엑셀·CSV를 내려받으면 모든 주문에 이 값이
          함께 나옵니다.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="이름"
            name="senderName"
            defaultValue={settings.senderName}
            placeholder="양지농원"
          />
          <Field
            label="연락처"
            name="senderPhone"
            defaultValue={settings.senderPhone}
            placeholder="010-0000-0000"
          />
          <Field
            label="우편번호"
            name="senderPostcode"
            defaultValue={settings.senderPostcode}
            placeholder="00000"
          />
          <Field
            label="주소"
            name="senderAddress1"
            defaultValue={settings.senderAddress1}
            placeholder="충청북도 영동군 …"
          />
          <Field
            label="상세주소"
            name="senderAddress2"
            defaultValue={settings.senderAddress2}
            placeholder="동·호수 등"
            className="sm:col-span-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-bark-900 px-7 text-sm font-semibold text-cream-50 transition-colors hover:bg-bark-800 disabled:opacity-60"
      >
        {pending ? "저장 중..." : "설정 저장"}
      </button>
    </form>
  );
}
