"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { useUnsavedWarning } from "@/features/quiz-authoring/use-unsaved-warning";

import { useEffect, useId, useRef, useState } from "react";
import type { ProfileAbout } from "@/api/contracts";
import { ProfileLinkKind } from "@/api/constants";
import { Button, TextField } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { profileLinkLabels } from "@/lib/profile-about";
import { profileStyles } from "@/components/profile/styles";
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
  const t = useTranslation();

  const form = useProfileForm(initial, onSave);
  const {
    biography,
    setBiography,
    rows,
    errors,
    validationAttempt,
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
  const continueButton = useRef<HTMLDivElement>(null);
  const lastInput = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (discard)
      continueButton.current
        ?.querySelector("button")
        ?.focus();
  }, [discard]);

  useEffect(() => {
    root.current
      ?.querySelector<HTMLTextAreaElement>("textarea")
      ?.focus();
  }, []);

  useUnsavedWarning(dirty);

  useEffect(() => {
    if (validationAttempt)
      root.current
        ?.querySelector<HTMLElement>(
          '[aria-invalid="true"]',
        )
        ?.focus();
  }, [validationAttempt]);

  return (
    <form
      ref={root}
      noValidate
      className="space-y-5"
      aria-label={t("프로필 편집")}
      onFocusCapture={({ target }) => {
        if (
          target instanceof HTMLElement &&
          target.matches(
            'input, textarea, [role="combobox"]',
          )
        )
          lastInput.current = target;
      }}
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <h2 className="text-xl">{t("프로필 편집")}</h2>
      <fieldset
        disabled={busy}
        className="min-w-0 space-y-5"
      >
        <MarkdownEditor
          label={t("자기소개 (선택)")}
          placeholder={t(
            "관심 분야와 하고 있는 일을 자유롭게 소개해 보세요.",
          )}
          density="compact"
          limit={Infinity}
          value={biography}
          onChange={setBiography}
        />
        <section
          aria-label={t("프로필 링크")}
          className="space-y-3"
        >
          <h3 className="text-sm">{t("링크 (선택)")}</h3>
          {rows.map(({ id: rowId, link }, index) => (
            <div
              key={rowId}
              className={profileStyles.linkRow}
            >
              <div id={`${id}-kind-${rowId}`}>
                <Dropdown
                  hideLabel
                  triggerClassName="!text-base !font-normal"
                  label={t("링크 종류 {0}", {
                    0: index + 1,
                  })}
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
                    label: t(label),
                  }))}
                />
              </div>
              <div className="col-span-2 min-w-0 space-y-2 sm:col-span-1">
                {link.kind === ProfileLinkKind.OTHER && (
                  <TextField
                    hideLabel
                    className="!text-base"
                    placeholder={t("표시 이름")}
                    label={t("표시 이름 {0}", {
                      0: index + 1,
                    })}
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
                  hideLabel
                  className="!text-base"
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
              <div className="col-start-2 row-start-1 flex justify-end sm:col-start-3">
                <Button
                  variant="ghost"
                  className="!size-11 !min-h-11 !p-0 !text-muted"
                  aria-label={t("링크 {0} 삭제", {
                    0: index + 1,
                  })}
                  onClick={() => {
                    removeLink(rowId);
                    addButton.current
                      ?.querySelector("button")
                      ?.focus();
                  }}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
          <div ref={addButton}>
            <Button
              variant="ghost"
              aria-label={t("링크 추가")}
              className={profileStyles.addLink}
              onClick={() => {
                const rowId = addLink();
                requestAnimationFrame(() =>
                  document
                    .getElementById(`${id}-kind-${rowId}`)
                    ?.querySelector<HTMLButtonElement>(
                      '[role="combobox"]',
                    )
                    ?.focus(),
                );
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Button>
          </div>
        </section>
      </fieldset>
      {failure && <p role="alert">{t(failure)}</p>}
      {discard ? (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-line p-4"
        >
          <p>{t("저장하지 않은 변경을 취소할까요?")}</p>
          <div
            ref={continueButton}
            className="flex flex-wrap justify-end gap-2"
          >
            <Button
              variant="secondary"
              onClick={() => {
                setDiscard(false);
                if (lastInput.current?.isConnected)
                  lastInput.current.focus();
                else
                  root.current
                    ?.querySelector<HTMLTextAreaElement>(
                      "textarea",
                    )
                    ?.focus();
              }}
            >
              {t("계속 편집")}
            </Button>
            <Button variant="danger" onClick={onCancel}>
              {t("변경 취소")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() =>
              dirty ? setDiscard(true) : onCancel()
            }
          >
            {t("취소")}
          </Button>
          <Button type="submit" loading={busy}>
            {busy ? t("저장 중…") : t("저장")}
          </Button>
        </div>
      )}
    </form>
  );
}
