import "server-only";
import { SELLERS, type SellerId } from "@/lib/products";
import { createServiceClient } from "@/lib/supabase";

export interface SellerAccount {
  sellerId: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}

function empty(sellerId: string): SellerAccount {
  return { sellerId, bankName: "", bankAccount: "", bankHolder: "" };
}

/**
 * 판매자별 입금 계좌. 명단에 있는 판매자는 행이 없어도 빈 값으로 채워
 * 돌려주므로, 화면에서는 항상 판매자 수만큼 나온다.
 */
export async function getSellerAccounts(): Promise<SellerAccount[]> {
  const fallback = SELLERS.map((seller) => empty(seller.id));

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("seller_settings")
      .select("seller_id, bank_name, bank_account, bank_holder");

    if (error) {
      console.error("seller_settings 조회 실패:", error.message);
      return fallback;
    }

    return SELLERS.map((seller) => {
      const row = (data ?? []).find((item) => item.seller_id === seller.id);
      if (!row) return empty(seller.id);
      return {
        sellerId: seller.id,
        bankName: row.bank_name,
        bankAccount: row.bank_account,
        bankHolder: row.bank_holder,
      };
    });
  } catch (cause) {
    console.error(
      "seller_settings 조회 실패:",
      cause instanceof Error ? cause.message : cause,
    );
    return fallback;
  }
}

/** 주문 완료 화면에서 그 주문의 판매자 계좌 하나만 필요할 때. */
export async function getSellerAccount(
  sellerId: SellerId,
): Promise<SellerAccount | null> {
  const accounts = await getSellerAccounts();
  return accounts.find((account) => account.sellerId === sellerId) ?? null;
}
