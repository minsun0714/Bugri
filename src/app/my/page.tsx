import { Suspense } from "react";
import { redirect } from "next/navigation";
import { withDemoUser } from "@/components/navigation/routes";

type Props = { searchParams: Promise<{ user?: string }> };

async function RedirectToCoinHistory({
  searchParams,
}: Props) {
  const { user } = await searchParams;

  return redirect(
    withDemoUser("/coin-history", user ?? null),
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={null}>
      <RedirectToCoinHistory {...props} />
    </Suspense>
  );
}
