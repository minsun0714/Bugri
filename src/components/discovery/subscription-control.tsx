"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const panel = useRef<HTMLDivElement>(null);
  const { isPending } = mutation;

  function close() {
    panel.current?.hidePopover?.();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const positions = new Map<
      Element,
      { top: number; left: number }
    >();
    for (
      let ancestor = trigger.current?.parentElement;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      positions.set(ancestor, {
        top: ancestor.scrollTop,
        left: ancestor.scrollLeft,
      });
    }
    if (document.scrollingElement) {
      const element = document.scrollingElement;
      positions.set(element, {
        top: element.scrollTop,
        left: element.scrollLeft,
      });
    }
    function dismiss() {
      panel.current?.hidePopover?.();
      setOpen(false);
    }
    function onScroll(event: Event) {
      const element =
        event.target === document
          ? document.scrollingElement
          : event.target;
      if (!(element instanceof Element)) return;
      const initial = positions.get(element);
      // A trigger may have just scrolled into view; ignore its queued scroll event.
      if (
        initial &&
        (element.scrollTop !== initial.top ||
          element.scrollLeft !== initial.left)
      )
        dismiss();
    }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  async function toggle() {
    if (isPending || disabled) return;
    if (!signedIn) {
      close();
      if (trigger.current) onLogin(trigger.current);
      return;
    }
    try {
      await mutation.mutateAsync({ target, subscribed });
      close();
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
          close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          close();
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
        popoverTarget={
          subscribed && signedIn ? panelId : undefined
        }
        onClick={(event) => {
          if (isPending || disabled) {
            event.preventDefault();
            return;
          }
          if (!signedIn) {
            event.preventDefault();
            if (trigger.current) onLogin(trigger.current);
            return;
          }
          if (subscribed) setOpen(!open);
          else {
            event.preventDefault();
            void toggle();
          }
        }}
      >
        {isPending ? (
          "저장 중…"
        ) : subscribed ? (
          <>
            <span aria-hidden="true">✓</span> 구독 중{" "}
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="size-3.5 shrink-0 self-center"
            >
              <path
                d="m4 6 4 4 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
      {subscribed && (
        <div
          ref={panel}
          id={panelId}
          popover="auto"
          aria-hidden={!open}
          onToggle={(event) =>
            setOpen(event.newState === "open")
          }
          className="fixed inset-auto top-[anchor(bottom)] right-[anchor(right)] m-0 mt-2 w-max max-w-[calc(100vw-16px)] rounded-2xl border border-line bg-surface p-1 text-foreground shadow-[0_8px_24px_-8px_var(--color-primary)] [position-anchor:auto] [position-try-fallbacks:flip-block,flip-inline,flip-block_flip-inline]"
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
