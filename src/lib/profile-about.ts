import { ProfileLinkKind } from "@/api/constants";

export const profileLinkLabels: Record<
  ProfileLinkKind,
  string
> = {
  GITHUB: "GitHub",
  BLOG: "블로그",
  PORTFOLIO: "포트폴리오",
  LINKEDIN: "LinkedIn",
  OTHER: "기타",
};

export function validateProfileAbout(
  value: unknown,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!value || typeof value !== "object")
    return { biography: "자기소개 입력을 확인하세요." };
  const { biography, links } = value as Record<
    string,
    unknown
  >;
  if (typeof biography !== "string")
    errors.biography = "자기소개는 글로 입력하세요.";
  if (!Array.isArray(links))
    return { ...errors, links: "링크 목록을 확인하세요." };
  links.forEach((link: unknown, index) => {
    if (!link || typeof link !== "object") {
      errors[`links.${index}.url`] = "링크를 확인하세요.";
      return;
    }
    const { kind, url, label } = link as Record<
      string,
      unknown
    >;
    if (
      !Object.values(ProfileLinkKind).includes(
        kind as ProfileLinkKind,
      )
    )
      errors[`links.${index}.kind`] =
        "링크 종류를 선택하세요.";
    if (
      kind === ProfileLinkKind.OTHER &&
      (typeof label !== "string" || !label.trim())
    )
      errors[`links.${index}.label`] =
        "표시 이름을 입력하세요.";
    if (
      label !== undefined &&
      (typeof label !== "string" ||
        kind !== ProfileLinkKind.OTHER)
    )
      errors[`links.${index}.label`] =
        "표시 이름은 기타 링크에만 입력하세요.";
    try {
      if (
        typeof url !== "string" ||
        !/^https?:\/\//i.test(url.trim())
      )
        throw new Error();
      const parsed = new URL(url.trim());
      if (!parsed.hostname) throw new Error();
      if (parsed.username || parsed.password) {
        errors[`links.${index}.url`] =
          parsed.hostname.toLowerCase() === "github.com"
            ? "GitHub 프로필 주소는 https://github.com/사용자이름 형식으로 입력하세요."
            : "사용자 정보(@ 앞부분)가 없는 웹페이지 주소를 입력하세요.";
      }
    } catch {
      errors[`links.${index}.url`] =
        "http:// 또는 https://로 시작하는 URL을 입력하세요.";
    }
  });
  return errors;
}
