"use client";

import { useRef, useState } from "react";
import Markdown from "react-markdown";
import { Button, Skeleton } from "@/components/ui";
import { styles } from "@/components/ui/styles";
import { useProfileAbout } from "@/components/profile/use-profile-about";
import { ProfileAboutForm } from "@/components/profile/profile-about-form";
import { profileLinkLabels } from "@/lib/profile-about";

export function ProfileAbout({
  userId,
  publicId,
  owner,
}: {
  userId: string;
  publicId: string;
  owner: boolean;
}) {
  const { profile, update } = useProfileAbout(
    userId,
    publicId,
  );
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
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

  if (profile.isPending) return <Skeleton />;
  if (profile.error)
    return (
      <div role="alert" className="space-y-3">
        <p>자기소개와 링크를 불러오지 못했습니다.</p>
        <Button onClick={() => void profile.refetch()}>
          프로필 다시 불러오기
        </Button>
      </div>
    );
  const { biography, links } = profile.data;
  if (!owner && !biography.trim() && !links.length)
    return null;

  return (
    <section
      ref={root}
      aria-label="자기소개와 링크"
      className="min-w-0 space-y-4"
    >
      {owner && editing ? (
        <ProfileAboutForm
          initial={profile.data}
          onCancel={close}
          onSave={async (value) => {
            await update.mutateAsync(value);
            setSaved(true);
            close();
          }}
        />
      ) : (
        <>
          {owner && (
            <div className="flex justify-end">
              <Button
                data-profile-edit
                variant="secondary"
                onClick={() => {
                  setSaved(false);
                  setEditing(true);
                }}
              >
                프로필 편집
              </Button>
            </div>
          )}
          {saved && owner && (
            <p
              role="status"
              className="text-sm text-primary"
            >
              프로필을 저장했습니다.
            </p>
          )}
          {biography.trim() && (
            <div
              className={`${styles["markdown-preview"]} !min-h-0 min-w-0 break-words`}
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
              className="flex flex-wrap gap-3"
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
                    className="inline-block max-w-full break-all rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary underline"
                  >
                    {label ?? profileLinkLabels[kind]}
                    <span className="sr-only">
                      {" "}
                      (새 탭)
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
