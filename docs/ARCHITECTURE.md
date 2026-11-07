# Bugri 아키텍처

## 1. 단계와 책임

[PRD.md](PRD.md)의 전체 제품 요구사항을 유지하면서 개발을 두 단계로 나눈다. 현재 작업 대상은 **1단계 Next.js 프로토타입**이다.

| 단계  | 기술                             | API·데이터                                                                       | 인증·배포                                                                                               |
| ----- | -------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1단계 | Next.js 16 App Router·TypeScript | 타입 기반 Mock API 어댑터, 파일 초기 데이터·localStorage 변경 상태. DB 연결 없음 | 화면 검증용 더미 사용자. 실제 JWT·OAuth 없음. Jest·React Testing Library·Playwright 검증 후 Vercel 배포 |
| 2단계 | Spring Boot·Java 21              | MySQL 8.4·Spring Data JPA, 실제 REST `/api/v1`                                   | Google OAuth2 로그인·JWT 인증·내부 User ID 소유권. 실제 영속성·구매 트랜잭션·동시성 처리                |

1단계에는 MySQL·Prisma·mysql2를 설치하거나 연결하지 않는다. 2단계의 DB·인증·동시성 설계는 향후 구현 계약이며 현재 프로토타입의 보안·영속성 보장을 뜻하지 않는다. Kubernetes는 별도 실습 환경이다. 2단계 Spring Boot의 배포 환경은 아직 정하지 않았다.

```text
1단계: UI → 타입이 정의된 API 클라이언트 → 브라우저 Mock 어댑터 → Mock 파일 초기 데이터 + 사용자별 localStorage 변경 상태
2단계: 같은 UI/API 클라이언트 → Spring Boot REST /api/v1 → 서비스 → Spring Data JPA → MySQL 8.4
                                           ↘ Google OAuth2·JWT 인증
```

UI 컴포넌트가 더미 배열을 직접 import하거나 더미 사용자 ID를 소유권의 진실로 삼지 않는다. 요청·응답 타입과 오류 형식은 1단계부터 정의하고 Mock API가 그 계약을 따른다. 2단계에는 API 클라이언트의 엔드포인트 구현을 교체한다. Next.js Route Handler와 Spring Controller는 HTTP 변환만 담당하며 퀴즈 선정·채점·구매 규칙은 서비스 계층에 둔다. Next.js 코드를 구현할 때는 설치된 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 읽는다.

### UI와 상태의 책임

제품 API에 연결되는 화면은 `UI → 필요할 때 기능 흐름 훅 → TanStack Query 조회·변경 훅 → 타입 API 클라이언트 → Mock 어댑터/향후 Spring Boot` 경계를 사용한다. 첫 API 연동 화면에서 QueryClientProvider와 의존성을 추가한다. 현재 공통 UI 전시는 API를 호출하지 않으며 단순 로컬 상태를 Query 캐시에 넣지 않는다.

채점·보상·구매 등 제품 규칙은 API 뒤 서비스가 결정한다. React 밖에서 사용할 수 있는 순수 입력 검증·텍스트 변환과, 상태·이벤트·비동기 흐름을 조율하는 훅을 구분한다. 작은 토글·표시용 계산은 컴포넌트에 두어도 된다. 사용자별 캐시 격리, mutation 이후 관련 데이터 갱신, 입력 보존·초기화 등 구체적인 구현 기준은 [implement-feature](../.agents/skills/implement-feature/SKILL.md#ui비즈니스-규칙api-상태-분리)를 따른다.

### UI 스타일링

Tailwind CSS v4를 `@tailwindcss/postcss`로 Next.js 빌드에 연결한다. `src/app/globals.css`의 `@theme`에서 색상·폰트·애니메이션 토큰을 정의하고, 컴포넌트는 Tailwind 유틸리티로 레이아웃·상태·반응형을 표현한다. 긴 클래스 조합은 해당 디렉터리의 `styles.ts`에 완성된 문자열로 둔다. 이는 빌드 시 추출되는 클래스 목록이며 CSS-in-JS 런타임이 아니다.

Markdown과 구문 강조처럼 라이브러리가 생성하는 자식 요소는 컨테이너의 arbitrary variant로 범위를 제한한다. 캐릭터 도형·가상 요소 역시 Tailwind로 표현한다. 전역 CSS는 import·테마·keyframes·문서 기본/접근성 규칙에 한정하며, 별도 컴포넌트 CSS·CSS Modules·twin.macro는 사용하지 않는다. 색상 견본도 공통 토큰을 사용한다.

## 2. 1단계 Mock API와 상태

- Mock API는 독립 퀴즈 1~5개 생성 응답, 개별·일괄 PENDING 저장, 검토·공개 범위·풀이, 3종 구독, 학습 태그·다음 문제·다시 풀기·하루 1개 완료 조건, BugCoin 상품 조회·구매·보관함·장착 UX를 지원한다. AI 제공자 호출 대신 고정·가변 더미 응답으로 성공·실패를 재현한다.
- 더미 사용자 전환은 화면 검증용이다. 누구나 요청을 조작할 수 있으므로 Mock 인증·권한 검사는 실제 보안 기능이 아니다. 실제 개인 정보·비밀값·결제 정보는 더미 데이터에 넣지 않는다.
- 초기 데이터는 `src/mocks/users.ts`, `quizzes.ts`, `subscriptions.ts`, `shop-items.ts`, `learning-history.ts` 등의 프로젝트 파일에서 읽는다(경로 예시이며 이번 작업에서 생성하지 않는다). 최초 사용자는 초기 데이터로 시작하고 저장된 사용자 변경 상태가 있으면 복원한다. 퀴즈 생성·수정·soft delete, 구독·해제, 풀이 기록·BugCoin 구매·장착·시간대 설정은 더미 userId로 구분한 localStorage에 저장한다.
- UI는 Mock 파일·localStorage를 직접 접근하지 않고 타입이 정의된 API 클라이언트와 Mock 어댑터를 이용한다. localStorage 어댑터는 HTTP Route Handler 호출 없이 같은 요청·응답 계약으로 동작할 수 있다. 서버 메모리는 영속 저장소로 쓰지 않는다.
- 로컬 개발에서는 초기 Mock 파일을 수정할 수 있다. 배포 환경에서는 읽기 전용 초기 데이터로 취급하며 Vercel 서버 파일 시스템에 사용자 데이터를 쓰지 않는다. localStorage는 사용자별 영구 저장소가 아니므로 브라우저 데이터 삭제·기기 변경 시 유실될 수 있음을 안내한다.
- Vercel 배포에는 DB 접속 정보·Google OAuth 자격 증명·JWT 비밀키가 필요하지 않다. 배포는 화면·Mock API 동작을 확인하는 프로토타입 배포다. 서버리스 인스턴스 메모리를 운영 저장소로 취급하지 않는다.
- Jest는 도메인 규칙·API 계약과 React Testing Library UI 동작에 사용하고 Playwright는 사용자 여정 E2E에 사용한다. 풀이용 Mock API 응답에도 미제출 정답·해설을 넣지 않고, 사용자 코드를 실행하지 않는다. Mock 파일·브라우저 저장소의 데이터는 사용자가 확인·수정할 수 있으므로 정답 비노출·권한 제어는 UX 검증이며 실제 보안 보장이 아니다.

## 3. 공통 제품 모델과 2단계 영속화

1단계의 타입과 2단계의 영속 엔티티는 같은 개념을 표현한다. 아래의 2단계 필드·제약은 향후 실제 구현 대상이다.

| 개념                                | 공통 계약 및 2단계 규칙                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| User                                | 내부 `userId`, Google `sub`(유일), publicId, displayName, role, learningTimeZone(IANA). 이메일은 소유권 키가 아니다. 1단계에는 더미 사용자만 둔다 |
| Quiz                                | 후보 하나당 독립 quizId, ownerUserId, PENDING/PRIVATE/PUBLIC, 활성·검토 중 revision, deletedAt(soft delete)                                       |
| QuizRevision                        | 한 문제·정답·해설·원본 학습 내용·코드 블록·reviewed·최대 3개 해시태그. 승인 버전은 불변                                                           |
| GenerationBatch                     | 요청당 후보 퀴즈 1~5개와 저장 여부. 개별 저장은 후보 1개, 일괄 저장은 남은 후보 각각에 독립 quizId 부여                                           |
| Subscription                        | subscriberUserId, PERSON / PERSON_HASHTAG / HASHTAG, authorUserId?, hashtagId?                                                                    |
| LearningSelection                   | userId, hashtagId?(null은 전체), 현재 quizId·revisionId. 다음 문제에서도 태그 유지                                                                |
| LearningDay                         | userId·사용자 시간대 기준 학습일, 판정에 사용한 시간대. 완료된 날짜는 소급 변경하지 않고 같은 날짜 중복 집계 방지                                 |
| Attempt                             | solverUserId·quizId·revisionId·제출 결과·completedAt(2단계 서버 UTC 시각). 시작한 버전으로 채점하며 미제출 정답은 비공개                          |
| Product / Inventory / DeskEquipment | 관리자 등록 상품, 구매한 상품 보관함, 장착 상태                                                                                                   |
| BugCoinLedger / Purchase            | 보상·차감 원장, 구매 요청 키. 2단계에서 잔액·중복 요청·동시성 제어                                                                                |

구독 대상은 사용자·해시태그·사용자와 해시태그의 조합이며, 퀴즈는 조건에 따라 제공되는 학습 콘텐츠다. Subscription은 quizId를 구독 대상으로 받지 않는다.

퀴즈 생성 묶음은 공개·구독·풀이 단위가 아니다. 독립 퀴즈별로 해시태그 최대 3개, 상태, 수정·삭제, 풀이 기록을 가진다. 승인된 퀴즈 수정·재생성은 새 PENDING revision에서 처리하고 이전 풀이의 revisionId를 바꾸지 않는다.

홈의 학습 후보는 사용자가 직접 구독한 대상의 활성 PUBLIC 퀴즈만 포함한다. 기본 필터는 전체이며 MVP에서는 해시태그 하나만 선택한다. 태그 선택지는 이 공개·구독 범위의 퀴즈에서 추출한다. 구독 개발자 기준 조회도 같은 범위를 지킨다. 선택 태그가 있으면 후보와 태그의 교집합을 사용하고 quizId로 중복을 제거한다. 태그 변경은 Subscription을 변경하지 않는다.

다음 문제는 선택 태그를 유지하며 완료 Attempt가 없는 quizId를 제공한다. 태그를 바꿔도 완료 기록을 유지한다. 미풀이 후보가 소진되면 완료된 퀴즈를 새 Attempt로 다시 풀거나 다른 태그를 선택할 수 있다. 후보 자체가 없으면 다시 풀기 대신 탐색·구독과 다른 태그 선택을 안내한다. 공개 범위·구독 변경·삭제 시 다음 조회와 풀이 시작에서 후보 적합성을 다시 검사한다. 답안 제출 시에도 현재 공개 범위·삭제 상태를 재검사한다.

하루 문제 수 제한과 당일 선정 고정은 제거한다. 선택 태그와 정답 여부에 관계없이 퀴즈를 1개 완료하면 그날 연속 학습 조건을 충족한다. 1단계는 Mock 상태로 재현하고 2단계는 완료 기록과 `(userId, learningDate)` 유일성으로 학습일을 한 번만 집계한다. 다시 풀기도 새 기록으로 보존하며 BugCoin 중복 보상 정책을 우회하지 않는다.

### 사용자별 스트릭 시간대

최초 접속에서 브라우저 IANA 시간대를 감지하고 저장된 사용자 설정이 있으면 이를 우선 사용한다. 감지 실패 시 Vercel IP 기반 시간대 제공 여부를 검토한다(이 경로만 별도 서버 조회가 필요할 수 있다). 국가 코드만으로 시간대를 결정하지 않는다. 확인할 수 없으면 명시적인 기본 시간대를 적용하고 마이페이지에서 변경하도록 안내한다. 기본값과 IP 제공 경로는 미결정이며 새 라이브러리를 전제하지 않는다.

신규 문제·다시 풀기를 정답 여부와 무관하게 하루 1개 이상 완료하면 사용자 시간대의 해당 날짜를 학습일로 인정한다. 같은 날짜는 한 번만 집계한다. 1단계는 브라우저 상태로 검증하고, 2단계는 서버 UTC 완료 시각과 저장된 사용자 시간대로 학습일을 계산한다. 시간대 변경으로 과거 기록·지급 보상을 소급 변경하지 않도록 완료 시점의 시간대와 학습일을 보존한다. 2단계는 브라우저 시간대를 보상 보안 근거로 신뢰하지 않으며, 시간대 변경에 따른 일일 보상 중복 방지를 별도로 검증한다. 날짜 유일성만으로 보상 악용 방지가 완성된 것으로 보지 않는다.

## 4. HTTP 계약

REST 교체 시 기본 경로는 `/api/v1`이며 요청·응답 타입을 1단계부터 정의한다. 아래 경로는 계약이며 1단계 브라우저 어댑터에 실제 HTTP 호출을 강제하지 않는다. 성공은 `{ data: ... }`, 오류는 `{ error: { code, message, fieldErrors?, requestId } }` 형식을 쓴다. `sourceContent`는 언어 지정 코드 블록을 포함해 유니코드 코드 포인트 최대 10,000자이며 공백뿐이면 거부한다. UI는 `현재 / 10,000자`를 즉시 표시한다. Mock·실제 API 모두 출력 퀴즈 1~5개와 퀴즈당 태그 3개 상한을 검증한다.

| 경로                                                                                                            | 1단계 Mock API 응답                                                              | 2단계 REST API                                    |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| POST /quizzes/generate, GET /generation-batches/{id}                                                            | 더미 퀴즈 후보 1~5개·저장 여부                                                   | 실제 생성 결과·영속 후보 조회                     |
| POST /generation-batches/{id}/save                                                                              | SINGLE(candidateId) 또는 ALL; 독립 PENDING 퀴즈 반환                             | 중복 저장 방지·영속화                             |
| GET /quizzes, GET /quizzes/{id}/review, PUT /quizzes/{id}/pending                                               | 더미 사용자별 목록·작성자 검토                                                   | JWT·내부 User ID 소유권 검사                      |
| POST /quizzes/{id}/regenerate, POST /quizzes/{id}/approve, PATCH /quizzes/{id}/visibility, DELETE /quizzes/{id} | 수정본·승인·공개 범위·삭제 UX                                                    | 버전 검사·영속화·실제 권한 검사                   |
| GET/POST/DELETE /subscriptions                                                                                  | 3종 구독 Mock 상태                                                               | 인증된 사용자 구독 영속화                         |
| GET /discover/users, GET /discover/hashtags                                                                     | 더미 개발자·태그 탐색                                                            | 실제 공개 데이터 탐색                             |
| GET /discover/search | kind·query·page·pageSize로 검색·페이지 조회, 결과별 구독 여부와 total 반환. 화면은 20개씩 표시 | 서버 검색·정렬·페이지 조회 |
| GET /learning/tags                                                                                              | 구독 범위의 더미 기술 태그 선택지                                                | 실제 구독 조건에 맞는 PUBLIC 퀴즈의 태그          |
| GET /learning/quiz                                                                                              | hashtagId?(전체면 생략), mode(UNSOLVED/REPLAY); 현재 문제 또는 빈 상태·소진 여부 | 구독·태그·완료 기록으로 후보 조회                 |
| POST /learning/next                                                                                             | 현재 선택 hashtagId?, mode; 다음 문제에도 같은 태그 유지                         | 새 후보 조회·접근 검사                            |
| GET /learning/day                                                                                               | 사용자 시간대·학습일·당일 완료 조건                                              | 서버 UTC 완료 기록과 사용자 시간대 기준 조회      |
| GET/PATCH /me/learning-timezone                                                                                 | IANA 시간대 조회·변경·사용자별 localStorage 저장                                 | 인증된 사용자 설정 검증·저장; 과거 기록/보상 유지 |
| POST /quizzes/{id}/attempts, GET /attempts/{id}, POST /attempts/{id}/answer                                     | 풀이·채점 UX, 미제출 정답 비노출                                                 | JWT·버전별 채점·풀이 영속화                       |
| GET /shop/products, GET /me/bugcoin, POST /shop/purchases                                                       | 상품·더미 잔액·구매 결과와 부족/중복 오류                                        | 실제 BugCoin 잔액·원장·구매 트랜잭션              |
| GET /me/inventory, PUT /me/desk/equipment, GET /users/{publicId}                                                | 보관함·장착·타인 데스크 UX                                                       | 소유권 검사·영속화                                |
| POST /admin/shop/products                                                                                       | 1단계 필수 아님; 필요하면 더미 관리자 화면만                                     | 내부 User 관리자 권한으로 직접 상품 등록          |
| GET /auth/google/start, GET /auth/google/callback, GET /auth/me, POST /auth/logout                              | 실제 인증 경로 없음; 더미 사용자 상태만 제공                                     | Google OAuth2·JWT 발급/검증·로그아웃              |

`ReviewQuiz`와 생성 후보는 정답·해설을 포함하는 작성자용 DTO다. `AttemptView`·`LearningQuizView`·공개 목록에는 미제출 정답·해설·원본 학습 내용을 넣지 않는다. 제출 후 결과에만 정답·해설을 제공한다. PUBLIC은 다른 사용자가 풀 수 있고 PRIVATE는 작성자만 푸는 흐름을 1단계에서 모사하며, 실제 접근 통제는 2단계에서 보장한다. 홈 구독 피드 API는 두 단계의 현재 범위에 없다.

### 비공개 전환·삭제와 답안 제출

작성자의 PUBLIC→PRIVATE 전환 또는 삭제 즉시 구독 학습 후보에서 제외한다. 삭제는 `deletedAt`을 기록하는 soft delete이며 일반 조회·목록·재풀이에서 숨긴다. 타인의 진행 중 답안 제출은 `409 QUIZ_UNAVAILABLE`로 거부하고 이용할 수 없음을 안내한다. PRIVATE는 작성자만 계속 이용할 수 있고 삭제된 퀴즈는 작성자도 제출할 수 없다. 차단된 제출은 채점·완료 처리·보상을 만들지 않는다.

완료 Attempt와 이미 획득한 스트릭·XP·BugCoin 원장은 삭제·비공개 전환으로 취소하지 않는다. 완료 기록은 문제 본문을 숨긴 상태로 유지할 수 있어야 하며, 퀴즈 삭제가 Attempt·성과의 연쇄 삭제를 일으키지 않게 한다. XP 보존은 전체 제품 규칙이며 1단계에 XP 기능을 추가하는 근거가 아니다.

1단계 Mock API는 진행 중 비공개·삭제에 따른 제출 거부와 기록 유지 UX를 재현한다. 2단계는 상태 변경과 답안 제출을 같은 퀴즈 기준으로 직렬화하거나 동등한 동시성 제어를 적용한다. 상태 변경이 먼저 확정되면 제출을 거부하고, 완료가 먼저 확정되면 그 완료 기록과 성과를 유지한다.

## 5. 2단계 Spring Boot·인증·거래

Spring Boot(Java 21) Controller는 위 REST 계약을 구현하고 Service가 퀴즈·구독·풀이·BugCoin 규칙을 담당한다. Spring Data JPA와 MySQL 8.4는 실제 데이터·트랜잭션을 담당한다. 클라이언트가 보낸 userId·ownerId를 신뢰하지 않고 검증된 JWT에서 내부 User ID를 찾는다. Google OAuth2에서 검증한 계정의 불변 식별자를 내부 User에 유일하게 연결한다. JWT 만료·갱신·폐기 방식은 2단계 착수 전에 결정한다. 더미 사용자 상태를 실제 계정으로 자동 이전한다고 가정하지 않는다.

구매는 잔액 확인→BugCoin 차감→구매 기록→보관함 추가를 한 MySQL 트랜잭션으로 처리한다. 잔액 부족이면 전부 거부한다. 재전송과 동시 요청은 요청 키·유일성 제약·잠금 또는 동등한 방법으로 한 번만 차감·구매되게 한다. 장착은 보관함 소유를 검사한다. 관리자 상품 등록은 실제 권한을 검사한다. PG·현금 결제와 AI 상품 생성·주기 스케줄러는 범위에 없다.

## 6. 검증·배포·미결정 사항

- 1단계 Jest·React Testing Library: 입력 글자 수·코드 블록·퀴즈 1~5개·개별/일괄 저장·구독 조건·학습 태그·다음 문제·다시 풀기·하루 1개 완료 조건·BugCoin 구매/장착 UX. Playwright: 더미 사용자로 생성→저장→풀이→구독→태그 변경·다음 문제·다시 풀기→구매→장착 E2E. Vercel 배포에서 Mock API와 화면을 확인한다.
- 2단계: Spring Boot 서비스·REST 계약·MySQL 통합 테스트로 Google OAuth2·JWT·내부 User ID 소유권, 저장 복원, 학습일 중복 집계 방지, 중복 구매·BugCoin 차감의 원자성을 확인한다. 1단계 테스트 통과를 실제 보안·영속성 검증으로 간주하지 않는다.
- 확정: 1단계 Next.js·TypeScript·Mock API·더미 사용자·Jest·Playwright·Vercel, DB·실제 인증 제외. 2단계 Spring Boot·Java 21·MySQL 8.4·Spring Data JPA·Google OAuth2·JWT·실제 REST API.
- 미결정: 실제 AI 제공자·연동 시점, 문제 형식, 시간대 미감지 시 기본 시간대 값·Vercel IP 시간대 제공 가능 여부·시간대 변경 전후 일일 보상 중복 판정 세부 기준, JWT 만료·갱신·폐기, 더미 데이터 이전 여부, BugCoin 지급량, 2단계 배포 환경과 MySQL 호스팅. Kubernetes는 별도 실습 환경이다.
