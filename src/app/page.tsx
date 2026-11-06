import DesignShowcase from "@/components/showcase/design-showcase";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  if (process.env.BUGRI_UI_PREVIEW === "1")
    return <DesignShowcase />;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        sections={[
          ["top", "홈"],
          ["site-info", "사이트 정보"],
        ]}
      />
      <main
        id="top"
        className="mx-auto w-full max-w-[1220px] flex-1 px-6 py-12 md:px-12"
      >
        <h1 className="sr-only">Bugri 홈</h1>
        <a
          href="/shop"
          className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm text-white"
        >
          BugCoin 상점 둘러보기 →
        </a>
      </main>
      <div id="site-info">
        <Footer note="디자인 미리보기 · v0.1" />
      </div>
    </div>
  );
}
