"use client";

import { useState } from "react";
import { Button, SearchField } from "@/components/ui";
import {
  searchButtonStyle,
  searchFormStyle,
} from "@/components/ui/styles";
import { useTranslation } from "@/lib/i18n/use-translation";
import { historyQueryMaxLength } from "@/services/history-search";

/** Search box with Enter/button submit and a clear button. Remount it (key) when the applied query changes. */
export function SearchForm({
  label,
  placeholder,
  query,
  onSearch,
}: {
  label: string;
  placeholder: string;
  query: string;
  onSearch: (query: string) => void;
}) {
  const t = useTranslation();
  const [draft, setDraft] = useState(query);
  const invalid =
    [...draft.trim()].length > historyQueryMaxLength;

  return (
    <form
      role="search"
      aria-label={label}
      className={searchFormStyle}
      onSubmit={(event) => {
        event.preventDefault();

        if (!invalid) onSearch(draft.trim());
      }}
    >
      <SearchField
        label={label}
        placeholder={placeholder}
        value={draft}
        error={
          invalid
            ? t("검색어는 100자 이하여야 합니다.")
            : undefined
        }
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button
        type="submit"
        className={searchButtonStyle}
        disabled={invalid}
      >
        {t("검색")}
      </Button>
      {query && (
        <Button
          type="button"
          variant="secondary"
          className={searchButtonStyle}
          onClick={() => {
            setDraft("");
            onSearch("");
          }}
        >
          {t("검색 초기화")}
        </Button>
      )}
    </form>
  );
}
