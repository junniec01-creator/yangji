/** "use server" 파일은 async 함수만 export할 수 있어 상태 타입은 여기에 둔다. */
export interface AdminFormState {
  message: string;
  ok: boolean;
}

export const INITIAL_ADMIN_FORM_STATE: AdminFormState = {
  message: "",
  ok: false,
};
