"use client";

import type { ReactNode } from "react";
import type { ProfileSection } from "@/api/constants";
import {
  useProfileOrderEditor,
  profileSectionLabels as labels,
} from "@/components/profile/use-profile-order-editor";
import { profileStyles } from "@/components/profile/styles";
import { Button, Modal, Skeleton } from "@/components/ui";

export function ProfileSections({
  userId,
  publicId,
  owner,
  sections,
  onNotice,
}: {
  userId: string;
  publicId: string;
  owner: boolean;
  sections: Record<ProfileSection, ReactNode>;
  onNotice: (message: string, duration?: number) => void;
}) {
  const {
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
  } = useProfileOrderEditor(
    userId,
    publicId,
    owner,
    onNotice,
  );

  if (profile.isPending) return <Skeleton />;
  if (profile.error && !profile.data)
    return (
      <div role="alert" className="space-y-3">
        <p>섹션 순서를 불러오지 못했습니다.</p>
        <div className="flex justify-end">
          <Button onClick={() => void profile.refetch()}>
            다시 불러오기
          </Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      {owner && (
        <div className="flex justify-end">
          <Button
            ref={editButton}
            variant="ghost"
            className={profileStyles.actionButton}
            onClick={start}
          >
            순서 편집
          </Button>
        </div>
      )}
      {savedOrder.map((id) => (
        <div
          key={id}
          data-profile-section={id}
          className="min-w-0"
        >
          {sections[id]}
        </div>
      ))}
      {editing && (
        <Modal
          open
          onClose={() => {
            if (!busy) finish();
          }}
          title="순서 편집"
          initialFocusSelector="[data-order-handle]"
        >
          <div
            ref={root}
            className="space-y-2"
            role="list"
            aria-label="프로필 섹션 순서"
          >
            <span
              role="status"
              aria-live="polite"
              className="sr-only"
            >
              {announcement}
            </span>
            {order.map((id, index) => (
              <div
                key={id}
                data-order-row={id}
                role="listitem"
                className={`${profileStyles.sortRow} ${drag?.to === id ? "border-primary bg-primary/5" : "border-line bg-surface"}`}
              >
                {editing && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      ref={(node) => {
                        handles.current[id] = node;
                      }}
                      data-order-handle
                      variant="ghost"
                      disabled={busy}
                      aria-label={`${labels[id]} 드래그하여 이동`}
                      className="!min-h-11 !min-w-11 !touch-none !cursor-grab !px-2 active:!cursor-grabbing"
                      onPointerDown={(event) =>
                        beginDrag(id, event)
                      }
                      onPointerMove={dragOver}
                      onPointerUp={(event) => {
                        if (drag) move(drag.from, drag.to);
                        setDrag(null);
                        if (
                          event.currentTarget.hasPointerCapture(
                            event.pointerId,
                          )
                        )
                          event.currentTarget.releasePointerCapture(
                            event.pointerId,
                          );
                      }}
                      onPointerCancel={() => setDrag(null)}
                      onLostPointerCapture={() =>
                        setDrag(null)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setDrag(null);
                          return;
                        }
                        const target =
                          event.key === "ArrowUp"
                            ? order[index - 1]
                            : event.key === "ArrowDown"
                              ? order[index + 1]
                              : undefined;
                        if (target) {
                          event.preventDefault();
                          move(id, target);
                        }
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="text-xl text-muted"
                      >
                        ⠿
                      </span>
                    </Button>
                    <span className="min-w-0 flex-1 text-sm font-semibold">
                      {labels[id]}
                    </span>
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        className="!min-h-11 !min-w-11 !px-2"
                        aria-label={`${labels[id]} 위로 이동`}
                        disabled={busy || index === 0}
                        onClick={() =>
                          move(id, order[index - 1])
                        }
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        className="!min-h-11 !min-w-11 !px-2"
                        aria-label={`${labels[id]} 아래로 이동`}
                        disabled={
                          busy || index === order.length - 1
                        }
                        onClick={() =>
                          move(id, order[index + 1])
                        }
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {failed && (
            <div
              role="alert"
              className="mt-4 text-sm text-foreground"
            >
              순서를 저장하지 못했습니다. 변경한 순서는
              유지됩니다. 다시 시도해 주세요.
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={finish}
            >
              취소
            </Button>
            <Button
              loading={busy}
              onClick={() => void save()}
            >
              {failed ? "다시 저장" : "저장"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
