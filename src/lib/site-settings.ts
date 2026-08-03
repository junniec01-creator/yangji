import "server-only";
import { createServiceClient } from "@/lib/supabase";

export interface SiteSettings {
  isOrderOpen: boolean;
  closedMessage: string;
  /** 택배 송장의 보내는 사람. 농장 하나로 공통이다. */
  senderName: string;
  senderPhone: string;
  senderPostcode: string;
  senderAddress1: string;
  senderAddress2: string;
}

const COLUMNS =
  "is_order_open, closed_message, sender_name, sender_phone, sender_postcode, sender_address1, sender_address2";

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
      .select(COLUMNS)
      .eq("id", 1)
      .single();

    if (error || !data) {
      console.error("site_settings 조회 실패:", error?.message);
      return null;
    }

    return {
      isOrderOpen: data.is_order_open,
      closedMessage: data.closed_message,
      senderName: data.sender_name,
      senderPhone: data.sender_phone,
      senderPostcode: data.sender_postcode,
      senderAddress1: data.sender_address1,
      senderAddress2: data.sender_address2,
    };
  } catch (cause) {
    console.error(
      "site_settings 조회 실패:",
      cause instanceof Error ? cause.message : cause,
    );
    return null;
  }
}
