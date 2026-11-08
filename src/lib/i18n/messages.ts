import english from "@/lib/i18n/en.json";

export const Locale = {
  KO: "ko",
  EN: "en",
} as const;

export type Locale = (typeof Locale)[keyof typeof Locale];

export function resolveLocale(
  saved: unknown,
  languages: readonly string[],
): Locale {
  if (saved === Locale.KO || saved === Locale.EN)
    return saved;
  for (const language of languages) {
    const [base] = language.toLowerCase().split("-");
    if (base === Locale.KO || base === Locale.EN)
      return base;
  }
  return Locale.KO;
}

export type UiMessage =
  | string
  | {
      key: string;
      values: Record<string, string | number | UiMessage>;
    };

export function message(
  key: string,
  values: Record<string, string | number | UiMessage> = {},
): UiMessage {
  return { key, values };
}

export function translate(
  locale: Locale,
  input: UiMessage,
  values: Record<string, string | number> = {},
): string {
  const message =
    typeof input === "string" ? input : input.key;
  const parameters =
    typeof input === "string" ? values : input.values;
  const dictionary: Record<string, string> = english;
  const translated =
    locale === Locale.EN
      ? (dictionary[message] ?? message)
      : message;
  return translated.replace(
    /\{(\w+)\}/g,
    (match, key: string) =>
      typeof parameters[key] === "object"
        ? translate(locale, parameters[key])
        : String(parameters[key] ?? match),
  );
}
