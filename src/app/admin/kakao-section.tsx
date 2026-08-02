import { disconnectKakao, sendKakaoTest } from "@/app/admin/actions";
import { ConfirmForm } from "@/app/admin/confirm-form";
import { formatKst } from "@/lib/kst";
import type { KakaoRecipient } from "@/lib/kakao";

const RESULT_MESSAGE: Record<string, { text: string; ok: boolean }> = {
  ok: { text: "연결했습니다.", ok: true },
  denied: { text: "카카오에서 동의를 취소했습니다.", ok: false },
  state: { text: "요청이 만료되었습니다. 다시 시도해 주세요.", ok: false },
  fail: { text: "연결하지 못했습니다. 잠시 후 다시 시도해 주세요.", ok: false },
  unconfigured: { text: "카카오 앱 키가 등록되지 않았습니다.", ok: false },
  test: { text: "테스트 메시지를 보냈습니다.", ok: true },
  testfail: {
    text: "일부에게 보내지 못했습니다. 아래 상태를 확인해 주세요.",
    ok: false,
  },
};

/**
 * 입금 확인을 누르면 여기 등록된 사람 전원의 '나와의 채팅'으로 알림이 간다.
 * 받을 사람은 각자 자기 카카오 계정으로 한 번씩 연결해야 한다.
 */
export function KakaoSection({
  recipients,
  configured,
  result,
}: {
  recipients: KakaoRecipient[];
  configured: boolean;
  result?: string;
}) {
  const notice = result ? RESULT_MESSAGE[result] : undefined;

  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-cream-200 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-bark-900">
          카카오 알림
        </h2>
        {notice && (
          <p
            role="status"
            className={
              notice.ok
                ? "text-sm font-medium text-leaf-600"
                : "text-sm font-medium text-red-600"
            }
          >
            {notice.text}
          </p>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-bark-500 break-keep">
        주문 확인 화면에서 <strong className="text-bark-700">입금 확인</strong>을
        누르면 아래 등록된 사람 전원의 카카오톡 &lsquo;나와의 채팅&rsquo;으로
        주문 내역이 갑니다. 받으실 분이 직접 자기 카카오 계정으로 연결해야
        합니다.
      </p>

      {!configured ? (
        <p className="mt-5 rounded-xl bg-cream-100 px-4 py-3.5 text-sm leading-relaxed text-bark-600 break-keep">
          아직 카카오 앱 키가 등록되지 않았습니다. 카카오 개발자 콘솔에서 앱을
          만든 뒤 <code className="text-bark-800">KAKAO_REST_API_KEY</code>를
          환경변수에 넣으면 이 자리에 연결 버튼이 나옵니다.
        </p>
      ) : (
        <>
          <ul className="mt-5 space-y-2">
            {recipients.length === 0 && (
              <li className="rounded-xl bg-cream-100/70 px-4 py-8 text-center text-sm text-bark-400">
                아직 연결된 사람이 없습니다.
              </li>
            )}

            {recipients.map((recipient) => (
              <li
                key={recipient.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream-100/70 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-bark-800">
                    {recipient.nickname || "이름 없음"}
                  </p>
                  <p className="mt-0.5 text-xs text-bark-400 tabular-nums">
                    {recipient.last_error ? (
                      <span className="text-red-600">
                        {recipient.last_error}
                      </span>
                    ) : recipient.last_sent_at ? (
                      `마지막 발송 ${formatKst(recipient.last_sent_at)}`
                    ) : (
                      "아직 보낸 적 없음"
                    )}
                  </p>
                </div>

                <ConfirmForm
                  action={disconnectKakao}
                  id={recipient.id}
                  message={`${recipient.nickname || "이 사람"}의 알림 연결을 해제할까요?`}
                >
                  <button
                    type="submit"
                    className="text-xs text-bark-400 underline-offset-4 transition-colors hover:text-red-600 hover:underline"
                  >
                    연결 해제
                  </button>
                </ConfirmForm>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <a
              href="/api/kakao/connect"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#FEE500] px-6 text-sm font-semibold text-[#191600] transition-opacity hover:opacity-85"
            >
              내 카카오톡 연결하기
            </a>

            {recipients.length > 0 && (
              <form action={sendKakaoTest}>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium text-bark-600 ring-1 ring-cream-300 transition-colors hover:text-bark-900"
                >
                  테스트 발송
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </section>
  );
}
