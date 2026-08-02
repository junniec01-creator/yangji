"use server";

import { redirect } from "next/navigation";
import type { AdminFormState } from "@/app/admin/form-state";
import { createAuthClient } from "@/lib/supabase-auth";

export async function signIn(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "이메일과 비밀번호를 모두 입력해 주세요.", ok: false };
  }

  try {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("관리자 로그인 실패:", error.message);
      return { message: "이메일 또는 비밀번호가 올바르지 않습니다.", ok: false };
    }
  } catch (cause) {
    console.error(
      "관리자 로그인 실패:",
      cause instanceof Error ? cause.message : cause,
    );
    return {
      message: "로그인 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      ok: false,
    };
  }

  redirect("/admin");
}
