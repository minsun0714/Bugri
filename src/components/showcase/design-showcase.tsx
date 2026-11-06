"use client";

import { styles } from "@/components/showcase/styles";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

import { useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Choice,
  Coin,
  EmptyState,
  Modal,
  Pagination,
  Progress,
  Skeleton,
  Switch,
  Tabs,
  Tag,
  TextField,
  Toast,
} from "@/components/ui";
import { CodeBlock } from "@/components/ui/code-block";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { TagInput } from "@/components/ui/tag-input";

const sections = [
  ["foundations", "기본 스타일"],
  ["actions", "버튼과 선택"],
  ["inputs", "입력과 폼"],
  ["cards", "콘텐츠 카드"],
  ["feedback", "피드백과 상태"],
  ["patterns", "학습과 데스크"],
];

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles["showcase-section"]}>
      <div className={styles["section-title"]}>
        <span>{number}</span>
        <div>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Sample({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <h3 className={styles["sample-title"]}>{title}</h3>
      {children}
    </Card>
  );
}

function Bugri({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`${styles["bugri-pet"]} ${small ? "small" : ""}`}
      aria-label="버그리 캐릭터 시안"
      role="img"
    >
      <i />
      <i />
      <span className={styles["pet-eye"] + " " + "left"} />
      <span className={styles["pet-eye"] + " " + "right"} />
      <span className={styles["pet-mouth"]} />
      <span className={styles["pet-cheek"]} />
    </div>
  );
}

export default function DesignShowcase() {
  const [tags, setTags] = useState(["React", "TypeScript"]);
  const [tag, setTag] = useState("React");
  const [content, setContent] = useState("");
  const [visible, setVisible] = useState(true);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState(false);
  const [tab, setTab] = useState("내 퀴즈");
  const [choice, setChoice] = useState("");
  const [page, setPage] = useState(1);
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="min-h-screen">
      <Header sections={sections} />
      <main id="top">
        <div className={styles["design-content"]}>
          <section className="flex items-center justify-between gap-6 py-9">
            <div>
              <span className="text-xs font-medium text-muted">
                Bugri UI
              </span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                컴포넌트
              </h1>
            </div>
            <Bugri small />
          </section>
          <div className={styles["preview-note"]}>
            <span className={styles["status-dot"]} />
            공통 컴포넌트 미리보기
            <span>실제 데이터는 변경되지 않아요</span>
          </div>
          <Section
            id="foundations"
            number="01"
            title="기본 스타일"
          >
            <div className={styles["foundation-grid"]}>
              <Sample title="색상">
                <div className={styles["swatches"]}>
                  {[
                    ["Violet", "#6544dc", "bg-primary"],
                    ["Lime", "#dcf58c", "bg-lime"],
                    ["Sunny", "#ffd470", "bg-sunny"],
                    ["Coral", "#f87981", "bg-coral"],
                    ["Canvas", "#f8f6ff", "bg-canvas"],
                  ].map(([name, color, swatch]) => (
                    <div key={name}>
                      <span className={swatch} />
                      <strong>{name}</strong>
                      <small>{color}</small>
                    </div>
                  ))}
                </div>
              </Sample>
              <Sample title="글꼴">
                <div className={styles["type-display"]}>
                  객체 복사와 참조 비교
                </div>
                <p className={styles["type-body"]}>
                  같은 객체를 참조하는 두 변수의 값을
                  비교합니다.
                </p>
                <div className={styles["type-meta"]}>
                  Heading 28 / Body 14 / Caption 12
                </div>
              </Sample>
            </div>
          </Section>
          <Section
            id="actions"
            number="02"
            title="버튼과 선택"
          >
            <div className={styles["grid-two"]}>
              <Sample title="버튼">
                <div className={styles["row"]}>
                  <Button onClick={() => setToast(true)}>
                    퀴즈 만들기 <span>↗</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setToast(true)}
                  >
                    저장하기
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setToast(true)}
                  >
                    더 보기 →
                  </Button>
                </div>
                <div
                  className={
                    styles["row"] + " " + styles["spaced"]
                  }
                >
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setModal(true)}
                  >
                    삭제하기
                  </Button>
                  <Button disabled>비활성</Button>
                  <Button loading>생성 중</Button>
                </div>
              </Sample>
              <Sample title="태그 · 공개 상태">
                <div className={styles["row"]}>
                  {[
                    "전체",
                    "React",
                    "TypeScript",
                    "Spring",
                  ].map((item) => (
                    <Tag
                      key={item}
                      selected={tag === item}
                      onClick={() => setTag(item)}
                    >
                      {item === "전체" ? item : `# ${item}`}
                    </Tag>
                  ))}
                </div>
                <div
                  className={
                    styles["row"] + " " + styles["spaced"]
                  }
                >
                  <Badge tone="warning">PENDING</Badge>
                  <Badge>PRIVATE</Badge>
                  <Badge tone="success">PUBLIC</Badge>
                  <Badge tone="danger">이용 불가</Badge>
                </div>
              </Sample>
            </div>
          </Section>
          <Section
            id="inputs"
            number="03"
            title="입력과 폼"
          >
            <div className={styles["grid-two"]}>
              <Sample title="퀴즈 정보">
                <div className={styles["stack"]}>
                  <TextField
                    label="퀴즈 제목"
                    placeholder="예: JavaScript 객체와 참조"
                  />
                  <TagInput
                    value={tags}
                    onChange={setTags}
                  />
                  <TextField
                    label="작성자"
                    value="민선"
                    disabled
                    readOnly
                  />
                </div>
              </Sample>
              <Sample title="학습 내용">
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                />
                <div
                  className={
                    styles["row"] + " " + styles["spaced"]
                  }
                >
                  <Switch
                    label="공개 퀴즈"
                    checked={visible}
                    onChange={setVisible}
                  />
                  <Checkbox label="전체 선택" />
                </div>
              </Sample>
            </div>
          </Section>
          <Section
            id="cards"
            number="04"
            title="콘텐츠 카드"
          >
            <div className={styles["grid-three"]}>
              <Card>
                <div className={styles["card-top"]}>
                  <Badge tone="success">PUBLIC</Badge>
                  <span className={styles["tiny"]}>
                    QUIZ · 01
                  </span>
                </div>
                <h3 className={styles["content-title"]}>
                  객체 복사와 참조 비교
                </h3>
                <div className={styles["row"]}>
                  <Tag selected># JavaScript</Tag>
                  <Tag># 기초</Tag>
                </div>
                <div className={styles["card-footer"]}>
                  <span className={styles["person"]}>
                    <Avatar name="민선" size="sm" />
                    민선
                  </span>
                </div>
              </Card>
              <Card>
                <div className={styles["card-top"]}>
                  <Avatar name="지우" size="lg" />
                  <span className="text-xs text-muted">
                    @jiwoo
                  </span>
                </div>
                <h3 className={styles["content-title"]}>
                  지우
                </h3>
                <div className={styles["row"]}>
                  <Tag># React</Tag>
                  <Tag># TypeScript</Tag>
                </div>
                <div className={styles["card-footer"]}>
                  <span className={styles["tiny"]}>
                    프론트엔드
                  </span>
                  <Button
                    size="sm"
                    variant={
                      subscribed ? "secondary" : "primary"
                    }
                    onClick={() =>
                      setSubscribed(!subscribed)
                    }
                  >
                    {subscribed
                      ? "구독 중 ✓"
                      : "+ 구독하기"}
                  </Button>
                </div>
              </Card>
              <Card>
                <div
                  className={styles["product-art"]}
                  aria-label="책상 화분 예시"
                  role="img"
                >
                  <div className={styles["plant"]}>
                    <span />
                    <span />
                    <span />
                    <i />
                  </div>
                  <Badge tone="warning">데스크 소품</Badge>
                </div>
                <h3 className={styles["product-title"]}>
                  테이블 화분
                </h3>
                <div className={styles["card-footer"]}>
                  <Coin amount={120} />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setModal(true)}
                  >
                    구매하기
                  </Button>
                </div>
              </Card>
            </div>
          </Section>
          <Section
            id="feedback"
            number="05"
            title="피드백과 상태"
          >
            <div className={styles["grid-two"]}>
              <Sample title="알림">
                <div className={styles["stack"]}>
                  <Alert title="퀴즈 저장 완료" />
                  <Alert
                    title="BugCoin이 부족해요"
                    tone="warning"
                  >
                    잔액을 확인한 뒤 다시 시도해주세요.
                  </Alert>
                  <Alert
                    title="퀴즈를 불러올 수 없어요"
                    tone="danger"
                  >
                    잠시 후 다시 시도해주세요.
                  </Alert>
                </div>
              </Sample>
              <Sample title="빈 상태">
                <EmptyState
                  title="구독한 퀴즈가 없어요"
                  description="관심 있는 개발자나 해시태그를 구독해보세요."
                  action={
                    <Button
                      variant="secondary"
                      onClick={() =>
                        document
                          .getElementById("cards")
                          ?.scrollIntoView({
                            behavior: "smooth",
                          })
                      }
                    >
                      개발자 둘러보기 →
                    </Button>
                  }
                />
              </Sample>
              <Sample title="불러오기 · 진행률">
                <Skeleton />
                <div className={styles["spaced"]}>
                  <Progress
                    value={60}
                    label="풀이 진행률"
                  />
                </div>
              </Sample>
              <Sample title="모달 · 토스트">
                <div
                  className={
                    styles["row"] + " " + styles["spaced"]
                  }
                >
                  <Button
                    variant="secondary"
                    onClick={() => setModal(true)}
                  >
                    모달 열기
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setToast(true)}
                  >
                    토스트 보기
                  </Button>
                </div>
              </Sample>
            </div>
          </Section>
          <Section
            id="patterns"
            number="06"
            title="학습과 데스크"
          >
            <div className={styles["grid-two"]}>
              <Sample title="코드 · 선택지">
                <CodeBlock
                  language="typescript"
                  code={
                    'const learning = ["read", "try", "grow"];\n\nlearning.map((step) => {\n  return `Keep ${step}ing`;\n});'
                  }
                />
                <fieldset className={styles["options"]}>
                  <legend>
                    선택지 스타일 예시 · 문제 형식 확정 아님
                  </legend>
                  {[
                    "하나씩 차근차근",
                    "직접 해보며 배우기",
                    "배운 내용을 나누기",
                  ].map((label, i) => (
                    <Choice
                      key={label}
                      name="preview-answer"
                      value={String(i)}
                      checked={choice === String(i)}
                      onChange={() => setChoice(String(i))}
                      label={label}
                    />
                  ))}
                </fieldset>
              </Sample>
              <div className={styles["stack"]}>
                <Card>
                  <Tabs
                    items={[
                      "내 퀴즈",
                      "풀이 기록",
                      "보관함",
                    ]}
                    value={tab}
                    onChange={setTab}
                  >
                    <div className={styles["tab-example"]}>
                      <span>
                        {tab === "내 퀴즈"
                          ? "객체 복사와 참조 비교"
                          : tab === "풀이 기록"
                            ? "배열 메서드 map"
                            : "테이블 화분"}
                      </span>
                      <Badge>
                        {tab === "내 퀴즈"
                          ? "PRIVATE"
                          : tab === "풀이 기록"
                            ? "풀이 완료"
                            : "보유 중"}
                      </Badge>
                    </div>
                  </Tabs>
                  <div className={styles["spaced"]}>
                    <Pagination
                      page={page}
                      total={3}
                      onChange={setPage}
                    />
                  </div>
                </Card>
                <Card className={styles["desk-card"]}>
                  <div>
                    <h3>오늘 학습 완료</h3>
                    <div
                      className={
                        styles["row"] +
                        " " +
                        styles["spaced"]
                      }
                    >
                      <Badge tone="success">✓ 완료</Badge>
                      <Coin amount={340} />
                    </div>
                  </div>
                  <Bugri small />
                </Card>
                <Sample title="프로필 · 보관함">
                  <div className={styles["row"]}>
                    <Avatar name="민선" size="sm" />
                    <Avatar name="지우" />
                    <Avatar name="버그리" size="lg" />
                    <Badge tone="success">장착 중</Badge>
                    <Badge>보유 중</Badge>
                  </div>
                </Sample>
              </div>
            </div>
          </Section>
        </div>
      </main>
      <Footer
        links={[
          { label: "공통 컴포넌트", href: "#actions" },
          { label: "입력과 폼", href: "#inputs" },
          { label: "콘텐츠 카드", href: "#cards" },
        ]}
        note="디자인 미리보기 · v0.1"
      />
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="선택을 확인해주세요"
      >
        <p>
          공통 확인 모달의 미리보기예요. 확인을 눌러도
          퀴즈나 보관함 데이터는 변경되지 않아요.
        </p>
        <div
          className={
            styles["row"] + " " + styles["modal-actions"]
          }
        >
          <Button
            variant="secondary"
            onClick={() => setModal(false)}
          >
            취소
          </Button>
          <Button
            onClick={() => {
              setModal(false);
              setToast(true);
            }}
          >
            확인
          </Button>
        </div>
      </Modal>
      {toast && (
        <Toast
          message="변경 사항을 저장했어요 · 미리보기"
          onClose={() => setToast(false)}
        />
      )}
    </div>
  );
}
