import "server-only";
import { createServiceClient } from "@/lib/supabase";

export interface SiteSettings {
  isOrderOpen: boolean;
  closedMessage: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}

/**
 * site_settings 테이블의 단일 행(id = 1)을 읽는다.
 * 환경변수 누락이나 DB 장애로 읽지 못하면 null을 돌려주고,
 * 호출하는 쪽에서 안내 화면을 띄운다.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "is_order_open, closed_message, bank_name, bank_account, bank_holder",
      )
      .eq("id", 1)
      .single();

    if (error || !data) {
      console.error("site_settings 조회 실패:", error?.message);
      return null;
    }

    return {
      isOrderOpen: data.is_order_open,
      closedMessage: data.closed_message,
      bankName: data.bank_name,
      bankAccount: data.bank_account,
      bankHolder: data.bank_holder,
    };
  } catch (cause) {
    console.error(
      "site_settings 조회 실패:",
      cause instanceof Error ? cause.message : cause,
    );
    return null;
  }
}
