"use client";

import { useId, useRef, useState } from "react";
import type { SubscriptionTarget } from "@/api/contracts";
import { discoveryStyles } from "@/components/discovery/styles";
import { Button } from "@/components/ui";
import { useSubscribe } from "@/components/discovery/queries";

export function SubscriptionControl({
  userId,
  name,
  target,
  subscribed,
  signedIn,
  onLogin,
  onSuccess,
  onRemoved,
  disabled = false,
}: {
  userId: string;
  name: string;
  target: SubscriptionTarget;
  subscribed: boolean;
  signedIn: boolean;
  onLogin: (trigger: HTMLElement) => void;
  onSuccess: (message: string) => void;
  onRemoved?: () => void;
  disabled?: boolean;
}) {
  const mutation = useSubscribe(userId);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { isPending } = mutation;

  async function toggle() {
    if (isPending || disabled) return;
    if (!signedIn) {
      setOpen(false);
      if (trigger.current) onLogin(trigger.current);
      return;
    }
    try {
      await mutation.mutateAsync({ target, subscribed });
      setOpen(false);
      onSuccess(
        `${name}${target.type === "PERSON" ? "님" : ""}${subscribed ? " 구독을 취소했습니다." : "을 구독했습니다."}`,
      );
      requestAnimationFrame(() => {
        if (subscribed && onRemoved) onRemoved();
        else trigger.current?.focus();
      });
    } catch {
      // Keep the action and its error together so retry preserves context.
    }
  }

  return (
    <div
      className="relative ml-auto max-w-full"
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null,
          )
        )
          setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <Button
        ref={trigger}
        data-subscription-target={JSON.stringify(target)}
        disabled={disabled}
        variant="secondary"
        className={`${discoveryStyles.subscriptionButton} ${subscribed ? discoveryStyles.subscribed : discoveryStyles.unsubscribed}`}
        aria-disabled={isPending}
        aria-label={`${name} ${subscribed ? "구독 중 · 관리" : "구독하기"}`}
        aria-expanded={subscribed ? open : undefined}
        aria-controls={subscribed ? panelId : undefined}
        onClick={() => {
          if (isPending || disabled) return;
          if (!signedIn) {
            if (trigger.current) onLogin(trigger.current);
            return;
          }
          if (subscribed) setOpen(!open);
          else void toggle();
        }}
      >
        {isPending ? (
          "저장 중…"
        ) : subscribed ? (
          <>
            <span aria-hidden="true">✓</span> 구독 중{" "}
            <span aria-hidden="true">⌄</span>
          </>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="text-base leading-none"
            >
              +
            </span>{" "}
            구독하기
          </>
        )}
      </Button>
      {open && subscribed && (
        <div
          id={panelId}
          className="mt-2 flex justify-end rounded-2xl border border-line bg-surface p-1"
        >
          <Button
            variant="ghost"
            className="!min-h-11 !rounded-full !shadow-none"
            aria-disabled={isPending}
            aria-label={`${name} 구독 해제`}
            onClick={() => void toggle()}
          >
            구독 해제
          </Button>
        </div>
      )}
      {mutation.error && (
        <p
          role="alert"
          className="mt-2 max-w-64 text-sm text-foreground"
        >
          구독을 저장하지 못했습니다. 기존 상태는
          유지됩니다. 다시 눌러 주세요.
        </p>
      )}
    </div>
  );
}
