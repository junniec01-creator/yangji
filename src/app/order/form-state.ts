/**
 * "use server" 파일은 async 함수만 export할 수 있으므로,
 * 주문 폼의 상태 타입과 초기값은 별도 모듈에 둔다.
 */
export interface OrderFormState {
  message: string;
  fieldErrors: Record<string, string>;
}

export const INITIAL_ORDER_FORM_STATE: OrderFormState = {
  message: "",
  fieldErrors: {},
};
