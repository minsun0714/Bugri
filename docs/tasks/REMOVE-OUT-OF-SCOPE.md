# REMOVE-OUT-OF-SCOPE

- 상태: 구현·검증 완료 (리뷰 대기)
- 기준: 사용자 확정 범위(2026-11-08). 기존 PRD의 확대 기능보다 이번 요청이 우선한다. 새 PRD는 `docs/product-refocus` 브랜치가 전담한다.
- 브랜치: `refactor/remove-features` (dev에서 분기)
- 런타임: Node v22.23.3
- 문서 소유권: 이 파일 외 `docs/`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `.agents/skills/` 는 수정하지 않았다. API.md 등 기준 문서는 코드와 달라졌으며, 문서 갱신은 아래 기록을 바탕으로 문서 브랜치에서 한다.
- 검증: Claude는 Codex Hook을 arm하지 않고 `verification.md` 기준으로 수동 실행했다.
- 작업 이력: 처음 Codex가 삭제를 진행하다 중단, Claude가 이어서 타입·테스트 정리와 검증을 마쳤다.

## 삭제한 화면 경로

`/shop`, `/shop/zdog`, `/coin-history`, `/my`(리다이렉트), `/my/desk`, `/discover`, `/discover/developers`, `/discover/tags`, `/tags/[hashtagId]/quizzes`, `/developers/[publicId]/quizzes`, `/users/[publicId]`, `/settings`.

남은 라우트: `/`(스트릭 요약), `/solve`, `/my/learning`, `/my/learning/[attemptId]`, `/quizzes/authoring`, `/quizzes/authoring/manage`, `/quizzes/authoring/results`, `/ui-preview`, `/ui-preview/errors`.

## 삭제한 API 계약

- 연산(contracts `ApiOperations` · `http.ts` endpoints, 56개 → 22개): `guestQuiz`, `guestAnswer`, `publishCandidate`, `visibility`, `subscriptions`, `subscribe`, `unsubscribe`, `tagQuizzes`, `developerQuizzes`, `developerTags`, `searchDiscovery`, `discoverUsers`, `learningTags`, `learningQuiz`, `learningNext`, `publicLearningDay`, `updateTimezone`, `quizReaction`, `updateQuizReaction`, `products`, `wallet`, `purchase`, `inventory`, `equip`, `moveEquipment`, `reorderDesk`, `transformDesk`, `transformBugri`, `transformEquipment`, `profileOrder`, `updateProfileOrder`, `profileAbout`, `updateProfileAbout`, `publicProfile`.
- 변경: `approve` 요청에서 `visibility` 제거(승인 = 바로 승인), `startAttempt` 컨텍스트는 `"DIRECT"`만 허용, 서비스 컨텍스트의 `dailyReward` 제거.
- 타입/상수: `LearningMode`, `LearningState`, `Category`, `DeskTool`, `DeskView`, `DeskObject`, `LayerAction`, `DiscoveryKind`, `ProfileLinkKind`, `QuizReaction`, `ProfileSection`, `RewardReason`, `RewardNonPaymentReason`, `Visibility`, `QuizReactionSummary`, `SubscriptionTarget`, `Subscription`, `LearningQuery`, `LearningSelection`, `RewardOutcome`, `Product`, `Equipment`, `Desk*`, `LedgerEntry`, `Wallet`, `Purchase`, `Inventory`, `ProfileLink`, `ProfileAbout`, `PublicProfile`, `Discovery*`, `TagQuizzesPage`, `Developer*`.
- 오류 코드 문구: `INSUFFICIENT_BALANCE`, `ALREADY_OWNED`, `IDEMPOTENCY_CONFLICT` 제거.

## 삭제한 서비스·Mock·lib

- services: `bugcoin`, `developer-quizzes`, `discovery`, `guest-learning`, `quiz-reactions`, `tag-quizzes`
- mocks: `coin-history`, `shop-items`, `subscriptions`
- lib: `desk-independent`, `desk-layout`, `desk-order`, `desk-spatial`, `desk-surface`, `profile-about`, `profile-order`, `shop/catalog`
- 사용자 상태(`UserState`)에서 구독·지갑·보관함·데스크·프로필 필드 제거. 저장 키(`bugri:mock:v1:<user>`)와 PENDING·승인 모델은 유지.

## 삭제한 컴포넌트

`components/{coins, developer, discovery, landing, profile, shop(+three, zdog), tag-catalog}` 전체, `navigation/public-profile-link`, `solving/{guest-quiz, quiz-reaction, reaction-queries, reward-explanation}`.

## 삭제한 테스트

- e2e 48개 + `helpers/desk.ts`(합 49개): bugcoin, desk-*, shop-*, coin-history, discovery, developer, profile-*, tag-*, guest-landing*, home-quiz-review, quiz-reactions 등
- unit 40개: `unit/shop/*`(12), `unit/api/{bugcoin, bugcoin-flow, demo-seed, desk, desk-3d, developer-quizzes, discovery-pagination, guest, profile-about, profile-order, public-learning, publish-candidate, quiz-reactions, shop-extra-items, tag-quizzes}`, coin-history, developer, discovery, guest-*, profile-*, subscription-*, header-profile-link
- 합계 `tests/` 89개 파일 삭제.

## 혼합 테스트에서 유지한 검증 (직접 퀴즈 진입으로 이전)

| 파일 | 유지·이전한 검증 |
| --- | --- |
| `e2e/solving.spec.ts` | 4가지 문제 형식 채점·새로고침 복원, 재풀이 별도 시도, 사용자 간 결과 격리, 삭제된 퀴즈 제출 차단과 완료 기록 보존, 저장 실패 시 입력 보존·재시도, 모바일 코드 렌더링 |
| `e2e/streak.spec.ts` | 스트릭 갱신·새로고침·사용자 격리, 복귀 학습자, 월·연 이동, 카드 높이, 첫 학습월 경계, 컴팩트 홈. 풀이를 `/solve`에서 수행한 뒤 홈에서 확인 |
| `e2e/mock-api.spec.ts` | 생성→승인→직접 풀이/재풀이, 새로고침 복원, 사용자 격리, 다른 탭 삭제 반영 |
| `unit/api/rules.test.ts` | 검토 상태·버전 충돌, 재생성 실패 보존, 삭제 후 완료 기록 보존, 타임존 감지·고정, 일별 학습량, DST/스트릭, 저장소 실패 롤백 |
| `unit/api/{mock, http, state-contract, quiz-history*}.test.ts` | 응답에 정답 비노출, 상태 wire 값, 엔드포인트 계약, 시도 기록 |
| `unit/navigation.test.tsx`, `e2e/{navigation, locale, theme, design-system, quiz-history, error-handling}` | 남은 메뉴·언어·다크모드·에러 화면. 헤더 프로필 버튼 이름은 "내 메뉴"로 변경 |

테스트 변경 시 약화·skip은 하지 않았다. 다음 항목은 기능이 삭제되어 함께 사라졌다: 시간대 직접 설정(`updateTimezone`) 검증은 "첫 감지값 저장·이후 장치 변경 무시, 저장 상태를 직접 바꿔 변경 시 과거 귀속 유지"로 대체, `/settings`의 "시스템 설정 따르기" 라디오 e2e는 삭제(헤더 토글·시스템 추종 검증은 남음).

## 정리한 번역 키 (`src/lib/i18n/en.json`)

- 764개 → 363개 (삭제 기능 전용 약 400개 제거, 신규 6개 추가). 제거 기준: HEAD 소스에서 쓰이고 현재 소스에서 쓰이지 않는 키 + 삭제된 랜딩 문구. 상점·BugCoin·구독·탐색·프로필·데스크·보상·좋아요·공개 범위·설정 등.
- 추가/변경: `승인됨`, `승인했습니다.`, `현재 버전과 비교`, `내 메뉴`, `업무 중 배운 개발 지식을 퀴즈로 복습하는 Bugri`, `“{0}” 퀴즈를 삭제할까요?{1} 완료한 풀이 기록은 유지됩니다.`. 생성 모달 닫기 확인 문구에서 "공개" 제거.
- 사용 중인 `t("…")` 리터럴이 en.json에 모두 존재함을 스크립트로 확인.
- 기존 고아 키 중 `화면 테마`, `월요일`, `{0}월` 등은 이번 범위가 아니라 유지.

## 의존성

`three`, `zdog`, `@types/three`, `@types/zdog` 제거 (`package.json`, `package-lock.json`).

## 제품 동작 변경 (요청 목록에 따른 파생)

- 홈: 로그인 시 스트릭 요약만, 비로그인 시 데모 사용자 선택 빈 상태.
- 퀴즈 목록 필터: 전체 / 검토 필요 / 승인됨(`status` 쿼리 `APPROVED`). 상태 뱃지는 승인됨. 공개·나만 보기 구분 UI 삭제.
- 퀴즈 생성 후보: `임시저장`만 남고 `바로 공개` 삭제. 승인 시 공개 범위 선택 없음.
- 헤더: 퀴즈 만들기 링크, 내 메뉴(내 퀴즈·풀이 내역·데모 나가기), 데모 사용자 선택, 언어·다크모드. 모바일 메뉴 동일.
- 풀이 화면: 완료 기록 문구에서 "획득한 성과" 제거, 보상 설명·반응 UI 제거.
- 앱 메타데이터 설명(`layout.tsx`)을 새 방향 문구로 교체.

## 남긴 공유 코드와 이유

- `components/ui/*`(디자인 시스템·`BugCoin` 금액 표시, `filter-chips`), `components/showcase/*`(구독·BugCoin 예시 포함): 공통 UI·디자인 쇼케이스로 유지 요청. 기능별 제거는 후속에서 판단.
- `components/errors/query-preview.tsx`의 "공개 데스크" 문구: 에러 화면 미리보기 픽스처이므로 유지.
- `components/navigation/feature-section-shell.tsx`: dev(HEAD)에서도 미사용이던 기존 파일. 이번 범위 밖.
- `discoverHashtags` 연산, `hashtags` 시드: 퀴즈 생성의 태그 입력이 사용.
- `StoredQuiz.status` PUBLIC/PRIVATE 값과 PENDING·승인 모델: 후속 "메모→퀴즈" 브랜치에서 정리.
- `mocks/users` 데모 사용자, `mocks/learning-history` 시도 이력 시드, 브라우저 시간대 자동 감지와 fallback: 학습 달력·스트릭에 필요.

## 검증 (Node v22.23.3, 마지막 코드 변경 후 전체 재실행)

| 명령 | 결과 |
| --- | --- |
| `npm run lint` | 통과 (경고·오류 0) |
| `npm run typecheck` | 통과 |
| `npm test -- --runInBand` | 36 suites, 182 tests 통과 |
| `npm run test:tools` | 3 pass, 0 fail |
| `npm run build` | 통과 (라우트 13개 출력) |
| `npm run test:e2e` | 67 passed (연속 2회 통과) |
| `npx prettier --check src tests scripts package.json` | 통과 |

- `npm run format:check`(전체)는 `docs/` 기존 파일 104개에서 경고. 이 브랜치가 건드리지 않은 문서이므로 범위 밖.
- 3D 관련 E2E는 기능과 함께 삭제되어 해당 실행 규칙(워커 1개)이 적용되지 않는다. e2e는 기본 설정으로 실행했다.
- 독립 UX/UI sub-agent 리뷰와 브라우저 육안 확인은 하지 않았다. 이번 변경은 기능 삭제와 홈·헤더·목록의 임시 축소이며 새 화면 설계가 없다. 새 홈은 후속 브랜치에서 UX 리뷰를 받는다.
- 문서(`docs/PRD.md`, `API.md`, `ARCHITECTURE.md`, `TASKS.md`, `verification.md`의 상점·3D 절 등)는 코드와 불일치 상태다. 문서 브랜치에서 위 기록으로 갱신해야 한다.

## 남은 작업

- 문서 브랜치에서 PRD·API·아키텍처·검증 가이드 갱신.
- 후속 "메모→퀴즈" 브랜치: 새 홈, PENDING·승인 모델 정리, 남은 PUBLIC/PRIVATE 상태값 정리.
