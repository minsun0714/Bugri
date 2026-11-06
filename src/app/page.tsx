import Link from "next/link";
import DesignShowcase from "../components/showcase/design-showcase";

const features = [
  {
    number: "01",
    title: "나만의 퀴즈 만들기",
    description: "배운 내용을 적고 퀴즈로 정리하세요.",
  },
  {
    number: "02",
    title: "함께 나누고 즐기기",
    description: "검토한 퀴즈를 공개하고 함께 풀어보세요.",
  },
  {
    number: "03",
    title: "구독으로 더 깊게",
    description: "개발자와 해시태그를 구독해 관심 있는 퀴즈를 만나보세요.",
  },
];

export default function Home() {
  // Explicit local/test opt-in. Normal builds never render the component gallery.
  if (process.env.BUGRI_UI_PREVIEW === "1") return <DesignShowcase />;
  return (
    <main
      id="top"
      className="mx-auto min-h-screen max-w-6xl px-6 py-8 md:px-12"
    >
      <header className="flex items-center justify-between border-b border-line pb-6">
        <Link
          href="/"
          aria-label="Bugri 홈"
          className="text-3xl font-extrabold tracking-tight text-primary"
        >
          bugri.
        </Link>
        <a href="#features" className="text-sm text-muted">
          서비스 소개 ↗
        </a>
      </header>
      <section aria-labelledby="hero-title" className="py-20 md:py-28">
        <p className="text-xs font-bold tracking-widest text-primary">
          QUIZ YOUR WAY
        </p>
        <h1
          id="hero-title"
          className="mt-6 text-4xl leading-tight font-bold tracking-tight md:text-6xl"
        >
          퀴즈를 만들고,
          <br />
          <span className="text-primary">함께 즐겨요.</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-muted">
          만들고, 공유하고, 구독하는 퀴즈 플랫폼 Bugri.
        </p>
        <a
          href="#features"
          className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
        >
          Bugri 둘러보기 →
        </a>
      </section>
      <section id="features" className="border-t border-line py-10">
        <h2 className="text-2xl font-bold">퀴즈를 즐기는 모든 순간</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.number}>
              <span className="font-mono text-xs text-primary">
                {feature.number}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
