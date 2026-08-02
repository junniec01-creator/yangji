"use client";

import type { ReactNode } from "react";

/**
 * 되돌리기 어려운 처리에 되묻는 창을 붙인다.
 * 서버 액션은 그대로 넘겨받아 폼 action에 건다.
 */
export function ConfirmForm({
  action,
  id,
  message,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      {children}
    </form>
  );
}
