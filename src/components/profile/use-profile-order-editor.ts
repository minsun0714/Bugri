"use client";
import {
  type UiMessage,
  message,
} from "@/lib/i18n/messages";

import { useRef, useState, type PointerEvent } from "react";
import { ProfileSection } from "@/api/constants";
import {
  defaultProfileOrder,
  moveProfileSection,
} from "@/lib/profile-order";
import { useProfileOrder } from "@/components/profile/use-profile-order";

export const profileSectionLabels: Record<
  ProfileSection,
  string
> = {
  DESK: "내 데스크",
  QUIZZES: "최신 공개 퀴즈",
  ACTIVITY: "학습 활동",
};

export function useProfileOrderEditor(
  userId: string,
  publicId: string,
  owner: boolean,
  onNotice: (message: UiMessage, duration?: number) => void,
) {
  const { profile, update } = useProfileOrder(
    userId,
    publicId,
  );
  const [draft, setDraft] = useState<
    ProfileSection[] | null
  >(null);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] =
    useState<UiMessage>("");
  const [drag, setDrag] = useState<{
    from: ProfileSection;
    to: ProfileSection;
  } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const handles = useRef<
    Partial<
      Record<ProfileSection, HTMLButtonElement | null>
    >
  >({});
  const editing = owner && draft !== null;
  const savedOrder =
    profile.data?.order ?? defaultProfileOrder;
  const order = editing ? draft : savedOrder;
  const busy = update.isPending;

  function finish() {
    setDraft(null);
    setDrag(null);
    setFailed(false);
    requestAnimationFrame(() =>
      editButton.current?.focus(),
    );
  }

  function move(from: ProfileSection, to: ProfileSection) {
    if (!editing || busy || from === to) return;
    const next = moveProfileSection(order, from, to);
    setDraft(next);
    setAnnouncement(
      message("{0}, {1}번째로 이동했습니다.", {
        0: message(profileSectionLabels[from]),
        1: next.indexOf(from) + 1,
      }),
    );
    requestAnimationFrame(() =>
      handles.current[from]?.focus(),
    );
  }

  function dragOver(
    event: PointerEvent<HTMLButtonElement>,
  ) {
    if (!drag) return;
    const targets =
      root.current?.querySelectorAll<HTMLElement>(
        "[data-order-row]",
      );
    for (const target of targets ?? []) {
      const { top, bottom } =
        target.getBoundingClientRect();
      if (event.clientY >= top && event.clientY <= bottom) {
        setDrag({
          from: drag.from,
          to: target.dataset.orderRow as ProfileSection,
        });
        return;
      }
    }
    setDrag({ from: drag.from, to: drag.from });
  }

  function beginDrag(
    id: ProfileSection,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    if (event.button !== 0 || busy) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ from: id, to: id });
  }

  function start() {
    update.reset();
    setDraft([...order]);
    requestAnimationFrame(() =>
      handles.current[order[0]]?.focus(),
    );
  }

  async function save() {
    setFailed(false);
    try {
      await update.mutateAsync({ order });
      finish();
      onNotice("섹션 순서를 저장했습니다.", 4000);
    } catch {
      setFailed(true);
    }
  }

  return {
    profile,
    failed,
    announcement,
    drag,
    setDrag,
    root,
    editButton,
    handles,
    editing,
    order,
    savedOrder,
    busy,
    finish,
    move,
    dragOver,
    beginDrag,
    start,
    save,
  };
}
