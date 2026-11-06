import Link from "next/link";
import styles from "./page.module.css";

const features = [
  {
    number: "01",
    title: "나만의 퀴즈 만들기",
    description: "아이디어를 퀴즈로 만들고 한곳에서 간편하게 관리하세요.",
  },
  {
    number: "02",
    title: "함께 나누고 즐기기",
    description: "퀴즈를 공유하고 친구들과 새로운 재미를 발견하세요.",
  },
  {
    number: "03",
    title: "구독으로 더 깊게",
    description: "관심 있는 퀴즈와 콘텐츠를 구독하고 꾸준히 만나보세요.",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Bugri 홈">
          <span className={styles.brandMark}>B</span>
          bugri
        </Link>
        <a className={styles.headerLink} href="#features">
          서비스 소개 <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <p className={styles.eyebrow}>QUIZ YOUR WAY</p>
        <h1 id="hero-title">
          퀴즈를 만들고,
          <br />
          <span>함께 즐겨요.</span>
        </h1>
        <p className={styles.description}>
          만들고, 공유하고, 구독하는 퀴즈 플랫폼 Bugri.
          <br />
          호기심을 재미있는 경험으로 바꿔보세요.
        </p>
        <a className={styles.primaryLink} href="#features">
          Bugri 둘러보기 <span aria-hidden="true">→</span>
        </a>
        <div className={styles.heroDecoration} aria-hidden="true">
          <span>?</span>
        </div>
      </section>

      <section className={styles.features} id="features">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>A BETTER QUIZ EXPERIENCE</p>
          <h2>퀴즈를 즐기는 모든 순간</h2>
        </div>
        <div className={styles.featureList}>
          {features.map((feature) => (
            <article className={styles.featureCard} key={feature.number}>
              <span className={styles.featureNumber}>{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
