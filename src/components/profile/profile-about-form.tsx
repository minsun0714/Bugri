"use client";

import { useUnsavedWarning } from "@/features/quiz-authoring/use-unsaved-warning";

import { useEffect, useId, useRef, useState } from "react";
import type { ProfileAbout } from "@/api/contracts";
import { ProfileLinkKind } from "@/api/constants";
import { Button, TextField } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { profileLinkLabels } from "@/lib/profile-about";
import { useProfileForm } from "@/components/profile/use-profile-form";

export function ProfileAboutForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: ProfileAbout;
  onSave: (value: ProfileAbout) => Promise<unknown>;
  onCancel: () => void;
}) {
  const form = useProfileForm(initial, onSave);
  const {
    biography,
    setBiography,
    rows,
    errors,
    failure,
    busy,
    dirty,
    changeLink,
    addLink,
    removeLink,
    save,
  } = form;
  const root = useRef<HTMLFormElement>(null);
  const addButton = useRef<HTMLDivElement>(null);
  const id = useId();
  const [discard, setDiscard] = useState(false);

  useEffect(() => {
    root.current
      ?.querySelector<HTMLTextAreaElement>("textarea")
      ?.focus();
  }, []);

  useUnsavedWarning(dirty);

  useEffect(() => {
    if (Object.keys(errors).length)
      root.current
        ?.querySelector<HTMLElement>(
          '[aria-invalid="true"]',
        )
        ?.focus();
  }, [errors]);

  return (
    <form
      ref={root}
      noValidate
      className="space-y-5"
      aria-label="프로필 편집"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <h2 className="text-xl">프로필 편집</h2>
      <fieldset
        disabled={busy}
        className="min-w-0 space-y-5"
      >
        <MarkdownEditor
          label="자기소개 (선택)"
          placeholder="관심 분야와 하고 있는 일을 자유롭게 소개해 보세요."
          limit={Infinity}
          value={biography}
          onChange={setBiography}
        />
        <section
          aria-label="프로필 링크"
          className="space-y-3"
        >
          <h3 className="text-sm">링크 (선택)</h3>
          {rows.map(({ id: rowId, link }, index) => (
            <div
              key={rowId}
              className="grid min-w-0 items-start gap-3 rounded-2xl border border-line p-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
            >
              <Dropdown
                label={`링크 종류 ${index + 1}`}
                value={link.kind}
                onValueChange={(kind) =>
                  changeLink(rowId, {
                    kind: kind as ProfileLinkKind,
                  })
                }
                options={Object.entries(
                  profileLinkLabels,
                ).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <div className="min-w-0 space-y-3">
                {link.kind === ProfileLinkKind.OTHER && (
                  <TextField
                    label={`표시 이름 ${index + 1}`}
                    value={link.label ?? ""}
                    error={errors[`links.${index}.label`]}
                    onChange={(event) =>
                      changeLink(rowId, {
                        label: event.target.value,
                      })
                    }
                  />
                )}
                <TextField
                  id={`${id}-url-${rowId}`}
                  label={`URL ${index + 1}`}
                  type="url"
                  placeholder="https://"
                  value={link.url}
                  error={errors[`links.${index}.url`]}
                  onChange={(event) =>
                    changeLink(rowId, {
                      url: event.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end sm:pt-6">
                <Button
                  variant="ghost"
                  aria-label={`링크 ${index + 1} 삭제`}
                  onClick={() => {
                    removeLink(rowId);
                    addButton.current
                      ?.querySelector("button")
                      ?.focus();
                  }}
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
          <div ref={addButton} className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                const rowId = addLink();
                requestAnimationFrame(() =>
                  document
                    .getElementById(`${id}-url-${rowId}`)
                    ?.focus(),
                );
              }}
            >
              링크 추가
            </Button>
          </div>
        </section>
      </fieldset>
      {failure && <p role="alert">{failure}</p>}
      {discard ? (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-line p-4"
        >
          <p>저장하지 않은 변경을 취소할까요?</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setDiscard(false)}
            >
              계속 편집
            </Button>
            <Button variant="danger" onClick={onCancel}>
              변경 취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() =>
              dirty ? setDiscard(true) : onCancel()
            }
          >
            취소
          </Button>
          <Button type="submit" loading={busy}>
            {busy ? "저장 중…" : "저장"}
          </Button>
        </div>
      )}
    </form>
  );
}
