"use client";

import { useRef, useState } from "react";
import type {
  ProfileAbout,
  ProfileLink,
} from "@/api/contracts";
import { ProfileLinkKind } from "@/api/constants";
import { validateProfileAbout } from "@/lib/profile-about";

export function useProfileForm(
  initial: ProfileAbout,
  onSave: (value: ProfileAbout) => Promise<unknown>,
) {
  const [biography, setBiography] = useState(
    initial.biography,
  );
  const [rows, setRows] = useState(() =>
    initial.links.map((link, index) => ({
      id: index,
      link,
    })),
  );
  const nextId = useRef(rows.length);
  const [errors, setErrors] = useState<
    Record<string, string>
  >({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const [validationAttempt, setValidationAttempt] =
    useState(0);
  const value = {
    biography,
    links: rows.map(({ link }) => link),
  };
  const dirty =
    JSON.stringify(value) !== JSON.stringify(initial);

  function changeLink(
    id: number,
    patch: Partial<ProfileLink>,
  ) {
    setRows(
      rows.map((row) => {
        if (row.id !== id) return row;
        const link = { ...row.link, ...patch };
        if (link.kind !== ProfileLinkKind.OTHER)
          delete link.label;
        return { ...row, link };
      }),
    );
    const index = rows.findIndex((row) => row.id === id);
    setErrors((previous) => {
      const next = { ...previous };
      for (const field of Object.keys(patch))
        delete next[`links.${index}.${field}`];
      if (
        patch.kind &&
        patch.kind !== ProfileLinkKind.OTHER
      )
        delete next[`links.${index}.label`];
      return next;
    });
  }

  function addLink() {
    const id = nextId.current++;
    setRows([
      ...rows,
      {
        id,
        link: { kind: ProfileLinkKind.GITHUB, url: "" },
      },
    ]);
    return id;
  }

  function removeLink(id: number) {
    const removedIndex = rows.findIndex(
      (row) => row.id === id,
    );
    setRows(rows.filter((row) => row.id !== id));
    setErrors((previous) => {
      const next: Record<string, string> = {};
      for (const [key, message] of Object.entries(
        previous,
      )) {
        const match = /^links\.(\d+)\.(.+)$/.exec(key);
        if (!match) {
          next[key] = message;
          continue;
        }
        const [, indexText, field] = match;
        const index = Number(indexText);
        if (index === removedIndex) continue;
        next[
          `links.${index > removedIndex ? index - 1 : index}.${field}`
        ] = message;
      }
      return next;
    });
  }

  async function save() {
    if (busy) return;
    const validation = validateProfileAbout(value);
    setErrors(validation);
    setFailure("");
    if (Object.keys(validation).length) {
      setValidationAttempt((attempt) => attempt + 1);
      return;
    }
    setBusy(true);
    try {
      await onSave(value);
    } catch (error) {
      setFailure(
        error instanceof Error
          ? error.message
          : "저장하지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }

  return {
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
  };
}
