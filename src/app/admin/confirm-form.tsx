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
  /** 주문 하나를 대상으로 할 때만 넘긴다. 일괄 처리에는 필요 없다. */
  id?: string;
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
      {id && <input type="hidden" name="id" value={id} />}
      {children}
    </form>
  );
}
