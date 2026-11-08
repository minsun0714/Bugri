"use client";

import { Dropdown } from "@/components/ui/dropdown";
import { Locale } from "@/lib/i18n/messages";
import { setLocale } from "@/lib/i18n/store";
import { useLocale } from "@/lib/i18n/use-translation";

export function LanguagePicker() {
  const locale = useLocale();
  return (
    <div className="w-27 shrink-0 [&_[role=listbox]]:left-auto [&_[role=listbox]]:right-0 [&_[role=listbox]]:min-w-36">
      <Dropdown
        label="Language / 언어"
        hideLabel
        options={[
          { value: Locale.KO, label: "한국어" },
          { value: Locale.EN, label: "English" },
        ]}
        value={locale}
        onValueChange={(value) =>
          setLocale(
            value === Locale.EN ? Locale.EN : Locale.KO,
          )
        }
        triggerClassName="!px-3 !py-2 !text-xs"
      />
    </div>
  );
}
