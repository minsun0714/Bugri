# Bugri 아키텍처

## 1. 단계와 책임

[PRD](PRD.md)의 제품 요구사항을 두 단계로 나눠 구현한다. 현재 작업 대상은 **1단계 Next.js 프로토타입**이다. 2026-11-08 범위 축소로 구독·탐색·상점·BugCoin·데스크·공개 프로필 구조는 삭제했다([REMOVE-OUT-OF-SCOPE](tasks/REMOVE-OUT-OF-SCOPE.md)).

| 단계 | 기술 | API·데이터 | 인증·배포 |
| --- | --- | --- | --- |
| 1단계 | Next.js 16 App Router·TypeScript | 타입 기반 Mock API 어댑터, 파일 초기 데이터·localStorage 변경 상태. DB 연결 없음 | 화면 검증용 더미 사용자. 실제 JWT·OAuth 없음. Jest·React Testing Library·Playwright 검증 후 Vercel 배포 |
| 2단계 | Spring Boot·Java 21 | MySQL 8.4·Spring Data JPA, 실제 REST `/api/v1`, Spring AI | Google OAuth2 로그인·JWT 인증·내부 User ID 소유권. 실제 영속성 |

1단계에는 MySQL·Prisma·mysql2를 설치하거나 연결하지 않는다. 2단계의 DB·인증 설계는 향후 구현 계약이며 현재 프로토타입의 보안·영속성 보장을 뜻하지 않는다. Kubernetes는 별도 실습 환경이다. 2단계 Spring Boot의 배포 환경은 아직 정하지 않았다.

```text
1단계: UI → 타입이 정의된 API 클라이언트 → 브라우저 Mock 어댑터 → Mock 파일 초기 데이터 + 사용자별 localStorage 변경 상태
2단계: 같은 UI/API 클라이언트 → Spring Boot REST /api/v1 → 서비스 → Spring Data JPA → MySQL 8.4
                                           ↘ Google OAuth2·JWT 인증
                                           ↘ Spring AI (퀴즈 생성·수정)
```

UI 컴포넌트가 더미 배열을 직접 import하거나 더미 사용자 ID를 소유권의 진실로 삼지 않는다. 요청·응답 타입과 오류 형식은 1단계부터 정의하고 Mock API가 그 계약을 따른다. 2단계에는 API 클라이언트의 엔드포인트 구현을 교체한다. Next.js Route Handler와 Spring Controller는 HTTP 변환만 담당하며 퀴즈 생성 검증·채점·복습 일정 규칙은 서비스 계층에 둔다. Next.js 코드를 구현할 때는 설치된 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 읽는다.

### UI와 상태의 책임

제품 API에 연결되는 화면은 `UI → 필요할 때 기능 흐름 훅 → TanStack Query 조회·변경 훅 → 타입 API 클라이언트 → Mock 어댑터/향후 Spring Boot` 경계를 사용한다. 공통 UI 전시는 API를 호출하지 않으며 단순 로컬 상태를 Query 캐시에 넣지 않는다.

채점·복습 일정 등 제품 규칙은 API 뒤 서비스가 결정한다. React 밖에서 사용할 수 있는 순수 입력 검증·텍스트 변환과, 상태·이벤트·비동기 흐름을 조율하는 훅을 구분한다. 작은 토글·표시용 계산은 컴포넌트에 두어도 된다. 사용자별 캐시 격리, mutation 이후 관련 데이터 갱신, 입력 보존·초기화 등 구체적인 구현 기준은 [implement-feature](../.agents/skills/implement-feature/SKILL.md#ui비즈니스-규칙api-상태-분리)를 따른다.

### 퀴즈 작성 화면 (현재 구현)

퀴즈는 메모 상세(`/notes/{noteId}`)에서만 만든다(REQ-02). 별도 작성·관리 경로(`/quizzes/authoring*`)는 없다.

- **메모 상세의 퀴즈 영역**(`NoteQuizzes`): "퀴즈로 만들기", PENDING이 있을 때만 "확인 안 한 퀴즈 N개 · 이어서 확인", "이 메모의 퀴즈"(CONFIRMED 목록: 제목은 `/solve` 링크, 형식 배지, 수정·삭제). "퀴즈로 만들기"는 생성 중 버튼을 잠가 중복 요청을 막고, 실패하면 오류를 보여 주고 같은 버튼으로 다시 시도한다. 성공하면 그 메모의 PENDING 전부를 작업 모달에 열고 이번에 생성한 첫 퀴즈를 선택한다. 기존 PENDING은 그대로 남는다.
- **작업 모달**(`NoteQuizDialog` → `QuizWork`, 상태는 `useQuizWork`): 공통 Modal의 conversation 레이아웃. 공통 Tabs로 퀴즈를 고르고, 선택한 퀴즈에서 직접 수정·LLM으로 수정(Modal 본문 전체를 대화 화면으로 전환)·저장·삭제를 한다. 하단의 "남은 퀴즈 모두 저장 (N)"은 그 메모의 PENDING 전부를 저장한다. 저장한 탭은 "저장됨"으로 남는다. 퀴즈별 미반영 수정·미전송 요청은 로컬 초안이며, 초안이 있는 퀴즈의 저장과 일괄 저장은 막고 이유를 표시한다. 모달을 닫을 때 초안이 있을 때만 공통 `ConfirmDialog`(Modal 기반)로 묻는다. `window.confirm`은 쓰지 않는다. 닫아도 PENDING은 서버(Mock 저장소)에 남는다.
- **CONFIRMED 수정**(`EditQuizDialog`): 목록의 "수정"이 같은 `ContentFields`로 직접 수정만 연다. 저장하면 바로 반영되고(새 revision) 이미 끝난 Attempt는 바뀌지 않는다.
- **메모 삭제**: 확인 모달이 연결된 퀴즈 개수(PENDING 포함)를 알리고 삭제하면 함께 soft delete한다.
- 내 노트 목록 행은 확인한 퀴즈 개수 또는 "퀴즈 없음", 확인 안 한 퀴즈 개수, CONFIRMED 퀴즈의 태그를 보여 준다. 홈 빠른 메모 저장 토스트의 "퀴즈로 만들기"는 해당 메모 상세로 이동한다.
- 데이터는 `src/components/notes/queries.ts`의 Query 훅(`['notes', userId, ...]`)으로 읽고, 모든 변경 후 `['notes', userId]`를 무효화해 목록·상세의 개수를 함께 갱신한다. 모달 안의 변경은 `useQuizWork`가 로컬 상태를 갱신하고 `onChanged`로 무효화한다.

### UI 스타일링

Tailwind CSS v4를 `@tailwindcss/postcss`로 Next.js 빌드에 연결한다. `src/app/globals.css`의 `@theme`에서 색상·폰트·애니메이션 토큰을 정의하고, 컴포넌트는 Tailwind 유틸리티로 레이아웃·상태·반응형을 표현한다. 긴 클래스 조합은 해당 디렉터리의 `styles.ts`에 완성된 문자열로 둔다. 이는 빌드 시 추출되는 클래스 목록이며 CSS-in-JS 런타임이 아니다.

Markdown과 구문 강조처럼 라이브러리가 생성하는 자식 요소는 컨테이너의 arbitrary variant로 범위를 제한한다. 캐릭터 도형·가상 요소 역시 Tailwind로 표현한다. 전역 CSS는 import·테마·keyframes·문서 기본/접근성 규칙에 한정하며, 별도 컴포넌트 CSS·CSS Modules·twin.macro는 사용하지 않는다.

## 2. 1단계 Mock API와 상태

- Mock API는 메모에서 독립 퀴즈 1~5개를 PENDING으로 생성, 직접 수정·LLM 수정·개별/일괄 저장(CONFIRMED)·삭제, 직접 풀이·채점, 학습일·스트릭, 풀이 내역을 지원한다. AI 제공자 호출 대신 고정·가변 더미 응답으로 성공·실패를 재현한다.
- 더미 사용자 전환은 화면 검증용이다. 누구나 요청을 조작할 수 있으므로 Mock 인증·권한 검사는 실제 보안 기능이 아니다. 실제 개인 정보·비밀값은 더미 데이터에 넣지 않는다.
- 초기 데이터는 `src/mocks/users.ts`, `quizzes.ts`, `seed.ts`, `learning-history.ts` 등의 프로젝트 파일에서 읽는다. 최초 사용자는 초기 데이터로 시작하고 저장된 사용자 변경 상태가 있으면 복원한다. 퀴즈 생성·수정·soft delete, 풀이 기록, 감지된 시간대는 더미 userId로 구분한 localStorage에 저장한다.
- UI는 Mock 파일·localStorage를 직접 접근하지 않고 타입이 정의된 API 클라이언트와 Mock 어댑터를 이용한다. 서버 메모리는 영속 저장소로 쓰지 않는다.
- 로컬 개발에서는 초기 Mock 파일을 수정할 수 있다. 배포 환경에서는 읽기 전용 초기 데이터로 취급하며 Vercel 서버 파일 시스템에 사용자 데이터를 쓰지 않는다. 저장 형식 번호(schemaVersion)가 2가 아닌 이전 데이터는 데모 프로토타입 결정에 따라 옮기지 않고 새 시드로 초기화한다. 번호가 2인 데이터가 손상됐으면 오류로 유지하며 자동 초기화하지 않는다. localStorage는 사용자별 영구 저장소가 아니므로 브라우저 데이터 삭제·기기 변경 시 유실될 수 있다.
- Vercel 배포에는 DB 접속 정보·Google OAuth 자격 증명·JWT 비밀키·AI 키가 필요하지 않다.
- Jest는 도메인 규칙·API 계약과 React Testing Library UI 동작에 사용하고 Playwright는 사용자 여정 E2E에 사용한다. 풀이용 Mock API 응답에도 미제출 정답·해설을 넣지 않고, 사용자 코드를 실행하지 않는다. 정답 비노출·권한 제어는 UX 검증이며 실제 보안 보장이 아니다.

## 3. 공통 제품 모델과 2단계 영속화

1단계의 타입과 2단계의 영속 엔티티는 같은 개념을 표현한다. 아래의 2단계 필드·제약은 향후 실제 구현 대상이다. "예정"은 새 PRD에 따라 추가할 개념이며 아직 코드에 없다.

| 개념 | 공통 계약 및 2단계 규칙 |
| --- | --- |
| User | 내부 `userId`, Google `sub`(유일), displayName, learningTimeZone(IANA). 이메일은 소유권 키가 아니다. 1단계에는 더미 사용자만 둔다 |
| Note | 1단계 계약(NOTES): `noteId`, 본문(Markdown·코드 블록, 유니코드 코드 포인트 최대 10,000자), `version`, `createdAt`·`updatedAt`. 저장소에서는 사용자별 `UserState.notes`에 `deletedAt`(soft delete)과 함께 보관하며 소유자는 저장소 키로 결정한다. 2단계는 ownerUserId를 가진다. 응답에는 연결된 퀴즈의 확인/미확인 개수와 CONFIRMED 퀴즈 태그의 합집합이 포함되며 메모에 태그를 따로 저장하지 않는다. 자세한 계약은 [API 메모 절](API.md#메모--notes) |
| Quiz | 독립 quizId, ownerUserId, noteId(연결 메모), 상태 PENDING(생성·아직 저장 안 함, 풀이·복습 제외)/CONFIRMED(저장함, 풀이·복습 대상), 현재 revision, LLM 수정 기록, confirmedAt, version, deletedAt(soft delete). 검토·승인·공개 단계는 없다 |
| QuizRevision | 한 문제·정답·해설·원본 학습 내용(생성 당시 메모 본문 스냅샷)·코드 블록·최대 3개 해시태그. 수정할 때마다 새 revision이며 풀이에 쓰인 버전은 불변 |
| 생성 요청 | 요청당 퀴즈 1~5개를 곧바로 PENDING Quiz로 저장한다. 별도 "후보"·묶음 개체는 두지 않으며, 같은 메모에서 다시 생성하면 기존 PENDING을 유지한 채 새로 추가한다 |
| ReviewSchedule (예정) | userId·quizId·다음 복습일·현재 간격 단계. 정답이면 1→3→7→14→30일, 오답이면 다음 날·처음으로. 오늘 복습 풀이 결과로만 갱신 |
| LearningDay | userId·사용자 시간대 기준 학습일, 판정에 사용한 시간대. 완료된 날짜는 소급 변경하지 않고 같은 날짜 중복 집계 방지 |
| Attempt | solverUserId·quizId·revisionId·제출 결과·completedAt(2단계 서버 UTC 시각). 시작한 버전으로 채점하며 미제출 정답은 비공개 |

퀴즈 생성 묶음은 풀이 단위가 아니다. 독립 퀴즈별로 해시태그 최대 3개, 상태, 수정·삭제, 풀이 기록을 가진다. 퀴즈 수정은 이전 풀이의 revisionId를 바꾸지 않는다.

선택 태그·정답 여부에 관계없이 퀴즈를 1개 완료하면 그날 연속 학습 조건을 충족한다. 1단계는 Mock 상태로 재현하고 2단계는 완료 기록과 `(userId, learningDate)` 유일성으로 학습일을 한 번만 집계한다. 다시 풀기도 새 기록으로 보존한다.

### 사용자별 스트릭 시간대

Mock 어댑터는 쓰기가 허용되는 요청마다 브라우저 IANA 시간대를 다시 감지하고, 유효하며 저장값과 다르면 갱신한다(PRD AC-04d). 읽기 전용 풀이 내역 조회는 저장하지 않는다. 감지 실패 시 기존 저장값을 유지한다. 직접 변경 화면은 없다. 국가 코드만으로 시간대를 결정하지 않는다. 감지 실패 시 기본값은 미결정이다.

정답 여부와 무관하게 하루 1개 이상 완료하면 사용자 시간대의 해당 날짜를 학습일로 인정한다. 같은 날짜는 한 번만 집계한다. 시간대가 바뀌어도 과거 기록을 소급 변경하지 않도록 완료 시점의 시간대와 학습일을 보존한다. 2단계는 서버 UTC 완료 시각과 사용자 시간대로 학습일을 계산하며 브라우저 시간대를 보안 근거로 신뢰하지 않는다.

## 4. HTTP 계약

REST 교체 시 기본 경로는 `/api/v1`이며 요청·응답 타입을 1단계부터 정의한다. 성공은 `{ data: ... }`, 오류는 `{ error: { code, message, fieldErrors?, requestId } }` 형식을 쓴다. `sourceContent`는 언어 지정 코드 블록을 포함해 유니코드 코드 포인트 최대 10,000자이며 공백뿐이면 거부한다. Mock·실제 API 모두 출력 퀴즈 1~5개와 퀴즈당 태그 3개 상한을 검증한다. 연산별 상세는 [API](API.md)를 따른다.

| 경로 | 1단계 Mock API 응답 | 2단계 REST API |
| --- | --- | --- |
| POST /notes/{id}/quizzes/generate, GET /notes/{id}/quizzes?status=, POST /notes/{id}/quizzes/confirm | 메모에서 PENDING 퀴즈 1~5개 생성·상태별 조회·남은 PENDING 일괄 저장 | Spring AI 생성 결과 영속화·메모 소유권 검사 |
| GET /quizzes/{id}/review, PUT /quizzes/{id}, POST /quizzes/{id}/refine·confirm, DELETE /quizzes/{id} | 작성자 조회·직접 수정·LLM 수정(PENDING)·개별 저장·삭제 | JWT·내부 User ID 소유권 검사·버전 검사·영속화 |
| GET /hashtags | 등록 태그 목록(태그 입력용) | 태그 조회 |
| POST /quizzes/{id}/attempts, GET /attempts/{id}, POST /attempts/{id}/answer | 풀이·채점 UX, 미제출 정답 비노출 | JWT·버전별 채점·풀이 영속화 |
| GET /learning/day, GET /me/learning-timezone, GET /me/attempts | 학습일·스트릭·감지된 시간대·풀이 내역 | 서버 UTC 완료 기록과 사용자 시간대 기준 조회 |
| GET·POST /notes, GET·PUT·DELETE /notes/{id} | 메모 CRUD(삭제 시 연결 퀴즈 soft delete) | 같은 계약으로 영속화 |
| (예정) 메모 검색, 오늘 복습 조회 | 새 PRD 구현 TASK에서 정의 | 같은 계약으로 영속화 |
| GET /auth/google/start, GET /auth/google/callback, GET /auth/me, POST /auth/logout | 실제 인증 경로 없음; 더미 사용자 상태만 제공 | Google OAuth2·JWT 발급/검증·로그아웃 |

`ReviewQuiz`는 정답·해설을 포함하는 작성자용 DTO다. `AttemptView`와 목록에는 미제출 정답·해설·원본 학습 내용을 넣지 않는다. 제출 후 결과에만 정답·해설을 제공한다.

### 삭제와 답안 제출

삭제는 `deletedAt`을 기록하는 soft delete이며 일반 조회·목록·재풀이에서 숨긴다. 삭제된 퀴즈는 작성자도 제출할 수 없고 `409 QUIZ_UNAVAILABLE`로 거부한다. 차단된 제출은 채점·완료 처리를 만들지 않는다. 완료 Attempt와 이미 획득한 스트릭은 삭제로 취소하지 않는다. 완료 기록은 문제 본문을 숨긴 상태로 유지할 수 있어야 하며, 퀴즈 삭제가 Attempt의 연쇄 삭제를 일으키지 않게 한다. 2단계는 상태 변경과 답안 제출을 같은 퀴즈 기준으로 직렬화하거나 동등한 동시성 제어를 적용한다.

## 5. 2단계 Spring Boot·인증·AI

Spring Boot(Java 21) Controller는 위 REST 계약을 구현하고 Service가 메모·퀴즈·풀이·복습 일정 규칙을 담당한다. Spring Data JPA와 MySQL 8.4는 실제 데이터·트랜잭션을 담당한다. 클라이언트가 보낸 userId·ownerId를 신뢰하지 않고 검증된 JWT에서 내부 User ID를 찾는다. Google OAuth2에서 검증한 계정의 불변 식별자를 내부 User에 유일하게 연결한다. JWT 만료·갱신·폐기 방식은 2단계 착수 전에 결정한다. 더미 사용자 상태를 실제 계정으로 자동 이전한다고 가정하지 않는다.

퀴즈 생성·수정은 서비스가 정의한 생성 포트(예: `QuizGenerator`) 뒤에 두고 Spring AI 구현을 연결한다. 1단계 Mock 생성기와 같은 입력·출력 계약을 사용하며, 결과의 개수·형식·정답·태그를 서버에서 검증한 뒤에만 성공으로 처리한다. 메모 안의 명령을 시스템 지시로 따르지 않도록 사용자 입력과 지시를 분리한다. 제공자·모델은 미결정이다.

## 6. 검증·배포·미결정 사항

- 1단계 Jest·React Testing Library: 입력 글자 수·코드 블록·퀴즈 1~5개·저장(PENDING→CONFIRMED)·풀이·학습일·풀이 내역. Playwright: 더미 사용자로 메모→퀴즈 생성→저장→풀이→풀이 내역·메모 삭제 E2E. Vercel 배포에서 Mock API와 화면을 확인한다.
- 2단계: Spring Boot 서비스·REST 계약·MySQL 통합 테스트로 Google OAuth2·JWT·내부 User ID 소유권, 저장 복원, 학습일·복습 일정 중복 집계 방지를 확인한다. 1단계 테스트 통과를 실제 보안·영속성 검증으로 간주하지 않는다.
- 미결정 사항은 [PRD §7](PRD.md#7-확정-정책과-미결정-사항)을 따른다. Kubernetes는 별도 실습 환경이다.

### 공통 오류 복구

- `app/not-found.tsx`는 없는 URL/Next notFound, `app/error.tsx`는 하위 렌더 예외, `app/global-error.tsx`는 루트 레이아웃 예외를 처리한다. 설치된 Next 버전의 `retry()`를 사용하며 global은 자체 html/body·스타일과 provider 없는 홈 링크를 제공한다. 홈 복귀에는 user만 유지하고 attempt 등 실패한 경로의 상태는 넘기지 않는다.
- 기능별 QueryClient의 수명과 사용자별 키는 유지하고 `createQueryClient`로 기본 자동 재시도 금지 및 최소 오류 기록(status/code/requestId)을 공유한다. queryKey·mutation 변수·오류 원문은 기록하지 않는다. 앱 내부 입력 검증은 InputValidationError로 명시하여 필드 안내를 유지하고 API/알 수 없는 예외는 안전한 공통 메시지로 표시한다.
- 예상하지 못한 초기 조회 예외·5xx는 지역 QueryBoundary로 처리한다. TanStack QueryErrorResetBoundary와 Next catchError의 retry를 함께 초기화한다. 404·저장소 손상 같은 예상 오류는 해당 영역에서 처리하며 mutation은 경계로 던지거나 자동 재전송하지 않는다.
- 오류 재현은 `BUGRI_UI_PREVIEW=1` 빌드의 `/ui-preview/errors`에서만 제공한다. 일반 빌드에서는 notFound로 차단한다. 외부 모니터링 서비스는 도입하지 않는다.

### 화면 테마

표시 설정은 `src/lib/theme`의 타입·브라우저 저장 어댑터·외부 store로 분리한다. UI는 localStorage에 직접 접근하지 않으며 테마는 계정 데이터/API 요청이 아닌 기기 표시 설정이다. 루트의 정적 초기화 스크립트가 본문 파싱 전에 저장값/시스템 설정을 적용한다. `data-theme`와 CSS `color-scheme`을 동기화하고 헤더 토글은 useSyncExternalStore로 실제 적용 테마를 구독해 반대 테마로 전환한다. 시스템 변경·탭 간 저장 변경도 함께 반영한다. globals.css의 의미 토큰으로 색을 전환하며 버그리 고유색은 별도로 보존한다.

라이트는 `color-scheme: only light`로 Chrome Auto Dark의 자동 재색칠을 억제하고 다크는 `dark`로 선언한다. 헤더 없는 오류 화면에도 ThemeSync를 두어 시스템/탭 변경 구독을 유지한다.

### 퀴즈 카드

QuizCard는 제목 Link/button의 after 영역을 카드 전체로 확장해 기본 접근 영역으로 사용하고, 비상호작용 본문은 pointer-events-none으로 클릭을 전달한다. 설정 버튼은 독립된 상위 클릭 영역이며 중첩 링크/버튼은 만들지 않는다. 키보드 포커스는 카드 외곽에 표시한다. 현재 화면에서는 QuizCard를 쓰지 않으며(내 퀴즈 목록 삭제) 컴포넌트와 규칙만 남아 있다.

### 화면 언어 — I18N-01

`src/lib/i18n`의 한국어 메시지 키·영어 사전과 `useTranslation`을 사용한다. UI가 명시한 서비스 문구만 번역하고 사용자 콘텐츠에는 번역 함수를 적용하지 않는다. 보간 값은 원문으로 유지하며 번역해야 하는 중첩 UI 메시지는 `UiMessage`로 구분한다. 알림·검증 오류는 원본 키 또는 메시지 descriptor로 보관해 표시 중 언어 변경도 반영한다.

언어는 테마와 같은 브라우저 표시 설정이며 저장 접근은 `lib/i18n/store.ts`로 격리한다. `bugri.locale`의 유효한 명시 선택을 우선하고 없으면 브라우저 선호 언어에서 ko/en을 선택하며 지원 언어가 없으면 ko를 사용한다. `useSyncExternalStore`의 서버 snapshot은 ko이며 hydration 후 브라우저 설정과 문서 lang/title을 동기화한다. 경로·데모 사용자·쿼리 캐시·편집 입력은 변경하지 않는다. 공통 헤더 PC와 모바일 메뉴에서 `한국어 / English`를 제공한다. 새 화면 문구는 한국어·영어를 함께 추가한다.

### 개인 풀이 내역

`/my/learning`과 `/my/learning/[attemptId]`는 사용자별 Query → typed API → Mock 서비스 경계를 사용한다. 목록은 완료 Attempt를 필터·검색·정렬·페이지 처리하며 상세는 기존 attempt API와 QuizPanel, 재도전은 startAttempt를 재사용한다. 저장 스키마 버전은 유지하며 완료 revision에서 누락된 결과 필드는 현재 퀴즈로 보충하지 않는다. 개인 목록·결과 조회는 Mock 초기화/마이그레이션을 실행하지 않는 읽기 전용 경로다.
