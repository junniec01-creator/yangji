"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { submitOrder } from "@/app/order/actions";
import { INITIAL_ORDER_FORM_STATE } from "@/app/order/form-state";
import { MAX_QUANTITY, calcPrice, isRemoteArea } from "@/lib/orders";
import {
  BOX_OPTIONS,
  SELLERS,
  SHIPPING,
  formatPrice,
  type BoxId,
  type SellerId,
} from "@/lib/products";

interface DaumPostcodeResult {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: "R" | "J";
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeResult) => void;
  onclose?: () => void;
  width?: string;
  height?: string;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: DaumPostcodeOptions) => {
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

const INPUT_BASE =
  "w-full rounded-xl bg-white px-4 py-3 text-bark-800 outline-none ring-1 transition-shadow placeholder:text-bark-300 focus:ring-2";
const INPUT_NORMAL = "ring-cream-300 focus:ring-peach-400";
const INPUT_ERROR = "ring-red-400 focus:ring-red-500";

function inputClass(hasError: boolean) {
  return `${INPUT_BASE} ${hasError ? INPUT_ERROR : INPUT_NORMAL}`;
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2.5 flex items-center gap-1 text-sm font-semibold text-bark-800"
      >
        {label}
        {required && <span className="text-peach-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-2 text-xs text-bark-400">{hint}</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SectionCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-cream-200 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-peach-100 text-xs font-semibold text-peach-700 tabular-nums">
          {step}
        </span>
        <h2 className="font-display text-lg font-bold text-bark-900">
          {title}
        </h2>
      </div>
      <div className="mt-7 space-y-6">{children}</div>
    </section>
  );
}

export function OrderForm({ defaultBoxId }: { defaultBoxId: BoxId }) {
  const [state, formAction, pending] = useActionState(
    submitOrder,
    INITIAL_ORDER_FORM_STATE,
  );

  const [sellerId, setSellerId] = useState<SellerId | "">("");
  const [boxId, setBoxId] = useState<BoxId>(defaultBoxId);
  const [quantity, setQuantity] = useState(1);
  const [recipientSame, setRecipientSame] = useState(true);
  const [postcode, setPostcode] = useState("");
  const [address1, setAddress1] = useState("");
  const [depositorTouched, setDepositorTouched] = useState(false);
  const [postcodeReady, setPostcodeReady] = useState(false);
  const [postcodeOpen, setPostcodeOpen] = useState(false);
  const postcodeBoxRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    ordererName: "",
    ordererPhone: "",
    recipientName: "",
    recipientPhone: "",
    address2: "",
    depositorName: "",
    memo: "",
  });

  const update =
    (key: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));

  // 입금자명은 따로 고치기 전까지 주문자 성함을 따라간다.
  const depositorName = depositorTouched
    ? form.depositorName
    : form.ordererName;

  const isRemote = postcode ? isRemoteArea(postcode, address1) : false;
  const price = calcPrice(boxId, quantity, isRemote);
  const selectedBox = BOX_OPTIONS.find((box) => box.id === boxId);
  const errors = state.fieldErrors;

  // 주소 검색은 팝업 창 대신 화면 안 레이어로 띄운다.
  // 모바일에서 팝업이 화면 밖으로 밀려나는 문제를 피하기 위해서다.
  useEffect(() => {
    if (!postcodeOpen) return;

    const container = postcodeBoxRef.current;
    if (!window.daum || !container) return;

    container.replaceChildren();
    new window.daum.Postcode({
      width: "100%",
      height: "100%",
      oncomplete: (data) => {
        setPostcode(data.zonecode);
        setAddress1(
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress,
        );
        setPostcodeOpen(false);
      },
      onclose: () => setPostcodeOpen(false),
    }).embed(container);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [postcodeOpen]);

  return (
    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
        onReady={() => setPostcodeReady(true)}
      />

      <form
        action={formAction}
        className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-6"
      >
        <div className="space-y-5">
          {state.message && (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 ring-1 ring-red-200"
            >
              {state.message}
            </p>
          )}

          {/* 수익 분배의 기준이 되는 값이라 놓치지 않도록 맨 위에 크게 둔다. */}
          <fieldset className="rounded-3xl bg-peach-500 p-6 sm:p-8">
            <legend className="sr-only">소개해 주신 분</legend>
            <p className="text-base font-bold text-white">
              소개해 주신 분 <span className="text-white/70">*</span>
            </p>
            <p className="mt-1.5 text-sm text-white/80 break-keep">
              어느 분을 통해 알게 되셨는지 골라 주세요.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SELLERS.map((seller) => (
                <label key={seller.id} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="sellerId"
                    value={seller.id}
                    checked={seller.id === sellerId}
                    onChange={() => setSellerId(seller.id)}
                    className="peer sr-only"
                  />
                  <span className="flex h-14 items-center justify-center rounded-2xl bg-white/15 text-base font-semibold text-white ring-1 ring-white/40 transition-colors peer-checked:bg-white peer-checked:text-peach-700 peer-checked:ring-2 peer-checked:ring-white peer-focus-visible:ring-2 peer-focus-visible:ring-white">
                    {seller.name}
                  </span>
                </label>
              ))}
            </div>

            {errors.sellerId && (
              <p className="mt-3 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-medium text-red-600">
                {errors.sellerId}
              </p>
            )}
          </fieldset>

          <SectionCard step={1} title="주문자 정보">
            <Field
              label="성함"
              htmlFor="ordererName"
              required
              error={errors.ordererName}
            >
              <input
                id="ordererName"
                name="ordererName"
                value={form.ordererName}
                onChange={update("ordererName")}
                autoComplete="name"
                placeholder="홍길동"
                className={inputClass(Boolean(errors.ordererName))}
              />
            </Field>

            <Field
              label="연락처"
              htmlFor="ordererPhone"
              required
              hint="배송 관련 연락에만 사용합니다."
              error={errors.ordererPhone}
            >
              <input
                id="ordererPhone"
                name="ordererPhone"
                value={form.ordererPhone}
                onChange={update("ordererPhone")}
                inputMode="tel"
                autoComplete="tel"
                placeholder="010-1234-5678"
                className={inputClass(Boolean(errors.ordererPhone))}
              />
            </Field>
          </SectionCard>

          <SectionCard step={2} title="상품 선택">
            <fieldset>
              <legend className="mb-2.5 text-sm font-semibold text-bark-800">
                박스 크기 <span className="text-peach-500">*</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {BOX_OPTIONS.map((box) => (
                  <label key={box.id} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="boxId"
                      value={box.id}
                      checked={box.id === boxId}
                      onChange={() => setBoxId(box.id)}
                      className="peer sr-only"
                    />
                    <span className="block rounded-2xl bg-white p-4 ring-1 ring-cream-300 transition-shadow peer-checked:bg-peach-50 peer-checked:ring-2 peer-checked:ring-peach-400 peer-focus-visible:ring-2 peer-focus-visible:ring-peach-400">
                      <span className="block text-sm font-semibold text-bark-900">
                        {box.name}
                      </span>
                      <span className="mt-1 block text-xs text-bark-400 tabular-nums">
                        {box.weightLabel} · {box.countLabel}
                      </span>
                      <span className="mt-3 block text-lg font-semibold text-bark-900 tabular-nums">
                        {formatPrice(box.price)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.boxId && (
                <p className="mt-2 text-xs text-red-600">{errors.boxId}</p>
              )}
            </fieldset>

            <Field
              label="수량"
              htmlFor="quantity"
              required
              error={errors.quantity}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((n) => Math.max(1, n - 1))}
                  aria-label="수량 줄이기"
                  className="h-12 w-12 shrink-0 rounded-xl bg-white text-xl text-bark-500 ring-1 ring-cream-300 transition-colors hover:text-peach-600"
                >
                  −
                </button>
                <input
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(event) => {
                    const next = Number(event.target.value.replace(/\D/g, ""));
                    setQuantity(
                      Number.isFinite(next)
                        ? Math.min(MAX_QUANTITY, Math.max(1, next))
                        : 1,
                    );
                  }}
                  inputMode="numeric"
                  className={`${inputClass(Boolean(errors.quantity))} text-center tabular-nums`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((n) => Math.min(MAX_QUANTITY, n + 1))
                  }
                  aria-label="수량 늘리기"
                  className="h-12 w-12 shrink-0 rounded-xl bg-white text-xl text-bark-500 ring-1 ring-cream-300 transition-colors hover:text-peach-600"
                >
                  +
                </button>
              </div>
            </Field>
          </SectionCard>

          <SectionCard step={3} title="받으실 분 · 배송지">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-cream-100 px-4 py-3.5">
              <input
                type="checkbox"
                name="recipientSame"
                checked={recipientSame}
                onChange={(event) => setRecipientSame(event.target.checked)}
                className="h-4 w-4 accent-peach-500"
              />
              <span className="text-sm text-bark-700">
                주문자와 받으실 분이 같습니다
              </span>
            </label>

            {!recipientSame && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="받으실 분 성함"
                  htmlFor="recipientName"
                  required
                  error={errors.recipientName}
                >
                  <input
                    id="recipientName"
                    name="recipientName"
                    value={form.recipientName}
                    onChange={update("recipientName")}
                    placeholder="김복순"
                    className={inputClass(Boolean(errors.recipientName))}
                  />
                </Field>
                <Field
                  label="받으실 분 연락처"
                  htmlFor="recipientPhone"
                  required
                  error={errors.recipientPhone}
                >
                  <input
                    id="recipientPhone"
                    name="recipientPhone"
                    value={form.recipientPhone}
                    onChange={update("recipientPhone")}
                    inputMode="tel"
                    placeholder="010-1234-5678"
                    className={inputClass(Boolean(errors.recipientPhone))}
                  />
                </Field>
              </div>
            )}

            <Field
              label="주소"
              htmlFor="addressSearch"
              required
              error={errors.postcode ?? errors.address1 ?? errors.address2}
            >
              {/* 주소는 검색으로만 채운다. 표시 칸 아무 곳이나 눌러도 열린다. */}
              <div className="flex gap-2">
                <button
                  type="button"
                  id="addressSearch"
                  onClick={() => setPostcodeOpen(true)}
                  disabled={!postcodeReady}
                  className={`flex min-w-0 flex-1 items-center rounded-xl bg-white px-4 py-3 text-left outline-none ring-1 transition-shadow disabled:opacity-60 ${
                    errors.postcode ?? errors.address1
                      ? "ring-red-400"
                      : "ring-cream-300 hover:ring-peach-300 focus-visible:ring-2 focus-visible:ring-peach-400"
                  }`}
                >
                  {address1 ? (
                    <span className="truncate text-bark-800">
                      <span className="text-bark-400 tabular-nums">
                        ({postcode})
                      </span>{" "}
                      {address1}
                    </span>
                  ) : (
                    <span className="truncate text-bark-300">
                      눌러서 주소를 검색해 주세요
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPostcodeOpen(true)}
                  disabled={!postcodeReady}
                  className="shrink-0 rounded-xl bg-bark-900 px-4 text-sm font-medium text-white transition-colors hover:bg-bark-800 disabled:opacity-40"
                >
                  주소 찾기
                </button>
              </div>

              <input type="hidden" name="postcode" value={postcode} />
              <input type="hidden" name="address1" value={address1} />

              <input
                name="address2"
                value={form.address2}
                onChange={update("address2")}
                placeholder="상세주소 (동·호수 등)"
                className={`${inputClass(Boolean(errors.address2))} mt-3`}
              />
            </Field>

            {isRemote && (
              <p className="rounded-xl bg-peach-50 px-4 py-3 text-sm text-peach-700 ring-1 ring-peach-200 break-keep">
                {SHIPPING.remoteLabel} 지역이라 택배사 추가 요금{" "}
                {formatPrice(SHIPPING.remoteSurcharge)}이 더해집니다.
              </p>
            )}
          </SectionCard>

          <SectionCard step={4} title="입금 · 요청사항">
            <Field
              label="입금자명"
              htmlFor="depositorName"
              required
              hint="주문자 성함과 다르면 고쳐 주세요."
              error={errors.depositorName}
            >
              <input
                id="depositorName"
                name="depositorName"
                value={depositorName}
                onChange={(event) => {
                  setDepositorTouched(true);
                  update("depositorName")(event);
                }}
                placeholder="홍길동"
                className={inputClass(Boolean(errors.depositorName))}
              />
            </Field>

            <Field
              label="요청사항"
              htmlFor="memo"
              hint="원하는 품종, 도착 희망일, 부재 시 안내 등을 남겨 주세요."
              error={errors.memo}
            >
              <textarea
                id="memo"
                name="memo"
                value={form.memo}
                onChange={update("memo")}
                rows={4}
                maxLength={500}
                placeholder="선택 입력"
                className={`${inputClass(Boolean(errors.memo))} resize-none`}
              />
            </Field>
          </SectionCard>
        </div>

        <aside className="lg:sticky lg:top-20">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-cream-200">
            <h2 className="font-display text-base font-bold text-bark-900">
              결제 금액
            </h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-bark-400">
                  {selectedBox?.name} × {quantity}
                </dt>
                <dd className="text-bark-800 tabular-nums">
                  {formatPrice(price.itemTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-bark-400">배송비</dt>
                <dd className="text-bark-800 tabular-nums">
                  {price.shippingFee === 0
                    ? "무료"
                    : formatPrice(price.shippingFee)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-cream-200 pt-5">
              <span className="text-sm font-semibold text-bark-800">합계</span>
              <span className="text-3xl font-semibold text-bark-900 tabular-nums">
                {formatPrice(price.total)}
              </span>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-peach-500 text-[0.9375rem] font-semibold text-white shadow-[0_10px_30px_-10px] shadow-peach-500/60 transition-colors hover:bg-peach-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "접수 중..." : "주문 접수하기"}
            </button>

            <p className="mt-4 text-xs leading-relaxed text-bark-400 break-keep">
              접수 후 안내되는 계좌로 입금해 주시면 확인 뒤 발송됩니다. 카드
              결제는 아직 지원하지 않습니다.
            </p>
          </div>
        </aside>
      </form>

      {postcodeOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bark-900/50 p-0 sm:items-center sm:p-6">
          <div className="flex h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white sm:h-[32rem] sm:rounded-3xl">
            <div className="flex shrink-0 items-center justify-between border-b border-cream-200 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-bark-900">주소 찾기</h2>
              <button
                type="button"
                onClick={() => setPostcodeOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-bark-500 transition-colors hover:bg-cream-100"
              >
                닫기
              </button>
            </div>
            <div ref={postcodeBoxRef} className="min-h-0 flex-1" />
          </div>
        </div>
      )}
    </>
  );
}
