"use client";

import { useActionState } from "react";
import { INITIAL_ADMIN_FORM_STATE } from "@/app/admin/form-state";
import { signIn } from "@/app/admin/login/actions";

const INPUT_CLASS =
  "w-full rounded-xl bg-white px-4 py-3 text-bark-800 ring-1 outline-none ring-cream-300 transition-shadow focus:ring-2 focus:ring-peach-400";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signIn,
    INITIAL_ADMIN_FORM_STATE,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.message && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-bark-800"
        >
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-bark-800"
        >
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={INPUT_CLASS}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-13 w-full items-center justify-center rounded-full bg-bark-900 text-sm font-semibold text-cream-50 transition-colors hover:bg-bark-800 disabled:opacity-60"
      >
        {pending ? "확인 중..." : "로그인"}
      </button>
    </form>
  );
}
