"use client";

import { useRef, useState, type ReactNode } from "react";
import Markdown from "react-markdown";
import { ProfileLinkKind } from "@/api/constants";
import { Button, Skeleton } from "@/components/ui";
import { styles } from "@/components/ui/styles";
import { useProfileAbout } from "@/components/profile/use-profile-about";
import { ProfileAboutForm } from "@/components/profile/profile-about-form";
import { EditIcon } from "@/components/profile/edit-icon";
import { ProfileLinkIcon } from "@/components/profile/profile-link-icon";
import { profileStyles } from "@/components/profile/styles";
import { profileLinkLabels } from "@/lib/profile-about";

export function ProfileAbout({
  userId,
  publicId,
  owner,
  identity,
  visitorAction,
  ownerAction,
  onNotice,
}: {
  userId: string;
  publicId: string;
  owner: boolean;
  identity: ReactNode;
  visitorAction: ReactNode;
  ownerAction?: ReactNode;
  onNotice: (message: string, duration?: number) => void;
}) {
  const { profile, update } = useProfileAbout(
    userId,
    publicId,
  );
  const [editing, setEditing] = useState(false);
  const root = useRef<HTMLElement>(null);

  function close() {
    setEditing(false);
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLButtonElement>(
          "[data-profile-edit]",
        )
        ?.focus(),
    );
  }

  let content: ReactNode = null;
  if (profile.isPending) content = <Skeleton />;
  else if (profile.error)
    content = (
      <div role="alert" className="space-y-3">
        <p>자기소개와 링크를 불러오지 못했습니다.</p>
        <Button onClick={() => void profile.refetch()}>
          프로필 다시 불러오기
        </Button>
      </div>
    );
  else if (owner && editing)
    content = (
      <ProfileAboutForm
        initial={profile.data}
        onCancel={close}
        onSave={async (value) => {
          await update.mutateAsync(value);
          onNotice("프로필을 저장했습니다.", 4000);
          close();
        }}
      />
    );
  else {
    const { biography, links } = profile.data;
    if (biography.trim() || links.length)
      content = (
        <section
          aria-label="자기소개와 링크"
          className="min-w-0 space-y-3"
        >
          {biography.trim() && (
            <div
              className={`${styles["markdown-preview"]} ${profileStyles.biography}`}
            >
              <Markdown
                skipHtml
                components={{
                  img: ({ alt }) => (
                    <span>[이미지: {alt ?? ""}]</span>
                  ),
                }}
              >
                {biography}
              </Markdown>
            </div>
          )}
          {links.length > 0 && (
            <ul
              aria-label="프로필 링크"
              className="flex flex-wrap items-center gap-x-5 gap-y-1"
            >
              {links.map(({ kind, label, url }, index) => (
                <li
                  key={index}
                  className="min-w-0 max-w-full"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={profileStyles.link}
                  >
                    <ProfileLinkIcon kind={kind} />
                    <span className="min-w-0 break-all">
                      {kind === ProfileLinkKind.OTHER
                        ? label
                        : profileLinkLabels[kind]}
                      {kind === ProfileLinkKind.OTHER && (
                        <span className="ml-1.5 inline-block max-w-full break-all align-bottom text-xs font-normal text-muted">
                          · {new URL(url).hostname}
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      ↗
                    </span>
                    <span className="sr-only">
                      {" "}
                      (새 탭)
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      );
  }

  return (
    <section
      ref={root}
      aria-label="공개 프로필 정보"
      className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto]"
    >
      <header className="min-w-0 self-center">
        {identity}
      </header>
      {owner ? (
        !editing && (
          <div
            role="group"
            aria-label="프로필 관리"
            className="flex items-center justify-end gap-3"
          >
            {ownerAction}
            <Button
              data-profile-edit
              variant="ghost"
              className={profileStyles.actionButton}
              disabled={!profile.data || !!profile.error}
              onClick={() => {
                setEditing(true);
              }}
            >
              <EditIcon />
              프로필 편집
            </Button>
          </div>
        )
      ) : (
        <div className="flex justify-end">
          {visitorAction}
        </div>
      )}
      {content && (
        <div className="min-w-0 sm:col-span-2">
          {content}
        </div>
      )}
    </section>
  );
}
