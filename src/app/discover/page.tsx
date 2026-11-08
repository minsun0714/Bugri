import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DiscoveryKind } from "@/api/constants";

async function LegacyRedirect({
  searchParams,
}: {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
}) {
  const params = await searchParams;
  const { kind } = params;
  const query = new URLSearchParams();

  for (const key of ["user", "query", "page"]) {
    const value = params[key];

    if (typeof value === "string") query.set(key, value);
  }

  const target =
    kind === DiscoveryKind.HASHTAG ? "tags" : "developers";

  return redirect(
    `/discover/${target}${query.size ? `?${query}` : ""}`,
  );
}

export default function DiscoverPage(props: {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
}) {
  return (
    <Suspense fallback={null}>
      <LegacyRedirect {...props} />
    </Suspense>
  );
}
