"use client";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
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
  onNotice: (message: string, duration?: number) => void,
) {
  const { profile, update } = useProfileOrder(
    userId,
    publicId,
  );
  const [draft, setDraft] = useState<
    ProfileSection[] | null
  >(null);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [drag, setDrag] = useState<{
    from: ProfileSection;
    to: ProfileSection;
  } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const pointerY = useRef<number | null>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const handles = useRef<
    Partial<
      Record<ProfileSection, HTMLButtonElement | null>
    >
  >({});
  const editing = owner && draft !== null;
  const order = editing
    ? draft
    : (profile.data?.order ?? defaultProfileOrder);
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
      `${profileSectionLabels[from]}, ${next.indexOf(from) + 1}번째로 이동했습니다.`,
    );
    requestAnimationFrame(() =>
      handles.current[from]?.focus(),
    );
  }

  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    let frame = 0;
    function tick() {
      const y = pointerY.current;
      if (y !== null) {
        const edge = 80;
        const delta =
          y < edge
            ? -12
            : y > window.innerHeight - edge
              ? 12
              : 0;
        if (delta)
          window.scrollBy({
            top: delta,
            behavior: "instant",
          });
        const targets =
          root.current?.querySelectorAll<HTMLElement>(
            "[data-profile-section]",
          );
        for (const target of targets ?? []) {
          const { top, bottom } =
            target.getBoundingClientRect();
          if (y >= top && y <= bottom) {
            const to = target.dataset
              .profileSection as ProfileSection;
            setDrag((current) =>
              current && current.to !== to
                ? { ...current, to }
                : current,
            );
            break;
          }
        }
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dragging]);

  function dragOver(
    event: PointerEvent<HTMLButtonElement>,
  ) {
    pointerY.current = event.clientY;
  }

  function beginDrag(
    id: ProfileSection,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    if (event.button !== 0 || busy) return;
    pointerY.current = event.clientY;
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
    busy,
    finish,
    move,
    dragOver,
    beginDrag,
    start,
    save,
  };
}
