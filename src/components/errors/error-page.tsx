import { ErrorIllustration } from "@/components/errors/error-illustration";
import { Button } from "@/components/ui";
import { RecoveryHomeLink } from "@/components/errors/home-link";

export function ErrorPage({
  notFound = false,
  onRetry,
}: {
  notFound?: boolean;
  onRetry?: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5 py-10 text-foreground md:px-12">
      <section
        className="w-full min-w-0 max-w-xl rounded-[28px] border border-line bg-surface p-6 shadow-[0_8px_0_var(--color-line)] sm:p-8"
        aria-labelledby="error-title"
      >
        <ErrorIllustration notFound={notFound} />
        <h1
          id="error-title"
          className="mt-6 text-center text-xl leading-snug font-bold break-keep sm:text-2xl"
        >
          {notFound
            ? "페이지를 찾지 못했어요"
            : "앗, 잠깐 문제가 생겼어요"}
        </h1>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <RecoveryHomeLink secondary={!!onRetry} />
          {onRetry && (
            <Button onClick={onRetry}>다시 시도</Button>
          )}
        </div>
      </section>
    </main>
  );
}
