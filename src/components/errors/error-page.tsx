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
    <main className="grid min-h-dvh place-items-center px-5 py-10 text-foreground md:px-12">
      <section
        className="w-full max-w-xl rounded-[20px] border border-line bg-surface p-5 sm:p-6"
        aria-labelledby="error-title"
      >
        <h1
          id="error-title"
          className="text-xl leading-snug font-bold break-keep sm:text-2xl"
        >
          {notFound
            ? "페이지를 찾을 수 없습니다"
            : "화면을 불러오지 못했습니다"}
        </h1>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <RecoveryHomeLink secondary={!!onRetry} />
          {onRetry && (
            <Button onClick={onRetry}>다시 시도</Button>
          )}
        </div>
      </section>
    </main>
  );
}
