import {
  resolveLocale,
  translate,
} from "@/lib/i18n/messages";

test("saved language wins, browser preferences match supported languages, and unsupported languages fall back", () => {
  expect(resolveLocale("en", ["ko-KR"])).toBe("en");
  expect(resolveLocale(null, ["zh-CN", "en-US"])).toBe(
    "en",
  );
  expect(resolveLocale("invalid", ["ko-KR", "en"])).toBe(
    "ko",
  );
  expect(resolveLocale(null, ["zh-CN"])).toBe("ko");
});

test("only explicitly requested interface messages are translated", () => {
  expect(translate("en", "다시 시도")).toBe("Try again");
  expect(translate("ko", "다시 시도")).toBe("다시 시도");
  expect(translate("en", "用户写的内容")).toBe(
    "用户写的内容",
  );
});
