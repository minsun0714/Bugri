import type { BreadcrumbItem } from "@/components/ui/breadcrumb";

export type NavigationItem = {
  label: string;
  href: string;
  activePaths: string[];
};

export function withDemoUser(
  path: string,
  userId: string | null,
) {
  return userId
    ? `${path}?${new URLSearchParams({ user: userId })}`
    : path;
}

export function getNavigationItems(
  userId: string | null,
): NavigationItem[] {
  return [
    {
      label: "개발자·태그 탐색",
      href: withDemoUser("/discover", userId),
      activePaths: ["/discover", "/developers"],
    },
    {
      label: "Shop",
      href: withDemoUser("/shop", userId),
      activePaths: ["/shop"],
    },
  ];
}

export function isNavigationActive(
  pathname: string,
  paths: string[],
) {
  return paths.some(
    (path) =>
      pathname === path ||
      (path !== "/" && pathname.startsWith(`${path}/`)),
  );
}

export function getBreadcrumbs(
  pathname: string,
  userId: string | null,
): BreadcrumbItem[] {
  const home = {
    label: "홈",
    href: withDemoUser("/", userId),
  };
  const own = {
    label: "내 퀴즈",
    href: userId
      ? withDemoUser("/quizzes/authoring/manage", userId)
      : undefined,
  };
  const routes: Record<string, BreadcrumbItem[]> = {
    "/discover": [{ label: "탐색" }],
    "/explore": [{ label: "탐색" }],
    "/shop": [{ label: "상점" }],
    "/my": [{ label: "마이페이지" }],
    "/my/desk": [
      {
        label: "마이페이지",
        href: withDemoUser("/my", userId),
      },
      { label: "데스크 편집" },
    ],
    "/my/quizzes": [
      { label: "마이페이지" },
      { label: "내 퀴즈" },
    ],
    "/my/quizzes/new": [
      { label: "마이페이지" },
      { label: "내 퀴즈" },
      { label: "퀴즈 만들기" },
    ],
    "/my/learning": [
      { label: "마이페이지" },
      { label: "학습 기록" },
    ],
    "/my/inventory": [
      { label: "마이페이지" },
      { label: "보관함" },
    ],
    "/my/coins": [
      { label: "마이페이지" },
      { label: "BugCoin" },
    ],
    "/my/settings": [
      { label: "마이페이지" },
      { label: "설정" },
    ],
    "/solve": [{ label: "퀴즈 풀이" }],
    "/quizzes/authoring/manage": [{ label: "내 퀴즈" }],
    "/quizzes/authoring": [own, { label: "퀴즈 만들기" }],
    "/quizzes/authoring/results": [
      own,
      { label: "생성 결과" },
    ],
  };
  const matched = routes[pathname];

  if (matched) return [home, ...matched];
  if (
    /^\/developers\/[^/]+\/quizzes$/.test(pathname) ||
    /^\/users\/[^/]+$/.test(pathname)
  ) {
    return [
      home,
      {
        label: "탐색",
        href: withDemoUser("/discover", userId),
      },
      { label: "개발자 프로필" },
    ];
  }
  if (/^\/attempts\/[^/]+$/.test(pathname))
    return [home, { label: "풀이 결과" }];
  if (/^\/quizzes\/[^/]+\/solve$/.test(pathname))
    return [home, { label: "퀴즈 풀이" }];
  if (/^\/my\/quizzes\/[^/]+$/.test(pathname))
    return [
      home,
      { label: "마이페이지" },
      { label: "내 퀴즈" },
      { label: "퀴즈 관리" },
    ];
  return [];
}
