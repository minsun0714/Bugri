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
      label: "내 노트",
      href: withDemoUser("/notes", userId),
      activePaths: ["/notes"],
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
    "/notes": [{ label: "내 노트" }],
    "/my/learning": [{ label: "풀이 내역" }],
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
  if (/^\/notes\/[^/]+$/.test(pathname))
    return [
      home,
      {
        label: "내 노트",
        href: withDemoUser("/notes", userId),
      },
      { label: "메모" },
    ];
  if (/^\/my\/learning\/[^/]+$/.test(pathname))
    return [
      home,
      {
        label: "풀이 내역",
        href: withDemoUser("/my/learning", userId),
      },
      { label: "풀이 결과" },
    ];
  return [];
}
