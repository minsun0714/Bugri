# Bugri 개발 단계와 작업 계획

## 1. 기준과 현재 상태

제품 요구사항은 [PRD.md](PRD.md), API·데이터 경계는 [ARCHITECTURE.md](ARCHITECTURE.md)를 따른다. 아래 TODO는 계획이며 구현 완료 근거가 아니다. 현재 저장소에는 Next.js 프로젝트 기반·초기 홈 화면과 API·Mock 서비스 계층이 있다. API 사용 계약은 [API.md](API.md)를 따른다. 새 기능 UI 연결은 별도 작업이다.

**현재는 1단계 Next.js 프로토타입**을 만든다. DB 연결·MySQL/Prisma/mysql2 설치·실제 JWT·Google OAuth2 구현은 하지 않는다. 2단계 Spring Boot에서 실제 REST API·인증·MySQL 영속성·구매 트랜잭션을 구현한다. 전체 제품 요구사항은 PRD에 남긴다.

## 2. 1단계 — Next.js 프로토타입

| ID    | 작업                                  | 상태        | 선행                     | 완료 기준                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----- | ------------------------------------- | ----------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P00F  | 공통 푸터                             | DONE        | P00UI 시안               | 로고·링크·맨 위 이동·모바일 줄바꿈 구현. lint·타입·단위 6개·개발 서버 E2E 2개 통과. 2593d0f에서 전체 verify 통과(단위 6개·E2E 2개·빌드)                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| P00TW | Tailwind 스타일링 전환                | DONE        | P00UI 시안               | Tailwind v4·PostCSS·테마 토큰 적용, 컴포넌트 CSS 제거. Node 22에서 E2E_PORT=3101 npm run verify 통과(단위 6개·E2E 2개·lint·타입·빌드). 데스크톱·모바일 캡처 확인. 디자인 검토·임시 홈 복원은 P00UI에서 별도 진행                                                                                                                                                                                                                                                                                                                                                                                        |
| P00UI | 공통 UI 컴포넌트·홈 전시              | IN_PROGRESS | P00                      | 공통 UI·임시 홈 전시 구현. 해시태그 칩 입력(Enter 추가·개별 삭제·중복 방지·3개 제한), Markdown 작성·미리보기·코드 블록 삽입 적용. Node 22에서 E2E_PORT=3101 npm run verify 통과(단위 6개·E2E 2개), 모바일·모달 키보드 검증. 상단 헤더·모바일 햄버거 드롭다운 반영(선택 표시·Escape/바깥 클릭 닫기). 해당 변경 lint·타입·개발 서버 E2E 2개 통과; 이전 빌드 환경 오류 이후 2593d0f에서 전체 verify 재실행 통과. 기본 홈은 새 공통 헤더·모바일 메뉴·푸터를 유지하고 본문 전시만 숨김. 전시는 BUGRI_UI_PREVIEW=1 로컬·테스트에서만 활성화. 최종 전체 검증 통과. 디자인 사용자 검토는 남음. 제품 기능과 별개 |
| P00   | 단계별 문서 정합성                    | DONE        | 없음                     | AGENTS·PRD·ARCHITECTURE·TASKS의 1·2단계 경계 반영. 기능 구현과 별개                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| P09C  | Jest 설정 파일 생성                   | IN_PROGRESS | 없음                     | jest.config.mjs·jest.setup.ts 생성. Node 22.23.3에서 jest --showConfig, npm run lint, next typegen 후 tsc --noEmit 통과. 테스트 실행은 미실시; P09는 TODO 유지. 기본 Node 18.12.1에서는 Jest 로딩 실패                                                                                                                                                                                                                                                                                                                                                                                                  |
| P09E  | Playwright 설정 파일 생성             | IN_PROGRESS | 없음                     | playwright.config.ts 생성. lint·tsc 통과; Node 22에서 playwright test --list는 설정 로딩 후 No tests found(0개, 종료 코드 1). E2E 미실행, P09는 TODO 유지. 실행 전 npm run build 필요                                                                                                                                                                                                                                                                                                                                                                                                                   |
| P09S  | 검사 npm scripts 추가                 | IN_PROGRESS | P09C, P09E               | 요청한 스크립트 추가. Node 22에서 verify 실행: lint·typecheck 통과, Jest는 테스트 없음으로 종료 코드 1. 이후 build·E2E 미실행; P09는 TODO 유지                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| P01   | 타입·Mock API 계약                    | IN_PROGRESS | P00                      | `/api/v1` 요청·응답 타입·오류 형식, 더미 사용자·데이터, UI API 클라이언트 경계. UI의 더미 배열 직접 의존 제거                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| P01M  | Mock 초기 파일                        | IN_PROGRESS | P01                      | users·quizzes·subscriptions·shop-items·learning-history 초기 데이터 파일, 배포 시 읽기 전용                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| P02   | localStorage Mock 어댑터              | IN_PROGRESS | P01M                     | 초기 파일 읽기·사용자별 변경 상태 저장/복원, UI 직접 의존 제거, HTTP 호출 없이 계약 유지, 서버 파일 쓰기·메모리 영속 저장 금지                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| P02T  | 학습 시간대 감지·설정                 | TODO        | P02                      | 브라우저 IANA 감지·마이페이지 조회/변경·설정 복원, IP 시간대 검토·국가 코드 추론 금지, 기본 시간대 확정 후 fallback                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| P03   | 학습 내용 입력·퀴즈 생성              | IN_PROGRESS | P02                      | 단일 입력·코드 블록·현재/10,000자, Mock 퀴즈 1~5개와 퀴즈당 태그 최대 3개                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| P04   | 퀴즈 개별·일괄 저장·검토              | IN_PROGRESS | P03                      | 각 후보의 독립 ID·PENDING 저장, 검토·수정·PRIVATE/PUBLIC 화면 흐름                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| P05   | 퀴즈 풀이 UX                          | TODO        | P04                      | 더미 사용자별 풀이, 제출 전 정답 비노출, 결과·버그리 반응                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| P06   | 구독 3종·탐색                         | TODO        | P04                      | 사람·사람+태그·전체 작성자+태그 구독, 더미 개발자·해시태그 탐색. 구독 피드 없음                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| P07   | 학습 태그·연속 풀이                   | TODO        | P05, P06, P02T           | 기본 전체·단일 태그 선택·다음 문제의 태그 유지·소진 후 다시 풀기/다른 태그·기록 보존·하루 1개 완료 조건                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| P08   | BugCoin 상점·장착 UX                  | TODO        | P02, P05                 | 상품 조회→더미 BugCoin 구매→보관함→장착, 잔액 부족·중복 클릭 상태와 타인 데스크 화면                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| P09   | Jest·React Testing Library·Playwright | TODO        | P01M, P02, P02T, P03~P08 | API 계약·핵심 UI 동작·더미 사용자 E2E 통과. 실제 보안·거래 안전성 검증으로 기록하지 않음                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| P10   | Vercel 프로토타입 배포                | TODO        | P09                      | DB·OAuth·JWT 비밀값 없이 화면·Mock API 동작 확인, Mock 데이터의 비영속성 안내                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

1단계에 관리자 상품 등록 실제 API, MySQL 마이그레이션, Spring Boot 서버, 실제 AI 제공자 연결, 구매 트랜잭션·동시성 보장을 추가하지 않는다. 필요한 경우 상품 목록은 더미 데이터로 제공한다. 관리자 직접 등록과 상점의 전체 제품 요구사항은 유지한다.

## 3. 2단계 — Spring Boot 백엔드

| ID  | 작업                               | 상태 | 선행     | 완료 기준                                                                                                                                             |
| --- | ---------------------------------- | ---- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| B01 | REST 계약·데이터 마이그레이션 설계 | TODO | P10      | 1단계 요청·응답 타입과 오류 코드 검토, 더미 데이터 이전 여부 결정                                                                                     |
| B02 | Spring Boot·Java 21·MySQL 8.4 기반 | TODO | B01      | Spring Data JPA 엔티티·마이그레이션·연결 및 통합 테스트                                                                                               |
| B03 | Google OAuth2·JWT 인증             | TODO | B02      | Google 계정↔내부 User ID, JWT 발급·검증, 작성자·관리자 소유권·권한                                                                                    |
| B04 | 실제 퀴즈·구독·태그 학습 API       | TODO | B03      | Mock API를 REST로 교체, 실제 영속성, 학습 후보 필터·완료 기록·UTC 완료 시각·사용자 시간대 학습일·중복 집계 방지·설정 변경 전 기록 보존·버전·권한 제어 |
| B05 | BugCoin·구매·장착·관리자 등록 API  | TODO | B03, B04 | 잔액 검사·차감·구매·보관함을 한 트랜잭션으로 처리, 시간대 변경을 이용한 일일 보상 중복 수령 방지·중복 요청·동시성·관리자 권한 검증                    |
| B06 | 실제 API 통합·배포 검증            | TODO | B05      | UI API 클라이언트 교체, REST 계약·MySQL·인증·거래 테스트. 2단계 배포 환경은 착수 전 결정                                                              |
| K1  | Kubernetes 별도 실습               | TODO | 없음     | 프로토타입·백엔드 기능 완료와 독립적인 실습 환경                                                                                                      |

## 4. 검증과 남은 결정

- Jest: Mock 초기화·변경 상태 재접속 복원·더미 사용자별 격리, 브라우저 IANA 감지 실패와 명시적 기본값, 사용자 설정 우선 적용을 검증한다. 사용자별 자정 경계·같은 UTC 시각의 시간대별 날짜 차이·서머타임 경계·동일 날짜 반복 완료를 테스트한다. 신규/다시 풀기·정답/오답 모두 인정하며 시간대 변경 후 과거 기록·보상을 유지하는지 확인한다.
- React Testing Library·Playwright: 마이페이지 시간대 확인/변경·변경 안내, 사용자 전환과 localStorage 복원, 브라우저 데이터 삭제 후 초기 데이터 사용을 검증한다. 2단계는 서버 UTC 시각·설정 검증·시간대 변경을 이용한 중복 보상 방지를 별도 검증한다.

- 비공개 전환·soft delete 즉시 구독 학습 대상에서 제외한다. 타인의 진행 중 제출 거부·이용 불가 안내, 삭제 후 작성자 제출 차단, 완료 기록·스트릭·XP·BugCoin 보존을 검증한다. 1단계는 Mock UX, 2단계는 상태 변경/제출 경합과 연쇄 삭제 방지까지 검증한다. XP 보존 요구로 1단계 XP 구현을 추가하지 않는다.

- 전체 기본값·단일 태그 선택·다음 문제에서 태그 유지·미풀이 소진·다시 풀기·후보 없음 상태를 검증한다. 태그 변경 전후 구독과 풀이 기록이 유지되어야 한다. 태그를 바꾸거나 같은 날 여러 문제를 완료해도 연속 학습일은 한 번만 집계한다. 하루 문제 수 제한은 두지 않는다.

- 구독 대상은 사용자·해시태그·사용자와 해시태그의 조합이다. 퀴즈는 학습 콘텐츠이며 구독 대상이 아니다. 여러 구독 조건에 맞아도 quizId로 중복을 제거하고, 구독 조건과 선택 태그에 맞는 PUBLIC 퀴즈가 없으면 문제를 제공하지 않는다.

- 1단계: Jest로 Mock API 계약·퀴즈 1~5개·저장·구독·학습 태그·다음 문제·다시 풀기·하루 1개 완료 규칙을, React Testing Library로 입력·풀이·상점 UI를, Playwright로 더미 사용자 여정을 검증한다. Vercel 배포는 프로토타입 검증이다.
- 2단계: Google OAuth2·JWT·내부 User ID, MySQL 저장 복원, 학습일 중복 집계 방지, BugCoin 잔액 부족·중복 요청·동시 구매의 원자성을 Spring Boot·MySQL 테스트로 검증한다.
- 구현 시 `npm run lint`, `npx tsc --noEmit`, `npm run build`, 구성 후 `npm test`와 `npx playwright test`를 사용한다. API·Mock 계층의 실제 검증 결과는 아래에 기록한다.
- 미결정: 실제 AI 제공자·연동 시점, 문제 형식, 시간대 미감지 시 기본 시간대 값·Vercel IP 시간대 제공 가능 여부·변경 전후 일일 보상 중복 판정 세부 기준, JWT 만료·갱신·폐기, 더미 데이터 이전 여부, BugCoin 지급량, 2단계 배포 환경·MySQL 호스팅. 1단계에 DB와 실제 인증을 넣는 것은 미결정 사항이 아니라 제외 정책이다.

## 5. API·Mock 서비스 계층 구현 및 검증 (2026-11-06)

- P01/P01M/P02: `src/api`의 요청·응답/오류 계약, API 클라이언트와 HTTP/브라우저 조립 경계, `src/mocks`의 초기 파일·사용자별 localStorage 어댑터를 구현했다. P02T/P03~P08은 서비스 부분만 구현했으며 화면 작업은 포함하지 않는다. 기존 UI·스타일·디자인 토큰·package.json·lock·공유 Playwright 설정을 변경하지 않았다.
- 서비스 범위: 4가지 문제 형식의 Mock 생성·검증, 개별/일괄 저장, PENDING 검토·리비전 승인·공개 범위·soft delete, 시작 버전 채점·재도전, 3종 구독·태그/다음 문제, 시간대별 학습일·스트릭, 상품·구매·보관함·장착. REQ-01~05, REQ-07~09, REQ-11~12의 데이터 계층 기준을 검증한다.
- 문제별 다양한 형식은 사용자 요청에 따라 단일 선택·복수 선택·OX·단답형으로 명시했다. 시간대 fallback과 BugCoin 지급량은 제품 기본값을 확정하지 않고 설정으로 분리했다. 자세한 DTO·채점·오류·미결정 정책은 API.md에 기록했다.
- Node 22.23.3에서 `npm ci`로 기존 lock에 맞춰 도구를 준비했다. package 파일 변경 없음. `npx next typegen` 후 기존 LayoutProps 생성 타입을 확인했다.
- 마지막 코드 변경 후 `CI=1 npm run verify`: lint 통과, TypeScript 통과, Jest 3 suites/34 tests 통과, Next.js production build 통과. 이후 Playwright는 다른 체크아웃(`/Users/minsun/orca/Bugri`)이 3000번 포트를 사용 중이어서 실행 전 차단됐다. 해당 서버를 종료하거나 검증 대상으로 재사용하지 않았다.
- 같은 코드에서 `CI=1 npx playwright test --config=tests/e2e/mock.config.ts`: 이 워크트리의 production build를 3107번 포트에서 실행하여 Chromium 2 tests 통과. 생성→저장→검토/승인→구독→태그/풀이/재도전→구매/장착→새로고침 복원, 다른 탭의 비공개 전환·오래된 버전 거부를 실제 브라우저 서비스 경계에서 확인했다.
- 새 UI를 구현하지 않았으므로 React Testing Library 컴포넌트 검사와 제품 화면 클릭 E2E는 이번 범위에 없다. Playwright의 서비스 검증을 UI 구현 완료 근거로 간주하지 않는다. DB·실제 인증·실제 AI·실제 거래 안전성도 검증 대상이 아니다.
- `git diff --check` 및 문서 정합성 검토를 수행했다. 최초 검증 당시 기본 전체 파이프라인은 포트 충돌로 완료되지 않았으므로 P01/P01M/P02는 IN_PROGRESS를 유지하고 P02T/P03~P09의 UI 포함 작업도 DONE으로 바꾸지 않는다. 당시 해제 조건은 전체 검증 재실행과 별도 UI 구현/검증이었다. 포트 충돌과 전체 검증은 아래 후속 작업에서 해결했다.

### 후속 검증 — E2E 포트 분리

- `playwright.config.ts`의 기본 포트를 3107로 변경하고 `PLAYWRIGHT_PORT`로 다른 포트를 지정할 수 있게 했다. 서버 명령과 baseURL이 같은 값을 사용하고 다른 서버는 재사용하지 않는다. Mock 전용 설정도 공통 설정을 따른다.
- 마지막 코드 변경 후 Node 22.23.3에서 `npm run verify` 전체 통과: lint, TypeScript, Jest 34개, production build, Chromium E2E 2개. 기존 3000번 포트 충돌은 더 이상 검증 차단 요인이 아니다.
- 포트 변경 동작은 `PLAYWRIGHT_PORT=3108 npx playwright test --config=tests/e2e/mock.config.ts`로도 E2E 2개 통과를 확인했다. 이후 변경은 공유 설정 객체의 줄바꿈뿐이며 최종 전체 검증을 다시 통과했다.
- UI·디자인·package.json·lock은 수정하지 않았다. 데이터 계층 검증과 별도로 UI 연결·컴포넌트 검증 작업은 남아 있다.

### 후속 정리 — src import 별칭 통일

- P01 관련 코드 정리로 API·Mock·서비스와 관련 테스트의 `src` 모듈 import를 기존 `@/*` 별칭으로 통일했다. 타입 import·동적 import도 적용하고 `src` 밖의 Playwright 설정 참조는 상대 경로를 유지했다. 제품 REQ/AC 변경은 없다.
- AGENTS.md에 작성 규칙을 기록하고 해당 범위에만 ESLint 상대 import 제한을 추가했다. Jest의 moduleNameMapper와 E2E 테스트 번들러도 `@/`를 처리하도록 수정했다. UI·디자인·package.json·lock·tsconfig.json은 변경하지 않았다.
- 마지막 코드 변경 후 Node 22.23.3에서 `npm run verify` 전체 통과: lint, TypeScript, Jest 34개, production build, Chromium E2E 2개.
- ESLint API로 별칭 타입 import·별칭 동적 import·외부 설정 상대 참조 허용과 상대 타입 import·상위 경로 re-export·상대 동적 import 거부의 6가지 사례를 직접 검증했다. 관련 파일 Prettier 검사와 `git diff --check`도 수행했다.

### 후속 정리 — 선언·처리 단계 사이 빈 줄

- P01 관련 API·Mock·서비스와 테스트에 ESLint `padding-line-between-statements`를 적용했다. 선언·함수·테스트·제어문·여러 줄 호출 사이와 반환문 앞을 분리하고 import/짧은 변수 선언 묶음은 유지한다. 코드 변경은 빈 줄 추가뿐이며 UI·디자인·package.json·lock은 변경하지 않았다.
- scoped `eslint --fix` 후 Prettier를 적용했다. ESLint API로 타입/함수/제어문/반환문 간격, Prettier 재실행 후 유지, UI 제외를 직접 검증했다.
- 마지막 코드 변경 후 `npm run verify` 전체 통과: lint, TypeScript, Jest 34개, production build, Chromium E2E 2개. 관련 파일 Prettier 검사와 `git diff --check`도 통과했다.

### 후속 정리 — 구조 분해 할당 적용

- P01 관련 API·Mock·서비스와 관련 테스트에 객체/배열 구조 분해를 적용했다. API 응답·엔드포인트·설정값·DTO 변환·검증 데이터·배열 첫 결과·테스트 보조 함수가 대상이며, 타입 확인 후 값을 추출한다.
- `prefer-destructuring`으로 변수 선언의 객체/배열 추출과 별칭 사용을 검사한다. 상태 변경·메서드 this·최신 상태 조회·판별 유니온 타입 좁히기를 보존한다. 기존 공백·import 규칙도 유지하며 UI·디자인·package.json·lock은 변경하지 않았다.
- 마지막 코드 변경 후 `npm run verify` 전체 통과: lint, TypeScript, Jest 34개, production build, Chromium E2E 2개. 관련 파일 Prettier와 `git diff --check`도 통과했다.
- ESLint API로 객체 추출·이름 변경 추출·배열 추출 거부와 구조 분해·상태 변경·메서드 호출 허용의 6개 사례를 직접 확인했다. 제품 동작이나 테스트 기대값은 변경하지 않았다.

### 후속 정리 — 상태·모드 상수화

- P01 관련 퀴즈 상태·학습 모드·학습 결과 상태·목록 범위를 `src/api/constants.ts`의 `as const` 객체로 통일하고 타입을 값에서 추출했다. 계약 파일에서 다시 내보내 기존 타입 import 경로를 유지한다.
- API·Mock 초기값·서비스 비교/상태 전환·저장 데이터 검증·테스트 입력을 공통 상수로 전환했다. E2E 브라우저 콜백에는 상수를 인자로 전달한다. 별도 의미인 퀴즈 공개 상태와 공개 목록 범위는 분리했다.
- 기존 API/localStorage 문자열은 그대로 유지하며, 호환성 테스트의 기대 문자열만 명시적 리터럴로 남겼다. 저장/복원과 알 수 없는 모드·PENDING 공개 범위 거부 테스트 2개를 추가했다. 제품 REQ/AC 변경 없음.
- 마지막 코드 변경 후 `npm run verify` 전체 통과: lint, TypeScript, Jest 4 suites/36 tests, production build, Chromium E2E 2개. Prettier 검사와 `git diff --check`도 통과했다. UI·디자인·package.json·lock은 변경하지 않았다.

### 지침 정리 — 공통 원칙과 작업별 스킬 분리

- `AGENTS.md`를 125줄에서 50줄로 정리했다. Next.js 자동 생성 블록·단계/범위·아키텍처/안전 원칙·핵심 코딩 규칙·검증 정직성·리뷰/병합 원칙은 유지했다. 상세 제품 규칙은 변경 없이 PRD/ARCHITECTURE를 참조한다.
- 기존 `implement-feature/SKILL.md`에 구현 절차를 통합하고 `references/verification.md`로 검사 명령·최대 3회 실패 처리·문서 전용 예외·검증 기록을 분리했다. 새 `prepare-pr/SKILL.md`는 기존 PR 제목/템플릿/Draft/검증/리뷰 규칙을 사용하며 기능 구현만으로 원격 PR을 게시하지 않는다.
- import·상수·구조 분해·코드 간격의 기존 상세 규칙은 `docs/CODING_CONVENTIONS.md`로 빠짐없이 옮겼다. AGENTS와 스킬에서 읽는 조건을 명시하고 API 문서의 중복 포맷 절차를 링크로 대체했다.
- 스킬 2개의 `quick_validate.py` 검증, 상대 링크 25개 확인, Next.js 블록 동일성·코딩 규칙 이관 확인, `git diff --check`와 문서 정합성 검토를 통과했다. 기본 Python에 PyYAML이 없어 임시 가상환경에서 검증 도구를 실행했으며 프로젝트 의존성은 변경하지 않았다.
- 문서·스킬만 수정하여 기능 pipeline은 실행하지 않았다. 애플리케이션·UI·디자인·설정·package.json·lock·제품 REQ/AC는 변경하지 않았고, 이 작업을 기능 구현 검증 완료 근거로 사용하지 않는다.

## UI 문서 기반 리팩터링 (P00R, 2026-11-07)

- 상태: IN_PROGRESS(구현·검증 완료, 구현자 외 리뷰 대기). P00UI 공통 UI에 전체 Prettier 적용, 별칭 import·선언 간격 정리, Markdown 편집·태그 입력·모바일 메뉴 흐름 훅 및 순수 텍스트 변환 분리를 적용했다. 기존 전시와 접근성 동작을 유지한다.
- REQ-01/AC-01c 및 공통 UI 키보드·반응형 품질 기준과 관련된 구조 정리이며 P03~P08 제품 화면 구현을 추가하지 않는다.
- API UI 연동 시 TanStack Query 사용 기준은 implement-feature에 반영한다. 현재 전시는 API를 호출하지 않으므로 패키지·Provider·요청 훅은 첫 API 연동 작업에서 추가한다.
- 검증 계획: 기존 TagInput·공통 UI 테스트, Markdown/모바일 메뉴 E2E, 텍스트 변환 경계 테스트, Node 22.23.3 전체 verify 및 format:check. Hook 로드·신뢰가 확인되지 않아 수동 검증한다.

- 검증 결과: Node v22.23.3에서 `PLAYWRIGHT_PORT=3108 npm run verify` 통과(lint·TypeScript·Jest 8 suites/46 tests·production build·Playwright 4 tests). Markdown fence/선택 영역·Unicode·삽입 제한 회귀 검증을 포함한다.
- 스킬 `quick_validate.py` 통과. 기본 Python의 PyYAML 부재는 `/tmp`의 별도 venv로 해결했으며 프로젝트 의존성을 변경하지 않았다.
- `npm run format:check` 및 `git diff --check`로 마무리한다. 구현자 외 리뷰와 최종 병합 판단은 남아 있으며 push·PR·merge는 수행하지 않는다.

### A 작성 UI — 생성·저장·내 목록 (2026-11-07)

- P03 구현: `/quizzes/authoring`, `src/features/quiz-authoring`에서 단일 Markdown 입력·유니코드 글자 수·초과 원문 보존·Mock 생성 안내·후보 복원·개별/일괄 저장·사용자별 목록을 API 클라이언트에 연결했다. P04 검토·관리 화면은 다음 기능 커밋에서 진행한다.
- 공통 MarkdownEditor에 label/preserveOverflow 옵션을 추가했다. 기존 기본 동작은 유지한다. B/C 기능·Mock/API 계약·패키지·공유 설정은 수정하지 않았다.
- 테스트 우선: 컴포넌트 미구현으로 신규 테스트 실패 확인 후 구현했다. 입력 검증·중복 없는 저장·오류 후 입력 유지 3개를 검증했다.
- Node 22.23.3에서 `npm run verify` 전체 통과: lint·TypeScript·Jest 7 suites/45 tests·production build·Playwright 5 tests. 생성→개별/일괄 저장→새로고침→사용자 전환을 브라우저로 확인했다. 첫 E2E 실패는 friend 초기 퀴즈 2개를 누락한 테스트 기대값을 실제 seed 계약에 맞춰 수정했다.
- 작성자 외 독립 검토는 아직 남아 있다. A 전체 완료 및 B/C 통합 검증을 의미하지 않는다.

### A 작성 UI — 검토·승인·관리 (2026-11-07)

- P03/P04의 A 화면 구현 및 검증 완료: 네 형식의 문제·선택지·정답·해설·원본·태그 편집, 저장된 내용 재확인→명시적 검토→공개 범위 선택→승인, 승인 버전 유지와 PENDING 수정본, 프롬프트 재생성, 공개 범위 전환, 삭제를 연결했다.
- 미저장 이동 경고, 버전 충돌 후 편집 보존·최신 내용 재조회, 생성/저장 실패 후 입력 보존, 사용자별 목록·후보·검토 화면 새로고침 복원을 확인했다.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 8 suites/53 tests·production build·Playwright 7 tests. A 컴포넌트 11개 및 UI E2E 3개 포함. 모바일 폭 390px, 승인·수정·재생성·공개 범위·삭제, 다른 탭 충돌을 검증했다. E2E 오류 선택자가 Next.js route announcer까지 선택한 실패는 검토 영역으로 범위를 제한해 해결했다.
- 사용자 확인에 따라 승인 목록의 B 풀이 링크는 경로가 정해지는 통합 시 연결한다. B/C 화면 및 통합 검증, 작성자 외 독립 리뷰는 남아 있다. 전체 P04 완료 상태는 통합 후 확정한다.

### A 브랜치 dev 병합 (2026-11-07)

- 사용자 pull 차단을 해결하기 위해 검증된 A 기능을 `22aa19e`, `821f0c8`에 커밋하고 `origin/dev`의 `631e5dd`를 병합했다.
- TASKS 양쪽 기록을 보존하고, 공통 MarkdownEditor는 dev의 `useMarkdownEditor` 분리 구조와 A의 label/preserveOverflow·상한 없는 본문/해설 표시를 함께 유지했다.
- 병합 후 Node 22.23.3에서 `npm run verify` 전체 통과: lint·TypeScript·Jest·production build·Playwright 7개. 푸시/PR 생성은 하지 않았다.

### A 화면 보충 설명 정리 (2026-11-07)

- 작성실·생성·후보 저장·수정본·재생성·단답 정답의 보충 설명을 공통 Tooltip으로 옮겼다. 중복 태그 설명은 삭제하고, 오류·현재 상태·승인 대상은 직접 표시한다.
- Tooltip은 hover·키보드 focus·탭으로 열고 Escape·바깥 클릭으로 닫는다. 모바일에서는 화면 안에 표시한다.
- Node 22.23.3에서 `npm run verify` 전체 통과: lint·TypeScript·Jest 59개·production build·Playwright 8개. 새 단위 테스트 2개와 브라우저 도움말·390px 화면 검증 포함. 독립 리뷰는 남아 있다.

### A 작성 화면 컨테이너 정렬 (2026-11-07)

- 본문 최대 너비를 헤더와 같은 1220px로 맞추고 좌우 여백을 모바일 20px·md 이상 48px로 통일했다.
- Chromium 실측: 1280px 화면에서 헤더/본문 내용 경계 모두 78~1202px, 390px 화면에서 모두 20~370px.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 59개·production build·Playwright 8개. `git diff --check` 통과.

### A 공통 선택 입력·상단 정리 (2026-11-07)

- 더미 사용자·승인 공개 범위·현재 공개 범위를 공통 Select로 교체했다. 공통 컴포넌트는 기존 문자열 옵션을 유지하면서 표시명/값 분리, value/onChange/disabled를 지원한다.
- 큰 작성실 제목을 작은 ‘퀴즈’ 제목으로 정리하고 사용자 선택을 상단 오른쪽에 배치했다. 모바일에서는 줄바꿈한다. 데스크톱 브라우저 캡처로 배치를 확인했다.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 60개·production build·Playwright 8개. 기존 사용자 전환·공개 범위 동작과 새 공통 Select 테스트를 포함한다. `git diff --check` 통과.

### A 메뉴 형태 공통 드롭다운 적용 (2026-11-07)

- 헤더 모바일 메뉴의 둥근 패널·그림자·보라색 선택 표시를 따르는 공통 `Dropdown`과 상호작용 훅을 추가했다. 사용자·승인 범위·현재 공개 범위 선택에 적용했다. 선택 값과 API 계약은 유지한다.
- combobox/listbox 의미, 방향키·Home/End·Enter 선택, Escape·Tab·바깥 클릭 닫기, 비활성 상태를 지원한다. 공통 사용 규칙은 CODING_CONVENTIONS에 기록했다.
- 새 컴포넌트 미구현 실패 확인 후 단위 테스트 3개를 통과했다. 기존 화면 테스트는 커스텀 옵션 클릭으로 변경하고 사용자 전환·승인·비공개 전환 검증을 유지했다. 타입 검사에서 RTL에 없는 exact 옵션을 사용한 오류를 수정했다.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 63개·production build·Playwright 9개. 키보드·390px 모바일·바깥 클릭 검증과 데스크톱 열린 패널 캡처 확인 포함. `git diff --check` 통과. 독립 리뷰는 남아 있다.

### A 생성 대화와 관리 화면 분리 — DONE (2026-11-07)

- 생성 화면에서 내 목록·더미 사용자 선택을 제거하고 관리를 `/quizzes/authoring/manage`로 분리한다. 저장 전 후보별 추가 요청·이력·실패 시 입력 보존을 구현한다. Mock 유지, B/C 기능 제외.
- 새 후보 추가 요청 API·저장 검증과 UI 흐름 테스트를 추가했다. 요청만으로 내 목록에 저장하지 않으며, 실패 시 기존 후보와 요청 입력을 보존한다. candidateId 교체로 오래된 후보 갱신을 거부하고 사용자별 요청·응답 기록을 복원한다.
- 최신 구현 스킬에 따라 TanStack Query와 작성 영역 Provider, 사용자별 쿼리 키·API mutation 훅을 적용했다. 생성 입력/비동기 흐름은 useGeneration에 분리했다. 원본 API 클라이언트와 Mock 서비스 경계는 유지한다. API/Mock 외 변경은 A 화면·공통 헤더의 경로 링크 지원에 한정한다.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 67개·production build·Playwright 9개. 후보 추가 요청 정상/실패/권한/오래된 후보/저장 전 목록 제외와 실제 HTTP 직렬화, 생성→대화→복원→개별/일괄 저장→별도 관리·승인·수정·삭제를 확인했다. 데스크톱 대화 화면 캡처를 확인했다.
- 초기 타입/린트 오류(unknown 조건부 렌더링·테스트 구조 분해)를 수정했다. 전체 검증의 기존 HTTP endpoint 개수 기대값은 새 계약 추가에 따라 30→31로 수정하고 신규 경로/본문 검증을 추가했다. 이후 전체 검증 통과. 실제 LLM 호출·B/C 통합과 독립 리뷰는 이번 완료 범위에 포함하지 않는다.

### A 학습 대화와 생성 결과 상세 분리 — DONE (2026-11-07)

- 메시지 전송과 퀴즈 생성을 분리하고, 명시적 생성 성공 시 별도 상세로 이동한다. 대화 복귀 시 기록·미전송 입력을 복원한다.
- Mock 대화 API·사용자 격리·버전 충돌·실패 보존 및 UI 테스트를 추가했다. B/C 및 실제 LLM 연결은 제외한다.
- Node 22.23.3에서 최종 `npm run verify` 전체 통과: lint·TypeScript·Jest 71개·production build·Playwright 9개. 최초 전체 검증의 구조 분해 lint 오류를 수정한 뒤 전체 재실행했다.
- 브라우저에서 메시지만 보낼 때 미생성, 명시적 상세 이동, 상세 새로고침, 복귀 시 대화·미전송 입력 복원, 개별/일괄 저장 및 검토·승인·수정·삭제를 검증했다. 독립 리뷰는 남아 있다.

### A 대화 모달 — DONE

- 공통 모달을 확장해 대화·생성을 한곳에 배치하고 모바일 전체 화면, 하단 입력 고정, 닫기·재열기 입력 유지를 검증한다.
- Node 22.23.3에서 최종 `npm run verify` 통과: lint·TypeScript·Jest 72개·production build·Playwright 10개. 테스트 타입 오류와 상세 이동 시 잔류 모달 문제를 수정한 뒤 전체 검증을 재실행했다.
- 공통 모달·툴팁 키보드 동작, 모바일 390px 전체 화면·입력 유지·상세 이동을 확인했다. 모바일 대화 캡처도 확인했다. 독립 리뷰는 남아 있다.

### A 퀴즈 공동 편집 작업 공간 — DONE

- 바깥 학습 입력 → 생성 모달에서 후보·대화를 함께 표시 → 추가 요청 또는 직접 편집 → 저장으로 변경한다. 실제 AI 스트리밍은 현재 Mock 단계에 포함하지 않는다.
- 작성 입력은 모달 밖에 두고, 생성 성공 후 같은 모달에서 후보·추가 요청·직접 편집을 제공한다. 직접 수정은 후보 ID를 교체하고 이후 재생성의 현재 내용으로 전달한다. 자동 저장·승인은 하지 않는다.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 75개·production build·Playwright 10개. 직접 수정·실패 보존·오래된 후보 충돌, 모달 재열기·새로고침 복원·개별/일괄 저장·검토/승인 흐름을 확인했다. 데스크톱·390px 모바일 캡처를 확인했다.
- 기존 대화 전용 API와 결과 상세 직접 접근은 호환을 위해 유지한다. 실제 LLM 연결·스트리밍과 독립 리뷰는 남아 있다.

### A 작업 모달 세로 배치 — DONE

- 오른쪽 대화 칼럼을 제거하고 퀴즈 아래에 대화·추가 요청을 배치한다. 화면과 키보드 탐색 순서를 일치시킨다.
- Node 22.23.3에서 `npm run verify` 전체 통과: lint·TypeScript·Jest 75개·build·Playwright 10개. 독립 리뷰는 남아 있다.

### A 메시지 순서 정리 — DONE

- 학습 내용을 첫 사용자 메시지로 펼쳐 표시하고, 버그리 퀴즈 응답 바로 아래에 추가 요청 입력을 배치한다. 별도 대화 제목·소개 문구는 제거한다.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 75개·build·Playwright 10개. 독립 리뷰는 남아 있다.

### A 채팅창 아래 퀴즈 배치 — DONE

- 추가 요청 입력창 다음에 퀴즈를 배치한다.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 75개·build·Playwright 10개. 독립 리뷰는 남아 있다.

### A 생성 모달 재열기 오류 — DONE

- 개발 StrictMode의 effect 정리에서 예약된 close 이벤트가 다시 열린 모달을 닫는 문제를 회귀 테스트로 재현했다. 실제 닫힌 상태에서만 닫기 콜백을 전달한다.
- 회귀 테스트가 수정 전 실패·수정 후 성공했다. 테스트 lint 오류 수정 후 Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 76개·build·Playwright 10개. 독립 리뷰는 남아 있다.

### A 퀴즈 우선 표시와 바로 공개 — DONE

- 최초 화면은 퀴즈만 표시하고 LLM으로 수정 선택 시 대화를 펼친다. 바로 공개는 현재 후보 한 개에 대한 명시적 검토·공개 요청이다.
- 후보 바로 공개 API는 명시적 검토 표시·소유권·최신 후보·내용을 검증하고 선택한 후보 한 개를 PUBLIC으로 저장한다. 기존 승인 API의 미검토 차단은 유지한다. LLM 수정 선택 전에는 학습 메시지·요청 기록·입력을 숨긴다.
- 기존 입력 테스트의 펼치기 동작, lint 공백 오류, 브라우저 버튼 선택자 충돌을 수정한 뒤 Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 78개·build·Playwright 11개. 선택 후보만 공개·중복 방지·타인 거부와 기존 저장/승인 흐름을 확인했다. 독립 리뷰는 남아 있다.

### A 작업 이어가기 버튼 제거 — DONE

- 별도 작업 이어가기 버튼을 제거한다. 같은 학습 내용이나 미반영 수정이 있을 때는 퀴즈 만들기로 기존 모달을 열어 작업을 유지한다.
- 마지막 테스트 변경 후 Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 78개·build·Playwright 11개. 단일 버튼으로 모달 재열기·미반영 요청 유지 확인. 독립 리뷰는 남아 있다.

### A 매번 새 퀴즈 생성 — DONE

- 같은 입력에서도 생성 버튼은 새 batch를 만든다. 기존 작업을 여는 분기를 제거하고 새 결과에 이전 미반영 요청·편집을 넘기지 않는다.
- 수정 전 기존 작업 재열기 동작으로 회귀 테스트 실패를 확인했다. Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 78개·build·Playwright 11개. 같은 입력의 새 batch 생성과 이전 편집·미반영 요청 초기화를 검증했다. 독립 리뷰는 남아 있다.

### A 퀴즈 탭과 작업 버튼 정리 — DONE

- 공통 Tabs로 퀴즈를 선택하고 바로 공개·LLM 수정만 주요 동작으로 유지한다. 직접 수정·개별/일괄 저장은 더 보기로 이동하고 버튼 크기를 통일한다.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 78개·build·Playwright 12개. 공통 탭 방향키 전환·더 보기 메뉴 Escape/포커스 복귀·기존 수정/저장을 검증했다. 데스크톱·390px 모바일 캡처 확인. 독립 리뷰는 남아 있다.

### A 발견하기 쉬운 퀴즈 검토 UI — DONE

- 더 보기 메뉴를 제거하고 직접 수정·개별/일괄 저장을 해당 콘텐츠 옆에 노출한다. 문제·번호 선택지·정답/해설의 시각적 구분과 한국어 형식명을 적용한다. B 풀이 화면은 변경하지 않는다.
- Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 78개·build·Playwright 12개. 메뉴 없이 수정·저장 접근, 탭 키보드 전환, 한국어 문제 형식과 선택지 표시를 확인했다. 데스크톱·390px 모바일 캡처 확인. 독립 리뷰는 남아 있다.

### P03-EDIT-MODES — 수정 방식 탭 통합

- 상태: IN_PROGRESS. 생성 후보 카드에 미리보기·직접 수정·LLM 수정 탭을 함께 배치한다. 기존 직접 편집 반영/취소·추가 요청·초안 보존·공개/저장 정책을 유지한다.
- 수정 방식 탭·전환 시 미전송 요청 보존 테스트의 의도한 실패를 확인했다. 관련 컴포넌트 테스트와 기존 작성 E2E 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기로 IN_PROGRESS 유지. Node v22.23.3에서 관련 컴포넌트 6개 및 전체 Hook verify 통과(lint·TypeScript·Jest 79개·production build·Playwright 12개). 수정 방식 탭 키보드 이동·미전송 요청 보존·직접 수정·저장·공개 회귀를 검증했다.
- 3000 개발 서버의 390px 모바일 캡처 확인: 수정 탭 영역 가로 넘침 없음. 근거 로그 .bugri-hooks/verify-1.log. 풀이/쇼핑몰 워크스페이스는 수정하지 않았다.

### A 미확정 수정 중 탭 이동 — DONE

- 직접 수정 초안을 퀴즈별로 보관하고 미리보기·LLM 수정·다른 퀴즈 탭 이동을 허용한다. 다른 초안이 남아 있으면 일괄 저장과 이탈 경고를 유지한다.
- 수정 전 탭 잠금·초안 유실 회귀 테스트 실패를 확인했다. 테스트 선택자 중복을 수정하고, 별도 헤더 변경의 lint 오류가 해소된 뒤 Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 14개. 수정 방식/퀴즈 전환의 초안 유지와 다른 초안의 일괄 저장 차단을 확인했다. 독립 리뷰는 남아 있다.

### A 생성 입력·미리보기 동시 표시 — DONE

- 공통 MarkdownEditor에 split 배치를 추가하고 퀴즈 만들기 입력에 적용한다. 다른 편집기의 기본 탭 배치는 유지한다.
- 기본 3107 포트 점유로 첫 전체 검증의 E2E가 차단되어, Node 22.23.3에서 `PLAYWRIGHT_PORT=3197 npm run verify`를 재실행해 전체 통과했다: lint·TypeScript·Jest 80개·build·Playwright 15개. 입력/미리보기 동시 표시·실시간 갱신·모바일 가로 넘침과 기존 탭 편집기를 확인했다. 데스크톱 캡처 확인. 독립 리뷰는 남아 있다.

### A 코드 삽입 버튼 정리 — DONE

- 공통 MarkdownEditor의 코드 삽입 버튼을 오른쪽 테두리 버튼 “+ 코드 블럭”으로 표시하고 제목·강조·목록 안내를 제거한다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3197 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 코드 블록 삽입과 작성/미리보기 회귀 확인. 독립 리뷰는 남아 있다.

### A 코드 언어 공통 드롭다운 — DONE

- MarkdownEditor의 네이티브 언어 select를 기존 공통 Dropdown으로 교체한다. 모바일 선택·Escape·포커스·코드 삽입을 검증한다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3197 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 390px 모바일에서 언어 선택·Escape 닫기·포커스 복귀·선택 언어 코드 삽입을 확인했다. 독립 리뷰는 남아 있다.

### A 저장 동작 배치 정리 — DONE

- 바로 공개와 개별 저장을 같은 줄로 합치고 일괄 저장·저장 개수는 퀴즈 선택 탭 위로 옮긴다.
- 편집 중 JSX 구문 오류를 수정한 뒤 Node 22.23.3 `PLAYWRIGHT_PORT=3197 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 개별/일괄 저장·공개·탭 이동 회귀 확인. 독립 리뷰는 남아 있다.

### A 임시저장 버튼 명칭·스타일 — DONE

- 개별 저장을 임시저장으로 바꾸고 바로 공개와 동일한 버튼 스타일을 적용한다. PENDING 저장 동작은 유지한다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3197 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 임시저장·공개·기존 편집 흐름 회귀 확인. 독립 리뷰는 남아 있다.

### A 공개·임시저장 툴팁 제거 — DONE

- 바로 공개·임시저장 버튼 옆 도움말 아이콘과 툴팁을 제거한다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3197 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 독립 리뷰는 남아 있다.

### A 실행 버튼 오른쪽 정렬 — DONE

- 작성·생성 결과·검토·내 퀴즈의 실행 버튼 그룹을 오른쪽으로 통일한다. 제목·탭·선택지 정렬은 유지하고 모바일 줄바꿈을 허용한다.
- 검증 로그 경로가 다른 작업과 겹쳐 전용 로그·포트로 재검증했다. Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 근거: /tmp/bugri-authoring-right-actions-52e9afd.log. 독립 리뷰는 남아 있다.

### A 일괄 저장 버튼 제거 — DONE

- 남은 후보 모두 저장 버튼을 제거하고 현재 퀴즈별 임시저장·바로 공개만 제공한다. 기존 일괄 저장 API는 유지한다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 퀴즈별 임시저장·공개와 일괄 저장 버튼 미노출을 검증했다. 독립 리뷰는 남아 있다.

### A · 수정 동작 위계 정리 — DONE

- 퀴즈는 항상 표시하고 제목 오른쪽 수정 버튼으로 아래 편집·대화 영역을 토글한다. 초안은 보존한다.
- 검증: Node 22.23.3, 관련 단위 테스트 7개 통과. 첫 전체 검증에서 테스트 편집 중 관리 드롭다운의 End 키가 바뀐 오류를 확인하고 복원했다. 마지막 코드 변경 후 PLAYWRIGHT_PORT=3291 npm run verify 통과(lint·타입·Jest 80개·빌드·E2E 15개). 독립 리뷰는 남아 있다.

### A · 후보 공개·임시저장 상태 표시 — DONE

- 실제 저장된 퀴즈 상태를 조회해 공개됨·임시저장됨을 구분하고 새로고침에도 유지한다.
- 검증: 공개 상태 테스트의 의도한 실패 확인 후 관련 단위 테스트 5개 통과. Node 22.23.3에서 마지막 코드 변경 후 PLAYWRIGHT_PORT=3291 npm run verify 통과(lint·타입·Jest 80개·빌드·E2E 15개). 공개 후 새로고침 상태 복원을 포함했다. 독립 리뷰는 남아 있다.

### A · Markdown 코드 블럭 도구 배치 — DONE

- 코드 블럭 버튼과 언어 선택기를 본문 입력창과 같은 편집 컨테이너 안에 배치한다.
- 검증: 의도한 E2E 실패를 확인한 뒤 관련 E2E 1개와 Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

### A · LLM 수정 전체 대화 화면 — DONE

- LLM 수정을 선택하면 작업 모달 본문을 대화 화면으로 전환하고 퀴즈로 돌아갈 때 요청 초안을 보존한다.
- 검증: 전환 동작 테스트의 의도한 실패를 확인한 뒤 관련 컴포넌트 7개와 작성 E2E 10개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

### A · LLM 대화 스크롤 영역 분리 — DONE

- 모달과 채팅 헤더·입력창은 고정하고 대화 메시지 본문만 스크롤한다.
- 검증: 스크롤 소유권 E2E의 의도한 실패를 확인한 뒤 작성 컴포넌트 7개와 작성 E2E 10개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

### A · LLM 추가 요청 textarea — DONE

- 추가 요청을 여러 줄 textarea로 바꾸고 포커스 링이 모달 경계 안에서 모두 보이도록 여백을 확보한다.
- 검증: textarea 요소·포커스 링 경계 E2E의 의도한 실패를 확인한 뒤 작성 컴포넌트 7개와 관련 E2E 1개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

### A · LLM 요청 포커스 링 잘림 수정 — DONE

- 공통 7px 포커스 외곽선이 실제 overflow 부모의 좌우·하단 경계 안에 들어오도록 입력 영역 여백을 보정한다.
- 검증: 실제 overflow 부모 경계 E2E의 의도한 실패를 확인한 뒤 관련 E2E 1개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

### A · 직접 수정 단일 화면 — DONE

- 직접 수정 중에는 기존 퀴즈 미리보기를 숨기고 편집 폼만 표시한다.
- 검증: 미리보기 미노출 컴포넌트 테스트의 의도한 실패를 확인한 뒤 작성 컴포넌트 7개와 관련 E2E 1개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

### A · 직접 수정·LLM 수정 독립 처리 — DONE

- 미반영 직접 수정 초안이 있어도 LLM 요청을 허용하고 두 초안을 독립적으로 유지한다. 마지막으로 성공한 반영 결과를 현재 후보로 사용한다.
- 검증: 직접 수정 초안 중 LLM 입력·요청과 마지막 직접 수정 반영 테스트의 의도한 실패를 확인한 뒤 작성 컴포넌트 7개와 관련 E2E 1개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

### A · LLM 대화 최신 위치 복원 — DONE

- LLM 대화에 진입하거나 새 응답이 추가되면 대화 본문을 맨 아래 최신 메시지 위치로 이동한다.
- 검증: 재진입 스크롤 위치 컴포넌트 테스트의 의도한 실패를 확인한 뒤 작성 컴포넌트 8개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 81개·build·Playwright 15개). 독립 리뷰는 남아 있다.

### A · 검토·승인 흐름 단순화 — DONE

- 검토 상세는 저장된 퀴즈 미리보기를 기본으로 표시하고 `직접 수정`을 선택했을 때만 편집 폼을 보여준다. 수정 저장 후 미리보기로 돌아간다.
- 별도 `검토 완료 저장` 버튼을 제거하고 `승인` 한 번이 기존 `MARK_REVIEWED`와 `approve` 요청을 최신 버전으로 순서대로 처리한다. 승인된 기존 버전은 PENDING 수정본이 있을 때 접힌 `현재 공개본과 비교` 영역으로만 제공한다.
- 검토 컴포넌트 테스트의 의도한 실패를 확인한 뒤 관련 단위 테스트 8개와 검토·승인 및 오래된 탭 E2E를 통과했다. 첫 전체 검증에서 기존 영문 `PUBLIC` 기대값 1건을 한국어 상태 문구에 맞춰 수정했고, 마지막 코드 변경 후 Node 22.23.3에서 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 81개·production build·Playwright 15개. 독립 리뷰는 남아 있다.

### A · 생성 모달 본문 스크롤·탭 고정 — DONE

- `버그리와 퀴즈 다듬기` 모달과 작업 공간의 스크롤을 잠그고 선택된 퀴즈의 공통 Tabs panel만 세로 스크롤하도록 변경했다. 모달 헤더와 퀴즈 선택 탭은 본문 스크롤 위치와 관계없이 유지한다.
- 모바일 직접 수정 폼을 끝까지 스크롤한 뒤 본문 overflow와 탭 위치를 실측하는 E2E의 의도한 실패를 확인하고 통과했다. 모바일 실화면에서도 하단 편집 동작과 퀴즈 탭이 동시에 보이는 것을 확인했다.
- Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 81개·production build·Playwright 16개. 독립 리뷰는 남아 있다.

### A · 검토 재생성 모달 — DONE

- 검토 미리보기의 `추가 프롬프트로 재생성`을 `직접 수정`과 같은 버튼 그룹으로 옮기고, 공통 Modal의 textarea에서 수정 요청을 입력하도록 변경했다. 기존 독립 재생성 카드는 제거했다.
- 재생성 실패 시 모달과 입력을 유지하고 성공 시 모달을 닫아 새 PENDING 미리보기로 돌아간다. 버튼 위계·모달 입력 보존 테스트의 의도한 실패를 확인한 뒤 검토 단위 테스트 8개와 검토·승인 E2E를 통과했으며 모바일 실화면을 확인했다.
- Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 81개·production build·Playwright 16개. 독립 리뷰는 남아 있다.

### A · 생성 후보 검토 진입·삭제 — DONE

- 후보별 `검토·승인`을 제거하고, 남은 후보가 모두 임시저장 또는 바로 공개로 처리된 뒤에만 상단에 단일 검토 진입을 표시한다.
- 현재 후보를 삭제하는 타입 API·Mock 서비스·UI를 추가했다. 이미 저장·공개한 후보는 연결 퀴즈도 soft delete하며, 삭제 후 탭·편집 초안 인덱스를 재정렬한다.
- 의도한 단위 테스트 실패를 확인한 뒤 API 권한·충돌·HTTP 직렬화, UI 노출 조건·삭제, 검토 이동·새로고침 복원을 검증했다. Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 20 suites/84 tests·production build·Playwright 16 tests. 독립 리뷰는 남아 있다.

### A · 마지막 생성 후보 삭제 복원 — DONE

- 모든 후보를 삭제한 `GenerationBatch`의 빈 `candidates`를 정상 상태로 검증해, 다음 API 요청이나 새로고침에서 `STORAGE_CORRUPT`로 잘못 판정하던 문제를 수정했다. 이미 저장된 빈 묶음도 초기화 없이 다시 읽힌다.
- 마지막 후보 삭제 후 새 API 클라이언트 복원과 브라우저 새로고침을 추가했다. 의도한 `STORAGE_CORRUPT` 실패를 확인한 뒤 Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 20 suites/84 tests·production build·Playwright 16 tests. 독립 리뷰는 남아 있다.
