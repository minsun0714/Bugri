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
| P03   | 학습 내용 입력·퀴즈 생성              | TODO        | P02                      | 단일 입력·코드 블록·현재/10,000자, Mock 퀴즈 1~5개와 퀴즈당 태그 최대 3개                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| P04   | 퀴즈 개별·일괄 저장·검토              | TODO        | P03                      | 각 후보의 독립 ID·PENDING 저장, 검토·수정·PRIVATE/PUBLIC 화면 흐름                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| P05   | 퀴즈 풀이 UX                          | TODO        | P04                      | 더미 사용자별 풀이, 제출 전 정답 비노출, 결과·버그리 반응                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| P06   | 구독 3종·탐색                         | TODO        | P04                      | 사람·사람+태그·전체 작성자+태그 구독, 더미 개발자·해시태그 탐색. 구독 피드 없음                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| P07   | 학습 태그·연속 풀이                   | TODO        | P05, P06, P02T           | 기본 전체·단일 태그 선택·다음 문제의 태그 유지·소진 후 다시 풀기/다른 태그·기록 보존·하루 1개 완료 조건                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| P08   | BugCoin 상점·장착 UX                  | IN_PROGRESS | P02, P05                 | 상품 조회→더미 BugCoin 구매→보관함→장착, 잔액 부족·중복 클릭 상태와 타인 데스크 화면                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
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

## P08 상점·데스크 UI (2026-11-07)

- 상태: IN_PROGRESS(구현·필수 검증 완료, 구현자 외 리뷰 대기). 현재 `feat/store`에서 작업. 사용자 위임에 따라 5개 카테고리별 2종, 총 10종의 SVG 상품을 직접 디자인했다. 원본은 `src/components/shop/artwork.tsx`; 카드와 장착 데스크가 같은 그림을 사용한다. 2단계 관리자 업로드 방식은 결정하지 않았다.
- `/shop`: 카테고리 필터, 구매, 잔액, 보관함, 장착·해제, 사용자 전환. `/users/[publicId]`: 공개 장착 데스크와 기본 데스크. TanStack Query와 타입 API 클라이언트로 연결하고 사용자별 query key·mutation 이후 잔액/보관함/공개 프로필 갱신을 적용했다. 기존 가격·초기 잔액과 지급량 미결정 정책을 유지한다.
- REQ-09/AC-09b~d 대상. P05 풀이 보상 연결·2단계 거래·관리자 등록은 구현 범위 밖이다. 상품 시각 자산 결정은 PRD/AC-10d와 API 문서에 반영했다.
- 최초 미구현 상태 컴포넌트 테스트 3개 실패를 확인한 뒤 구현했다. 초기 전체 verify에서 E2E 2개가 실패하여 재시도 한도에 따라 중단했으며, 사용자의 명시적인 수정 재개 요청 후 아래 원인을 수정했다.
- 공개 프로필 검사는 현재 표시된 main 내부에 잔액·장착 해제 버튼이 없음을 확인하고, Next.js가 보존한 이전 상점의 본인 잔액은 숨겨져 있음을 별도로 검사한다. API 테스트는 구매·장착한 사용자의 공개 응답이 사용자 식별 정보와 장착 상태만 포함하는지 전체 객체 비교로 확인한다. 잔액 부족 메시지는 상품 컬렉션 내부 alert로 범위를 제한하여 Next.js route announcer와 구분했다. E2E 파일 포맷도 수정했다.
- 최종 검증: Node v22.23.3에서 `PLAYWRIGHT_PORT=3114 npm run verify` 통과(lint·TypeScript·Jest 9 suites/52 tests·production build·Playwright 6 tests). 로그 `.bugri-hooks/verify-shop-resumed.log`. 수정한 상점 E2E 2개와 API 단위 테스트 4개도 별도 실행하여 통과했다. `npm run format:check`, `git diff --check` 통과.
- 데스크톱 1440px·모바일 390px 실제 브라우저 캡처: `.bugri-hooks/previews/shop-desktop.png`, `shop-mobile.png`. 자산·카테고리 카드 배치를 확인했다. 구현자 외 리뷰와 최종 병합 판단은 남아 있다. push·PR·merge 없음.

## P08D 데스크 드래그 배치

- 상태: IN_PROGRESS(구현·필수 검증 완료, 구현자 외 리뷰 대기). 사용자 요청에 따라 장착된 상품의 포인터·터치 드래그, 키보드 이동, 사용자별 위치 저장·복원 및 공개 데스크 배치를 구현했다. 배경은 고정하며 나머지 카테고리는 화면 안에서 이동한다.
- 검증 계획: 이동 소유권·좌표 검증·기존 저장 데이터 호환성·저장 실패 보존 API 테스트, 키보드/취소/재시도 UI 테스트, 실제 마우스·터치 이동과 새로고침·공개 데스크 E2E, Node 22.23.3 전체 verify.

- REQ-09/AC-09e 추가. `moveEquipment` 타입 API·HTTP 경로, API 뒤 소유/장착/좌표 검증, Inventory/PublicProfile의 positions, 기존 v1 저장 데이터의 추가 필드 호환 처리를 구현했다. 위치 저장 실패 시 초안·기존 저장 위치를 보존하고 재시도를 제공한다.
- 미구현 API 6개·UI 2개 테스트 실패를 먼저 확인했다. HTTP operation 증가에 따른 기존 계약 테스트를 갱신하고 좌표 전송 테스트를 추가했다. 실제 터치에서 SVG 내부 상품의 touch-action만으로는 스크롤 취소가 발생해 편집 SVG 루트에 touch-none을 적용했다. 드래그 E2E는 조작 가능·스크롤 위치와 비동기 캐시 반영을 기다린 뒤 저장 위치를 검사한다.
- Node v22.23.3에서 Hook으로 `PLAYWRIGHT_PORT=3114 npm run verify` 실행·통과: lint, TypeScript, Jest 11 suites/61 tests, production build, Playwright 8 tests. 포맷 전체 검사 `npm run format:check`와 `git diff --check` 통과. 로그 `.bugri-hooks/verify-1.log`.
- 실제 마우스 이동·모바일 터치 이동/취소·새로고침 복원·사용자 전환·공개 위치 표시를 E2E로 확인했다. 공개 화면은 이동 버튼을 제공하지 않는다. 키보드 이동 후 화면 캡처 `.bugri-hooks/previews/desk-drag.png` 확인. 개발 서버 `http://localhost:3001/shop` 정상 응답 확인. 구현자 외 리뷰와 최종 병합 판단은 남아 있으며 push·PR·merge하지 않는다.

## P08-3D 실제 3D 데스크

- 상태: IN_PROGRESS(구현·필수 검증 완료, 구현자 외 리뷰 대기). 승인된 3D 전환: 상품 모델·카메라 궤도 회전/45도 시점·상품 회전 핸들·표면 배치·좌표/회전 저장 및 공개 데스크. 기존 구매·보관함과 2D 배치 데이터를 보존·변환한다.
- 검증 계획: 회전 후 경계/높이·소유권·저장 호환·실패 보존 단위 테스트, 편집 UI 접근성/재시도 테스트, 실제 WebGL 렌더링·시점/상품 회전·드래그·모바일·복원·공개 E2E, 전체 verify.

- Three.js 0.187 기반 자체 3D 상품 모델 10종, OrbitControls 카메라 회전/확대와 정면·45도·위쪽 시점, TransformControls 수직축 회전 핸들, 상판 드래그·키보드·회전 슬라이더를 구현했다. 상품 카드도 같은 모델을 렌더링하며 WebGL 불가 시 기존 카드 일러스트/뷰어 복구 안내를 제공한다. 공개 데스크는 시점 조작만 제공한다.
- transformEquipment 계약과 DeskTransforms를 추가하고 2D positions가 있는 v1 저장 데이터를 읽을 때 3D 좌표로 호환 변환한다. 기존 구매·보관함은 보존한다. 상판 높이·회전된 외곽 경계·장착 소유권을 서비스에서 검증한다. 책상은 바닥을 기준으로 움직이고 위 상품은 자식 좌표로 함께 움직인다. 아이템 간 충돌·쌓기는 제외하며 카메라 위치는 저장 대상이 아니다.
- 미구현 API 테스트 4개 실패를 먼저 확인했다. 새 위치/회전 저장·공개 복원·기존 저장 변환·잘못된 높이/회전/경계·저장 실패 보존을 검증하고 UI 테스트를 3D 편집·취소·재시도 요구사항에 맞췄다. 기존 2D E2E 2개는 실제 WebGL 카메라/이동/회전 핸들/터치/복원 E2E로 대체했다. 제품 렌더러는 E2E에서 모킹하지 않는다.
- 중간 TypeScript 검사에서 RTL의 미지원 exact 옵션을 제거했다. 자동 Stop Hook은 Node 18.12.1을 상속해 preverify 단계에서 4회 실패했다. 사용자의 기본 Node 변경 요청으로 ~/.zshenv의 18 경로를 수정하고 ~/.zprofile의 시스템 경로 우선순위를 수정했다(nvm default는 이미 22.23.3). 로그인·일반·대화형 셸에서 v22.23.3 확인. 셸 설정은 백업했으며 저장소 커밋 대상이 아니다. Hook을 재활성화해 횟수를 초기화하지 않고 바뀐 셸에서 전체 verify를 직접 실행했다.
- 최종 검증: 기본 Node v22.23.3에서 `PLAYWRIGHT_PORT=3114 npm run verify` 통과(lint·TypeScript·Jest 12 suites/65 tests·production build·Playwright 8 tests). 로그 `.bugri-hooks/verify-3d-final.log`. `npm run format:check`, `git diff --check` 통과. Playwright의 Three.js CJS 변환에서 deprecation 경고가 발생하지만 제품 번들은 ESM을 사용하며 테스트는 통과했다.
- 1440px/390px 실제 3D 화면 확인: `.bugri-hooks/previews/desk-3d-final.png`, `desk-3d-mobile.png`. 시각 검증은 격리된 브라우저 컨텍스트의 임시 잔액 fixture를 사용하며 실제 사용자 저장소나 상품 가격을 바꾸지 않았다. 기존 개발 서버 `http://localhost:3001/shop`에 반영했다. 구현자 외 리뷰와 최종 병합 판단은 남아 있다. push·PR·merge 없음.

## P08-3D-RECOVERY 3D 초기화 복구

- 상태: IN_PROGRESS. 사용자 보고의 반복 오류를 조사한다. WebGL 차단 시 같은 오류를 재현했다. 초기화/모듈 로딩 오류를 구분하고 WebGL 불가·컨텍스트 손실 시 실제 3D 호환 렌더러로 전환한다. 사용자 구매/배치 저장소는 변경하지 않는다.
- 검증 계획: WebGL 차단·컨텍스트 손실 E2E를 먼저 실패 확인하고 호환 모드의 표시·시점·편집·저장 복원, 오류 구분·재시도 UI 테스트 및 전체 verify를 실행한다.
- 사용자 `/plan` 요청으로 렌더러 변경을 중단했다. 제품 코드는 변경하지 않았으며 WebGL 제거 테스트 초안만 추가된 상태다. 자동 verify는 Node 22.23.3에서 lint 통과 후 TypeScript 실패: `tests/e2e/desk-recovery.spec.ts`의 window.webglRequests 타입 단언 3건(TS2352). Jest·build·E2E는 실행되지 않았다. Hook은 사용자 중단 사유로 blocked 처리했고, 이 작업은 완료/커밋하지 않는다. 사용자 Chrome 환경의 실제 초기화 실패 원인은 아직 확정하지 못했다.

## P08-ZDOG Canvas 입체 시제품

- 상태: IN_PROGRESS. 사용자 승인에 따라 `/shop/zdog`에서 책상·모니터·키보드의 입체 회전, 이동, 겹침을 확인하는 독립 시제품을 구현한다. REQ-09/AC-09e의 렌더러 적합성 실험이며 구매/배치 API 연결·전체 상점 전환은 이번 범위 밖이다.
- 이전 SVG 전체 전환 E2E 초안은 승인된 시제품 범위와 달라 `.bugri-hooks/drafts/desk-recovery.spec.ts`에 보존했다. 기존 제품 회귀 테스트는 유지한다.
- 검증: WebGL 차단 상태 Canvas 표시·시점/상품 회전·마우스/터치 이동·취소·경계·반응형, 전체 verify. 기존 shop-app.tsx 미커밋 편집은 사용자 작업으로 보존한다.
- 구현: Zdog Canvas 2D 모델과 앞/45도/옆/뒤 시점, 포인터·키보드 시점 조작, 키보드/모니터 모드 선택 이동·회전, 상판 경계 제한, 터치 취소 복원, 초기화. `/shop` 상단에 시제품 진입 링크를 추가했다. 시제품은 저장하지 않는다.
- TDD: 경로 미구현 상태에서 시제품 Canvas를 찾지 못하는 E2E 실패 확인. 이후 React effect 동기 상태 갱신 lint 오류를 프레임 초기화로 수정했다. E2E의 오류 검사는 Next route announcer를 제외한 main의 실제 오류를 검사하도록 수정했다. 기존 미커밋 상점 편집에서 빠진 잔액 접근성 이름 때문에 기존 단위 테스트 3개가 실패하여 화면 디자인을 유지하며 접근성 이름을 복구했다. 이 기존 파일 편집은 커밋에 포함하지 않는다.
- 최종 Node v22.23.3 `PLAYWRIGHT_PORT=3114 npm run verify` 통과: lint·TypeScript·Jest 13 suites/67 tests·build·Playwright 10 tests. 로그 `.bugri-hooks/verify-zdog-final.log`. 변경 파일 Prettier 검사와 `git diff --check` 통과. 앞/뒤 시각 확인 캡처 `.bugri-hooks/previews/zdog-front.png`, `zdog-back.png`.
- 평가: WebGL 없는 조작 시제품은 동작한다. Zdog painter 정렬로 모니터 화면 장식/후면과 일부 겹친 면의 가림이 부정확하다. 전체 제품 적용에는 이 한계 해결 또는 렌더러 재선정이 필요하며, 기존 WebGL 오류 복구를 완료한 것은 아니다. 상태 IN_PROGRESS(시제품 검증 완료, 독립 리뷰·채택 판단 대기). push·PR·merge 없음.

## P08-MY 내 데스크 경로와 Canvas 통합

- 상태: IN_PROGRESS. 사용자 요청에 따라 기술명 경로를 `/my`로 변경하고 실제 장착·배치 API를 연결한다. `/shop`은 Canvas 미리보기와 구매/보관함, `/my`는 내 배치 편집, 공개 데스크는 보기 전용이다. 기존 시제품 경로는 `/my`로 이동한다.
- 검증: WebGL 차단 상점·내 데스크·공개 화면, 구매→장착→이동/회전→저장/복원, 터치 취소, 더미 사용자 분리, 기존 API·실패 재시도 회귀와 전체 verify. 기존 사용자 상점 디자인 편집은 보존한다.
- 구현: `/my` 실제 내 데스크/보관함 편집, `/shop` 보기 전용 미리보기·꾸미기 링크, 이전 기술명 경로 redirect. 더미 사용자 선택값을 페이지 간 링크와 URL에 유지한다. 공개 화면은 편집 콜백 없이 시점만 조작한다. 기존 타입 API·장착/좌표·회전 저장과 사용자별 캐시는 유지한다.
- Canvas 상품 모델 10종을 카드/데스크에 공유하고 WebGL 초기화와 그래픽 가속 안내 경로를 실제 제품 화면에서 제거했다. 회전 모드는 원형 핸들 표시와 좌우 드래그/슬라이더를 제공한다. 독립 시제품과 전용 테스트는 실제 내 데스크 E2E 및 기존 API 경계 검증으로 대체했다. 복잡한 교차 면의 painter 정렬 한계는 남아 있다.
- 실패 원인/수정: 미구현 Canvas 검사 실패를 먼저 확인했다. 편집 화면 분리로 기존 UI 테스트를 editing 화면으로 이동했다. Next 16의 searchParams 런타임 접근은 Suspense 경계로 처리했다. RTL 미지원 exact 옵션 타입 오류를 제거했다. 마지막 E2E는 숨겨진 이전 상점의 방위각도 함께 찾아 strict locator 오류가 나서 현재 main으로 범위를 한정했다. 기대 동작·저장/복원 검사를 약화하지 않았다.
- 최종 검증: Node v22.23.3 `PLAYWRIGHT_PORT=3114 npm run verify` 통과(lint·TypeScript·Jest 12 suites/66 tests·build·Playwright 9 tests). 로그 `.bugri-hooks/my-verify-final.log`. 이동/회전/공개 복원 및 모바일 취소 E2E 2개도 별도 통과. 변경 파일 Prettier와 `git diff --check` 통과. 로컬 `/my` 화면 캡처 `.bugri-hooks/previews/my-page.png` 확인.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 구현자 외 리뷰 대기). 기존 상점 소개 제거 편집은 보존하고 잔액 접근성 이름을 유지했다. push·PR·merge 없음.

## P08-DESK-OCCLUSION 드래그 중 상품 가림 수정

- 상태: IN_PROGRESS. 키보드를 책상 위에서 이동할 때 사라지는 사용자 보고를 재현하고 렌더 순서를 수정한다. 좌표 저장/경계 규칙은 유지한다.
- 검증: 실제 Canvas의 키보드 색 픽셀을 검사하여 상판 앞/뒤/좌우 이동 중 표시, 드롭·복원, 회전 시점·모바일·타인 데스크를 검증한다. 기존 이동 E2E는 좌표만 확인했으므로 시각 회귀 검사를 추가한다.
- 원인: Zdog의 중심 깊이 정렬로 큰 상판이 뒤쪽 키보드보다 나중에 그려져 실제 상품을 덮었다. 좌표는 정상 상판 높이 1.55였으며 재현 캡처에서 뒤쪽으로 이동한 키보드가 일부만 보였다. 초기 시각 E2E는 데스크톱에서 키보드 색 픽셀 0, 모바일에서 39를 검출해 실패했다.
- 수정: 위에서 보는 카메라·상판 고정 높이 조건에 맞춰 책상 자체와 상판 위 상품의 렌더 순서를 분리했다. 상품끼리는 깊이 정렬을 유지하고, 각 상품의 부품을 하나의 그룹으로 묶었다. 키보드 몸체 다음에 키캡을 그려 몸체가 키캡을 덮는 현상도 수정했다. 좌표·구매·저장 API는 변경하지 않았다.
- 시각 회귀 테스트: 1100px/390px에서 이동 전 키보드 몸체 색 픽셀 대비 80% 이상 유지, 네 모서리 드래그·드롭·새로고침·정면/위/45도 시점·키보드 90도 회전·시점 한 바퀴·공개 데스크 표시. 기존 이동/터치 취소 E2E 포함 관련 4개 통과 후 최종 전체 검증을 실행했다.
- 최종 Node v22.23.3 `PLAYWRIGHT_PORT=3114 npm run verify` 통과(lint·TypeScript·Jest 12 suites/66 tests·build·Playwright 11 tests). 로그 `.bugri-hooks/visibility-verify.log`. 변경 파일 Prettier와 `git diff --check` 통과. 수정 전/후 캡처 `.bugri-hooks/previews/keyboard-disappear.png`, `keyboard-fixed.png` 확인.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.
- 후속 자동 Hook 검증은 기본 포트 3107 점유로 Playwright 서버 시작 전에 실패했다(`.bugri-hooks/verify-1.log`). lint·TypeScript·단위 66개·build는 통과했고 자동 E2E는 미실행이다. 앞선 전용 포트 3114 수동 전체 검증 통과와 구분한다. 후속 조사 시 3107 리스너는 확인되지 않았다. Hook 지시대로 환경 blocked 처리했으며, Hook 실행 환경에 전용 `PLAYWRIGHT_PORT` 전달 후 재검증이 필요하다. DONE으로 표시하지 않는다.

## P08-FREE-PLACEMENT 자유 배치와 E2E 포트 자동 선택

- 상태: IN_PROGRESS. 사용자가 상판 밖 자유 배치와 현재 높이 유지를 선택했다. x/z 상판 경계 제한을 해제하고 위치·회전 저장과 공개 복원을 유지한다. 멀리 이동한 배치는 드롭 이후 화면에 맞춰 표시한다.
- 검증 포트는 지정값/기본값에서 시작하여 점유 시 +1씩 빈 포트를 찾는다. 다른 서버를 재사용/종료하지 않고 테스트 실패 자체는 재시도하지 않는다. 포트 선택·시작 충돌·실패 전달 테스트 및 실제 포트 점유 상태 전체 verify를 수행한다.
- 구현: x/z 상판·방 외곽 clamp를 제거하고 0.001 단위 정규화·유한값·회전·기존 높이·소유/장착 검증은 유지했다. 기존 저장 데이터는 마이그레이션 없이 읽는다. 드래그 시작 배율을 고정하고 드롭·재조회 시 상품 위치와 시점의 투영 범위로 화면 배율을 맞춰 멀리 배치한 상품도 표시한다.
- 테스트: 라벤더 키보드 (6.25, 1.55, -4.5), 90도 저장/공개 복원 API 테스트를 먼저 실패 확인했다. 승인된 정책 변경에 따라 상판 밖 좌표 거부 기대만 제거하고 높이·NaN·회전·타인 수정 거부는 유지했다. 기존 가림 테스트는 clamp 의존 드래그 대신 같은 상판 모서리를 직접 방문하며 픽셀 기준을 유지한다. 새 E2E는 책상 밖 드래그·현재 높이·90도 회전·저장/재조회·실제 라벤더 색 픽셀·공개 좌표를 확인한다.
- 포트: `npm run test:e2e` 래퍼가 기본/지정 포트부터 +1씩 탐색하고 빌드 중 포트를 빼앗긴 경우도 명확한 서버 시작 충돌만 재시도한다. 실제 테스트 실패는 재실행하지 않고 종료 코드를 전달한다. 포트 도구 테스트 3개를 전체 verify에 포함했다. 직접 npx 실행에는 래퍼가 적용되지 않음을 HOOKS 문서에 기록했다.
- 중간 E2E는 저장 직후 비동기 화면 반영 전의 기존 x/회전값을 읽어 실패했다. 기대값은 유지하고 x>2·회전90의 화면 반영을 명시적으로 기다리도록 수정했다. 임시 포트 점유 fixture의 연결 정리 지연은 소유한 임시 서버만 종료한 뒤 연결을 즉시 닫는 fixture로 다시 확인했다.
- 최종 Node v22.23.3 전체 `npm run verify` exit 0: lint·TypeScript·Jest 12 suites/67 tests·포트 도구 3 tests·build·Playwright 12 tests. 3107/3108을 실제 점유시킨 상태에서 자동 3109 선택, 검증 후 두 임시 서버 정리까지 확인했다. 로그 `.bugri-hooks/free-port-verify-clean.log`. 변경 파일 Prettier와 `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 구현자 외 리뷰 대기). push·PR·merge 없음.

## P08-HEIGHT 상품 높이 편집

- 상태: IN_PROGRESS. 사용자 승인에 따라 키보드·모니터·소품 높이 조절, 수직 드래그 핸들·슬라이더/숫자 입력·바닥/상판 프리셋, 저장/복원·공개 표시를 추가한다. 책상 자체는 바닥에 유지하고 지하 배치는 막는다.
- 검증: 높이 API·기존 데이터·지하/비유한 거부·저장 실패/취소, 실제 높이 드래그·상판 가림/다리 사이 표시·새로고침·공개 보기 전용, 기존 자유 배치/가림 회귀와 전체 verify.
- 구현: HEIGHT 도구, 수직 화살표·드래그, 위/아래 방향키, 높이 슬라이더/숫자 입력, 바닥(0)/상판(1.55) 프리셋을 제공한다. 책상은 y=0, 나머지 상품은 y>=0의 0.001 단위 값을 기존 transformEquipment 계약으로 저장한다. 숫자 입력으로 슬라이더 기본 범위보다 높게 배치할 수 있고 표시 범위도 높이에 맞춰 확장한다. 수평 이동은 선택 높이를 유지한다.
- 가림: 책상 다리/낮은 상품 → 상판 → 높은 상품 순서로 렌더한다. Zdog의 캐시된 그리기 목록 때문에 최초 높이 E2E에서 바닥 키보드가 위쪽 시점에 노출되는 오류(793픽셀)가 나서, 상판 높이를 넘나들거나 도구/선택이 바뀔 때 장면 그룹을 재구성하도록 수정했다. 상판 내부를 관통하는 물체 간 충돌/쌓기 물리는 추가하지 않는다.
- 저장 직후 부모 조회 데이터가 갱신되기 전에 이전 높이를 잠깐 표시하던 문제도 재현 테스트 후 수정했다. 조회 스냅샷이 그대로인 동안 성공한 배치를 표시하고 새 스냅샷이 오면 외부 변경을 포함해 새 값을 따른다. 실패 시 높이/회전 초안 유지와 취소·재시도는 보존한다.
- TDD: 높이 API/높이 UI 미구현 실패 2개와 저장 성공 후 표시 복귀 실패 1개를 확인했다. 높이 0/0.7/2.4/5 저장·공개 복원, 지하/비유한 거부, 프리셋/키보드/취소/저장 실패 초안, 실제 수직 드래그·가림 픽셀·새로고침·공개 보기 전용을 검증한다. 기존 키보드 가림/자유 배치 E2E도 유지한다.
- 최종 Node v22.23.3 `npm run verify` 통과: lint·TypeScript·Jest 12 suites/70 tests·포트 도구 3 tests·build·Playwright 13 tests. 중간 전체 검증의 새 API 테스트 공백 규칙 오류를 수정 후 다시 통과했다. 로그 `.bugri-hooks/height-verify-final.log`. 변경 파일 Prettier·`git diff --check` 통과. 바닥 키보드가 다리 사이에 보이는 화면과 위에서 상판에 가려지는 캡처 `.bugri-hooks/previews/height-floor-side.png`, `height-floor-top.png` 확인.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-BUGRI 공간의 버그리

- 상태: IN_PROGRESS. 사용자 요청에 따라 상품이 없는 기본 데스크부터 버그리가 함께 있도록 Canvas 캐릭터 모델을 연결한다. 기존 전시 시안의 연두색 몸통·더듬이·눈/입/볼 시각 언어를 따른다. 전시 모듈은 제품 화면에서 import하지 않는다.
- 버그리는 구매/장착 상품과 구분된 기본 캐릭터로 내 공간·상점 미리보기·공개 공간에 표시한다. 새 상품/구매 API나 보상 정책은 추가하지 않는다. 실제 Canvas 픽셀·시점 회전·모바일·사용자 전환과 기존 편집 회귀를 검증한다.
- 구현: 구매/장착과 무관한 기본 버그리를 책상 옆에 렌더하고, 회전과 모바일 화면에 맞게 장면 범위를 확장했다. 접근성 설명도 연결했다.
- 실패 분석: 최초 미구현 테스트는 버그리 픽셀 0으로 실패했다. 책상 위 배치는 드래그 상품을 가려 기존 픽셀 회귀가 실패해 책상 옆으로 옮겼다. 이후 실행은 빌드 중 다른 프로세스가 3107을 점유해 EADDRINUSE로 실패했다. Playwright가 다른 서버의 URL 응답을 준비 완료로 오인하지 않도록 자신이 실행한 서버의 Ready 로그를 기다리게 수정했다. 기존 포트 +1 재시도는 유지한다.
- 검증: Node v22.23.3 관련 E2E 5개 통과 후 최종 `npm run verify` 통과(lint·TypeScript·Jest 12 suites/70 tests·포트 도구 3 tests·build·Playwright 15 tests). 로그 `.bugri-hooks/bugri-verify.log`. 모바일/PC 실제 화면도 확인했다. 테스트 기대값은 약화하지 않았다.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-TRYON 상품 우선 상점과 장착 미리보기

- 상태: IN_PROGRESS. REQ-09/AC-09b,c,e에 따라 상점의 상시 데스크를 상품별 모달로 이동하고 상단 잔액·상품 우선 목록을 제공한다. 상점 모달의 시점 프리셋을 제거하고 드래그 회전을 유지한다. 임시 적용은 저장하지 않으며 구매/실제 장착은 명시적 동작으로 분리한다. 기존 API 계약은 유지한다.
- 검증 계획: 미구현 E2E 2개 실패 확인 후 모바일/PC 모달·회전·닫기/포커스 복원·구매 없는 미리보기 격리, 기존 구매/장착·공개·드래그 회귀와 전체 verify.
- 구현: 상시 데스크를 `/shop`에서 제거하고 상단 잔액 배지·꾸미기 링크·상품 목록을 배치했다. 상품별 장착해 보기 모달은 현재 장착의 해당 카테고리만 임시 교체하며 드래그 회전·닫기/ESC·포커스 복원을 제공한다. 모달에서 구매 후 별도 실제 장착을 선택할 수 있고 잔액 부족 오류도 표시한다. `/my`와 공개 공간의 시점 버튼은 유지한다.
- 실패 분석: 의도한 미구현 E2E 2개는 상점에 상시 Canvas가 남아 있어 실패했다. 구현 후 닫기 포커스 복원 누락을 발견해 실행 버튼 참조로 복원했다(중간 검사는 참조 연결 전 빌드를 사용해 같은 오류가 재현됨). 추가 구매 테스트는 카메라 output과 구매 알림의 status 역할 중복으로 실패해 구매 알림으로 선택자를 한정했다. 마지막 관련 E2E 3개·상점 단위 6개 통과. 기존 구매/장착·WebGL 미사용·버그리 검사는 새 모달 진입 경로로 갱신하고 검증 내용은 유지했다.
- 최종 Node v22.23.3 `npm run verify` 통과: lint·TypeScript·Jest 12 suites/70 tests·도구 3 tests·build·Playwright 18 tests. 로그 `.bugri-hooks/tryon-verify.log`. PC/모바일 상품 목록·모달 화면 확인, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-TRYON-EDIT 미리보기 방 크기와 상품 드래그

- 상태: IN_PROGRESS. REQ-09/AC-09e 사용자 후속 요청. 공통 Modal의 room 크기를 추가해 실제 `/my` Canvas와 너비를 맞춘다. 기존 미리보기의 readOnly/선택 없음 때문에 상품 드래그가 불가능했던 문제를 수정한다. 상품을 자동 선택한 이동 모드로 열고 로컬 드래그·회전·높이·시점 전환, 명시적 장착 후 배치 저장과 부분 실패 재시도를 제공한다.
- 검증 계획: PC/모바일 너비 비교 미구현 실패 확인, 실제 드래그·회전·저장/새로고침·초안 폐기·부분 실패 재시도, 기존 모달과 구매/편집 회귀, 전체 verify.
- 구현: 공통 Modal의 room variant는 `/my`와 같은 Canvas 폭(PC·모바일 실제 비교 ±2px 이내)을 제공한다. ProductTrial/useProductTrial이 선택 상품 이동 모드·드래그/회전/높이·방향키·시점 전환과 임시 상태를 관리하고, 기존 useSpatialEditor의 기본 동작은 유지한다. 닫기 시 초안을 버리며 실제 장착은 equip → transformEquipment 순서로 저장한다. 부분 성공 오류는 재시도와 위치 보존을 제공한다.
- 실패/수정: 최초 E2E는 기존 좁은 모달 너비로 실패했다. 오류 메시지 함수 분리 후 공개 페이지 import 누락과 새 RTL 테스트의 Playwright 전용 exact 옵션으로 빌드가 실패해 수정했다. 전체 검증에서 성공 알림이 조회 상태에 과하게 의존해 누락되는 단위 테스트 실패가 나서 실제 저장 성공한 배치 스냅샷으로 알림을 판단하도록 수정했다. 변경된 초안에는 이전 성공 알림을 표시하지 않는다.
- 검증: 관련 상점 단위 12개·관련 E2E 6개 통과. 마지막 수정 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/72 tests·도구 3 tests·build·Playwright 20 tests). 로그 `.bugri-hooks/tryon-edit-verify-final.log`. PC/모바일 모달 캡처 확인, 드래그/회전 저장·새로고침·취소·부분 실패 재시도 검증, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-SHOP-LIST 상점 탭 제거

- 상태: IN_PROGRESS. 사용자 요청에 따라 `/shop`의 상점/보관함 전환을 제거하고 전체 상품·카테고리·보유 표시와 미리보기 장착을 유지한다. `/my`의 보유 상품 장착/해제는 유지하고 단일 탭 버튼은 제목으로 바꾼다. 회전 도구 선택은 아직 미확정이므로 이번 범위에 포함하지 않는다.
- TDD: 상점/보관함 버튼 부재·상품 10개 표시 테스트의 미구현 실패 확인. 기존 구매/장착 회귀의 진입 경로를 상품 모달로 갱신하고 보유 상품 관리 단위 검사는 `/my`에서 실행한다.
- 검증: 관련 단위 7개·E2E 5개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 20 tests). 로그 `.bugri-hooks/shop-list-verify.log`. 실제 PC/모바일 화면에서 탭 제거와 상품 목록 표시 확인. 기존 장착/자유 배치/높이/공개 저장 검증은 새 모달 진입 경로로 유지했으며 `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-DIRECT 오브젝트 직접 조작

- 상태: IN_PROGRESS. 사용자 요청에 따라 내 데스크와 미리보기 상단 도구 버튼을 제거하고 상품 클릭 → 선택 테두리/옆 핸들, 상품 드래그 이동, 빈 공간 드래그 시점 회전으로 전환한다. 가림과 실제 픽셀을 따르는 선택, 터치/키보드·높이·저장/복원·미리보기 격리를 검증한다. 기존 API 계약은 유지한다.
- TDD: 직접 선택 E2E의 미구현 실패 2개 확인. 기존 이동/회전/높이 검증은 실제 상품 픽셀과 컨텍스트 핸들로 진입하도록 바꾸며 저장·가림·취소 기대값은 유지한다.
- 구현: 별도 Canvas 색상 맵으로 현재 보이는 상품을 선택하고 DOM 선택 테두리·옆 회전/높이 핸들을 표시한다. 상품 드래그는 이동, 빈 공간 클릭은 선택 해제, 빈 공간 드래그는 시점 회전이다. 회전 핸들은 드래그·클릭 15도·방향키를 지원한다. `/my` 전체 보유 상품과 미리보기 대상 상품에 적용하며 공개 공간은 보기 전용이다. 미리보기 선택 해제 후에도 임시 배치를 명시적 장착 시 저장한다.
- 실패 분석: 첫 구현 E2E에서 상품 선택 시 모달의 상세 영역이 생기며 Canvas가 위로 28px 이동해 다음 드래그가 빈 공간으로 인식됐다. 상세 영역 높이를 예약해 PC·모바일 모두 선택 전후 Canvas 위치 변화 0px을 확인했다. 테스트 기대값을 약화하지 않고 실제 보이는 상품 픽셀과 옆 핸들을 대상으로 변경했다.
- 검증: 관련 단위 13개·배치 회귀 E2E 13개, 회전 핸들 클릭/방향키·선택 해제 후 저장까지 추가한 직접 조작 E2E 2개 통과. 마지막 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 22 tests). 로그 `.bugri-hooks/direct-verify.log`. 자유 배치·회전·높이·터치 취소·상판 가림·저장/재조회·공개 보기·미리보기 격리 회귀와 PC/모바일 화면 확인, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-ROTATE-DRAG 회전 드래그 핸들

- 상태: IN_PROGRESS. 사용자 요청에 따라 회전 핸들의 클릭 15도 동작을 제거하고 누른 채 좌우 드래그하는 방식으로 표시한다. 드래그 안내와 잡기 커서를 추가하며 키보드 조절은 유지한다.
- TDD: 단순 클릭 시 각도 유지 기대값으로 변경한 PC/모바일 E2E 2개가 기존 클릭 회전 때문에 실패함을 확인했다. 드래그 중 각도 변경·드롭 저장·새로고침 복원·단순 클릭 무변경을 검증한다.
- 구현: 회전 핸들에 드래그 표시·잡기 커서를 추가하고 포인터 클릭 회전과 2px 이하 흔들림을 무시한다. 드래그 중 실시간 각도 반영·드롭 확정, 키보드 방향키 조절과 기존 높이 핸들 동작은 유지한다.
- 검증: 관련 E2E 2개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 22 tests). 로그 `.bugri-hooks/rotate-drag-verify.log`. `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-COMPACT-HANDLE 작은 회전 화살표

- 상태: IN_PROGRESS. 사용자 요청에 따라 선택 테두리 모서리 위로 돌출된 작은 회전 화살표로 바꾸고 상하 화살표 핸들을 제거한다. 28px 조작 영역·20px 아이콘, 회전 드래그·키보드·기존 높이 입력/저장은 유지한다.
- 검증: PC/모바일 회전 핸들 크기·상하 핸들 부재·드래그/저장 회귀, 높이 입력·가림·저장 회귀와 전체 verify. 요청에 따라 높이 E2E 진입을 제거된 핸들에서 기존 숫자 입력으로 변경한다.
- 검증: 관련 E2E 3개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 22 tests). 로그 `.bugri-hooks/compact-handle-verify.log`. 모바일 실제 화면에서 작은 화살표와 연결선 확인, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-NO-ROTATION-SLIDER 회전 슬라이더 제거

- 상태: IN_PROGRESS. 사용자 요청에 따라 내 데스크와 미리보기의 회전 슬라이더를 제거한다. 작은 회전 화살표 드래그·키보드 회전·각도 표시·저장은 유지한다. 미리보기의 예약 공간도 각도 표시 한 줄 크기로 줄여 선택 시 화면 이동을 방지한다.
- TDD: 슬라이더 부재 단위 테스트의 미구현 실패 확인. 기존 회전 테스트를 화살표 드래그/키보드 조작과 배치 각도 출력으로 변경하고 저장·실패 초안 유지·복원 기대값은 유지한다.
- 검증: 관련 단위 13개·E2E 6개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 22 tests). 로그 `.bugri-hooks/no-rotation-slider-verify.log`. 슬라이더 부재·드래그 중 각도·키보드 회전·실패 초안 보존·저장 복원 확인, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-CLEAN-DESK-COPY 배치 수치와 안내 정리

- 상태: IN_PROGRESS. 사용자 요청에 따라 내 데스크·장착 미리보기의 좌표/회전 수치, 상시 조작 안내·미리보기 설명과 예약 여백을 제거한다. 카메라 각도도 화면에서 숨기고 키보드 사용자의 배치 피드백은 스크린리더 전용으로 유지한다. 구매/장착·저장 실패 안내와 편집 조작은 유지한다.
- 검증: 문구/표시 정리이므로 별도 로직 테스트 추가 없이 기존 직접 조작·저장 회귀와 전체 verify, 실제 화면 확인을 수행한다.
- 검증: 관련 직접 조작 E2E 2개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 22 tests). 로그 `.bugri-hooks/clean-desk-copy-verify.log`. 실제 모바일 화면에서 수치/문구/예약 여백 제거 확인, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-ADDITIVE-PREVIEW 기존 공간에 상품 추가 미리보기

- 상태: IN_PROGRESS. 사용자 요청에 따라 기존 책상/장착/배치를 보존한 채 별도 물건을 추가하는 미리보기로 변경한다. 추가 대상만 편집하고 기존 공간 스냅샷은 유지한다. 배경은 환경 전환으로 유지한다. 실제 저장의 단일 카테고리 계약은 변경하지 않으며 해당 저장 동작은 교체 버튼으로 표시한다.
- TDD: 기존 책상 색과 추가 책상 색, 기존 키보드와 추가 키보드 동시 표시·기존 배치 보존 E2E 2개 미구현 실패 확인. 현재 공간/추가 앵커 분리, 드래그·저장 회귀, 취소 후 원상 유지와 전체 verify를 검증한다.
- 구현: 기존 공간 스냅샷과 추가 상품 앵커를 분리하고 추가 대상만 선택·이동·회전한다. 새 책상은 기존 책상 옆에 배치하며 두 책상과 기존 소품·버그리를 포함하도록 화면 중심/배율을 맞춘다. 실제 저장이 기존 상품을 교체하는 경우 버튼에 명시한다.
- 실패 분석: 모바일에서 대칭 원점 기준 축소 때문에 기존 키보드가 지나치게 작아져 가시 픽셀 검사가 실패했다. 두 책상의 중간을 화면 중심으로 사용하도록 구현을 수정했으며 기존 기대값을 유지한 관련 E2E 9개가 통과했다.
- 검증: 관련 단위 15개·E2E 9개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/75 tests·도구 3 tests·build·Playwright 24 tests). 로그 `.bugri-hooks/additive-preview-verify.log`. 실제 모바일 화면에서 기존 책상/키보드/버그리와 추가 책상 동시 표시 확인, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-ROTATION-DIRECTION 회전 드래그 방향 수정

- 상태: IN_PROGRESS. 오른쪽 드래그에 상품이 반대로 도는 입력 부호를 수정한다. 기존 저장 각도와 렌더링 계약을 유지하고 PC/모바일 직접 회전·저장 회귀와 전체 verify로 검증한다.
- 원인/수정: 렌더러가 저장된 rotationY를 음수로 변환하므로 오른쪽 드래그의 양수 입력이 화면에서 역회전했다. 드래그 입력 부호를 반대로 적용하며 저장 각도·기존 배치·키보드 각도 증감 계약은 유지한다.
- TDD: 방향을 검사하도록 강화한 PC/모바일 E2E 2개가 수정 전 324° 기대/36° 실제로 실패한 것을 확인했다. 수정 후 오른쪽 60px와 왼쪽 30px 드래그, 드래그 중/종료 각도, 저장·복원 E2E 2개 통과.
- 검증: Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/75 tests·도구 3 tests·build·Playwright 24 tests), `git diff --check` 통과. 로그 `.bugri-hooks/rotation-direction-verify.log`.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-OWNED-NO-TRIAL 보유 상품 미리보기 버튼 제거

- 상태: IN_PROGRESS. 상점에서 보유 상품의 장착해 보기 버튼을 숨긴다. 미보유 상품 미리보기와 열린 미리보기 안의 구매 후 장착은 유지한다. 구매 전후 버튼 표시 단위 검사와 PC/모바일 구매·저장 회귀, 전체 verify로 검증한다.
- 추가 요청: 가격은 별도 줄에 두고 장착해 보기/구매하기를 두 열의 한 줄로 배치한다. 보유 중은 구매 버튼과 같은 오른쪽 열을 유지하여 구매 전후 가격·버튼 높이가 바뀌지 않게 한다.
- 구현: 보유 상품의 미리보기 진입을 숨기고, 구매 후 제거된 트리거 대신 내 데스크 링크로 모달 닫기 포커스를 복구한다. 가격 아래 두 열 버튼 줄을 유지하며 보유 중은 오른쪽 구매 위치에 표시한다.
- 실패 분석: 구매 후 버튼 부재 단위 테스트의 의도한 실패 확인. 첫 전체 verify에서는 기존 E2E 10개가 구매 후 제거된 미리보기 버튼을 클릭하여 실패했다. 승인된 새 흐름에 맞춰 미리보기 안에서 구매하거나 내 데스크에서 장착하도록 진입만 수정했으며 기존 이동·회전·저장·가림 검증은 유지했다.
- 검증: 관련 단위 7개·E2E 13개 통과. PC/모바일에서 가로 버튼 배치, 구매 전후 가격/버튼 상대 위치와 카드 높이 유지, 보유 상품 버튼 부재와 미보유 상품 취소 후 저장 상태 보존 확인. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/75 tests·도구 3 tests·build·Playwright 24 tests). 로그 `.bugri-hooks/owned-no-trial-layout-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-MONITOR-SCREENS 모니터 상품 화면 구분

- 상태: IN_PROGRESS. 집중 모니터는 밝은 타이머/체크리스트, 미드나잇 모니터는 어두운 코드 편집기 화면으로 구분한다. 상품 썸네일·장착 Canvas 모델·SVG 대체 이미지에 적용한다. 시각 자산 변경이므로 화면 확인 및 기존 전체 verify로 검증한다.
- 구현: 화면 도형 정의를 Canvas 모델과 SVG 대체 이미지에서 공유한다. 집중 모니터에 밝은 초록 타이머/체크리스트, 미드나잇 모니터에 어두운 편집기/색상 구문과 짙은 받침대를 적용하고 설명을 갱신했다. 상품 카드·장착 미리보기 실제 화면 확인.
- 실패 분석: 화면 무늬의 도형 분포가 깊이 정렬에 영향을 주어 미드나잇 화면이 본체에 가려지는 문제를 발견했다. 본체와 화면을 같은 표시 그룹에 두고 본체 다음에 화면을 그리도록 수정했다. 새 회귀 테스트는 Canvas 타입 누락, 회전 전 선택 누락, Escape가 모달 닫기 대신 편집 취소로 처리되는 진입 문제로 실패했다. 타입/선택/명시적 닫기 단계를 보완했으며 기대값은 유지했다.
- 검증: 모니터 두 종류의 앞면 화면 픽셀 표시·180도 뒷면 숨김·0도 복원 E2E 통과. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/75 tests·도구 3 tests·build·Playwright 25 tests). 로그 `.bugri-hooks/monitor-screens-verify-final.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-TRIAL-EXISTING-ITEMS 미리보기에서 기존 상품 임시 편집

- 상태: IN_PROGRESS. 장착해보기에서 기존 책상/상품도 이동·회전할 수 있게 한다. 같은 카테고리의 기존 상품과 추가 상품을 개별 선택하고, 기존 상품 변경은 모달 로컬 상태에만 유지한다. 실제 장착은 추가 대상만 저장한다. 닫기/다시 열기/내 데스크 복원과 API 저장 격리를 검증한다.
- 추가 요청: 모달 아래 상품별 선택 버튼을 제거하고 초기화만 표시한다. 초기화는 기존/추가 상품의 로컬 배치와 시점을 처음 상태로 복원하며 API를 호출하지 않는다. 키보드 사용자는 Canvas Home/PageDown/PageUp으로 선택한다.
- 구현: 기존 공간과 추가 상품에 별도 로컬 편집기를 사용하고 선택 맵에 추가 상품 식별자를 분리했다. 기존/추가 상품이 같은 카테고리여도 개별 드래그·회전한다. 실제 장착은 추가 상품 편집기만 참조하여 기존 상품 변경을 저장하지 않는다. 기본 책상도 임시 편집 가능하다. 초기화는 편집 초안·로컬 배치·선택·카메라를 초기 상태로 되돌린다. 키보드 선택은 캔버스에 통합했다.
- TDD/실패 분석: 기존 아이템 드래그 E2E 2개와 초기화 버튼 단위 검사의 미구현 실패 확인. 이후 테스트의 React Testing Library 조회에 Playwright 전용 exact 옵션을 넣어 타입 검사가 실패한 부분을 바로잡았다. 기대값을 약화하지 않았다.
- 검증: 관련 단위 17개·E2E 7개 통과. PC/모바일에서 기존·추가 상품 개별 이동과 선택 유지, 닫기/재열기 원상복원, 초기화 후 두 배치 복원, 선택 버튼 부재 확인. 단위 검사에서 기존 상품/기본 책상 변경의 API 미호출과 실제 장착 시 추가 상품만 저장하는 것을 확인했다. 실제 모바일 화면에서 초기화만 표시되는 것 확인.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/77 tests·도구 3 tests·build·Playwright 25 tests). 로그 `.bugri-hooks/trial-existing-reset-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-SHOP-DESK-SELECTION 상점 이웃 제거 및 책상 선택 수정

- 상태: IN_PROGRESS. 상점에서 이웃의 데스크 섹션과 헤더 이웃 링크를 제거한다. 내 공간의 이웃 탐색은 유지한다. 책상 선택이 전체 공간처럼 작동하는 원인을 확인한다.
- 확인: 사용자가 책상을 움직일 때 다른 아이템도 따라 움직이는 동작을 지적했다. 장착해보기에서 기존 책상과 상품을 독립 이동/회전하도록 하며, 소품·추가 상품·버그리의 초기 좌표 기준을 고정한다. 저장 계약과 내 데스크의 그룹 이동은 유지한다.
- TDD: PC/모바일에서 책상 드래그 시 기존/추가 키보드 픽셀이 함께 이동하는 미구현 실패 확인. 수정 후 드래그 중 및 책상 90도 회전 후 소품/버그리 화면 좌표 유지, 초기화와 내 데스크 저장 배치 보존을 검증한다.
- 구현: 장착해보기의 상품/버그리 레이어에 고정된 초기 책상 좌표계를 적용하여 책상 부모의 이동·회전을 상쇄한다. 저장 데이터는 변경하지 않는다. 상점의 이웃 영역/메뉴는 제거하고 내 공간의 이웃은 유지한다.
- 실패 분석: 모바일에서 회전 후 임의의 중간 색상 픽셀을 고르는 측정값이 2px 달라졌다. 실제 외곽선은 1px 이내였으며 역회전의 안티앨리어싱으로 픽셀 집합이 달라진 것이었다. 위치 측정을 네 외곽선 비교로 바로잡고 1px 허용치는 유지했다.
- 검증: 상점 단위 7개, 관련 기존 E2E 5개와 최종 독립 이동 E2E 2개 통과. Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/77 tests·도구 3 tests·build·Playwright 27 tests). 로그 `.bugri-hooks/shop-desk-selection-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-ROOM-THEME-BUGRI 공간 전체 테마와 버그리 배치

- 상태: IN_PROGRESS. 정원/달빛 배경을 캔버스 전체 분위기·입체 공간·상품 조명에 적용한다. 버그리는 별도 구매 없이 선택·이동·회전할 수 있게 하고 내 공간에서는 사용자별 저장/공개 복원, 장착해보기에서는 임시 편집/초기화를 제공한다. 기존 구매/상품 배치는 유지한다.
- 구현: 전체 Canvas 그라데이션·확장된 입체 방/아치 창/러그·가구/버그리 조명을 테마별로 적용했다. 방은 가구 뒤 레이어에 유지하고 회전 시 벽의 뒷면을 숨긴다. 버그리는 상품과 구분한 SpatialTarget으로 픽셀 선택·이동·회전·높이 조절하며 `transformBugri`/`PUT /me/desk/bugri`로 현재 사용자 `transforms.BUGRI`를 저장한다. 미리보기는 로컬 초안만 바꾸고 초기화/닫기에서 복원한다. 기존 스냅샷은 기본 버그리 좌표로 호환한다.
- 실패 분석: 버그리 저장 API 미구현 단위 실패 확인 후 구현. 공간 선택 대상 타입을 확장하는 과정의 타입 불일치를 수정했다. 새 API 추가로 기존 endpoint 개수 기대값을 32→33으로 갱신했다. 테마 복원 E2E는 로딩 중 교체되는 요소를 즉시 읽어 빈 스타일을 받았으므로 실제 테마 복원까지 기다리도록 수정했다. 첫 전체 verify의 API 코드/테스트 빈 줄 lint 오류를 수정했으며 검사를 약화하지 않았다.
- 검증: 관련 단위 31개·E2E 7개 통과. 버그리 구매 없이 저장, 사용자 격리/공개 복원, 잘못된 변환 거부 및 저장값 보존, HTTP 계약, 미리보기 미저장/초기화, 테마별 전체 색감/시점 회전/장착/새로고침/공개 복원 확인. PC·모바일 실제 테마 화면 확인.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/80 tests·도구 3 tests·build·Playwright 31 tests). 로그 `.bugri-hooks/room-bugri-verify-final.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-TRIAL-WHEEL-ZOOM 장착해보기 휠 확대/축소

- 상태: IN_PROGRESS. 미리보기 Canvas 위 마우스 휠로 확대/축소하며 비율은 0.5~2.5로 제한한다. 배치 좌표는 바꾸지 않고 확대 상태의 이동·선택·회전을 유지한다. 초기화/재열기는 기본 배율로 복원하며 Canvas 밖의 페이지 스크롤은 유지한다.
- 검증: 미구현 E2E 2개 실패 확인 후 PC/모바일 확대·축소·상한/하한·확대 상태 드래그·초기화/재열기 복원 및 기존 미리보기 E2E 4개 통과. Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/80 tests·도구 3 tests·build·Playwright 33 tests). 로그 `.bugri-hooks/trial-zoom-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-ITEM-LAYER-MENU 선택 아이템 겹침 순서 메뉴

- 상태: IN_PROGRESS. 자동으로 선택 대상을 맨 앞으로 옮기는 대신 선택 테두리 옆 … 메뉴에서 앞으로/뒤로 한 단계, 맨 앞/맨 뒤를 명시적으로 선택한다. 높이·좌표와 별개인 그리기 순서를 사용하며 내 공간은 저장/공개 복원, 미리보기는 기존 아이템 순서를 임시로만 변경한다. 상품 장착 시 추가 상품의 순서만 적용한다.
- 구현: 선택 테두리 옆 작은 … 드롭다운과 네 가지 순서 변경, 방향키 탐색/Escape 닫기/포커스 복원을 제공한다. 버그리를 포함한 오브젝트별 3D 그림과 선택 판정을 동일 순서로 합성한다. 완전히 가려진 아이템도 키보드로 선택하면 순서 메뉴를 사용할 수 있다. `PUT /me/desk/order`는 사용자별 유효한 전체 순서를 저장하고 기존 데이터는 빈 순서(기존 깊이 표현)로 호환한다. 미리보기의 기존 아이템 편집은 저장하지 않는다.
- 실패 분석: 공통 Button이 ref prop을 지원하지 않아 타입 검사에서 발견된 연결을 이벤트의 currentTarget으로 수정했다. 가려진 아이템의 조작 UI를 숨기던 기존 높이 E2E 기대값은 새 메뉴 접근 요구사항에 맞게 변경했다. 책상 아래 키보드 픽셀이 가려지는 검증은 유지했다. 수정 전 테스트를 읽은 실행의 실패 이후 최신 소스로 재실행해 통과했다.
- 검증: 관련 단위 75개·E2E 5개 통과. PC/모바일 네 가지 순서 변경, 버그리를 책상으로 드래그, 새로고침/공개 복원, 미리보기 초기화/미저장, 저장 실패 재시도, 사용자 격리/잘못된 순서 거부를 확인했다. 모바일 메뉴 화면도 확인했다.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 15 suites/85 tests·도구 3 tests·build·Playwright 35 tests). 로그 `.bugri-hooks/desk-layer-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-BUGRI-TABLE-SNAP 버그리 상판 드롭

- 상태: IN_PROGRESS. REQ-09/AC-09g의 버그리 드래그에 상판 드롭을 추가한다. 포인터를 현재 책상 상판에 놓으면 실제 x/y/z를 표면에 맞추며 카메라 회전 후에도 접촉을 유지한다. 책상 밖 이동, 수동 겹침 순서, 미리보기 미저장과 초기화는 유지한다. 순수 좌표 변환 단위 테스트와 PC/모바일 드롭·시점 회전·저장 복원 E2E 후 전체 verify를 수행한다.
- 구현: 버그리 이동 드롭에서 상판 평면과 포인터의 교점을 구하고 현재 책상 로컬 범위 내인지 검사한다. 발 여백을 둔 위치를 고정된 아이템 좌표계로 변환해 높이 1.55와 함께 기존 저장/임시 편집 경로로 전달한다. 범위 밖·취소·회전·단순 클릭은 자동 높이 맞춤 대상이 아니다. API/저장 형식과 수동 겹침 순서는 유지한다.
- 실패 분석: 미구현 단위 3개와 E2E 4개에서 기대한 상판 좌표/높이 불일치를 확인했다. 테스트용 함수 부재로 첫 E2E 빌드가 막혀 타입이 있는 미구현 함수를 먼저 둔 뒤 실제 동작 실패를 확인했다. 구현 후 PC 기본 화면/모바일 확대에서 실패한 원인은 Illustration의 중심 이동이 모델 좌표여서 배율을 제거한 뒤 빼야 하는데 역순으로 계산한 것이었다. 역투영을 수정했고 기대값·검사를 약화하지 않았다.
- 관련 검증: 단위 3개와 E2E 10개 통과. 이동·회전된 책상과 고정 아이템 좌표계 변환, 상판 밖/가장자리 처리, PC/모바일 상판 드롭·카메라 회전·저장/공개 복원·확대 상태·초기화/미저장을 확인했다. 45도/135도 실제 Canvas 화면에서 발의 상판 접촉을 확인했다. 전체 검증에는 드래그 취소 후 원래 위치 유지도 추가했다.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 16 suites/88 tests·도구 3 tests·build·Playwright 39 tests). 로그 `.bugri-hooks/bugri-tabletop-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-DESK-DRAG-REPAIR 미리보기 발 기준 배치와 상하 시점

- 상태: IN_PROGRESS. 사용자가 /shop 장착해보기의 원래 책상에서 재현한 문제를 수정한다. 이전 스냅은 포인터가 상판에 닿는 드롭만 검사해 발 기준 배치를 놓쳤고 이동 중 결과를 표시하지 않았다. 발 기준 드래그/실시간 상판 배치와 취소를 검증한다. 빈 공간의 수직 드래그는 기존 10~85도 범위에서 동작하지만 아래쪽 시점이 제한됨을 확인했으므로 아래쪽까지 회전하도록 확장한다. REQ-09/AC-09e, 저장·초기화·겹침 메뉴 계약은 유지한다.
- 구현: Zdog가 투영한 발 원점과 잡은 지점의 간격을 드래그 시작 시 저장하고 이동 중 발 위치를 상판으로 역투영한다. 발 접촉 반경 0.4 안에서 상판과 닿으면 발 여백을 확보한 위치/높이를 초안에 즉시 반영한다. 직접 포인터 드롭도 유지하며 취소 시 복원한다. 카메라 pitch를 -85~85도로 확장하고 아래쪽에서 상판 가림 순서를 역전한다. 정면 부근 이동은 0 나눗셈을 방지하고 정면/아래에서는 상판 스냅을 하지 않는다. 높낮이 각도는 스크린리더 상태로 제공한다.
- 재현/실패 분석: 수정 전 PC/모바일 발 기준 실시간 배치 2개와 수직 드래그로 상판 아래를 보는 2개 E2E 실패 및 정면 스냅 단위 실패를 확인했다. 구현 후 모바일에서 발 끝은 닿았지만 원점이 상판 바깥인 가장자리 사례가 남아 관련 E2E와 첫 전체 verify에서 실패했다(나머지 42개 통과). 실제 모바일 Canvas로 원인을 확인해 발의 접촉 반경을 포함하도록 수정했으며 기존 직접 포인터 범위/상판 밖 자유 배치 검사는 유지했다.
- 관련 검증: 단위 26개·E2E 9개 통과. PC/모바일 발 기준 드래그 중 높이 적용, 드롭 후 상하/좌우 시점 변경과 위치 유지, 원래 책상의 이동/회전·확대 상태, 취소·초기화·저장/공개 복원, -54도 아래쪽 상판 픽셀 및 85도 위쪽 시점/초기화 복원을 확인했다. 모바일 실제 화면도 확인했다. E2E 3107 시작 충돌은 wrapper가 3108로 자동 재시도했으며 다른 서버는 종료하지 않았다.
- 검증 보완: 실제 모바일 화면 재현용으로 만든 `.bugri-hooks/inspect-foot.cjs`가 ESLint 검색에 포함되어 require 규칙으로 전체 검증이 중단됐다. 일회성 재현 스크립트를 삭제하고 검증을 다시 실행했다. lint 설정이나 규칙은 변경하지 않았다.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 16 suites/90 tests·도구 3 tests·build·Playwright 43 tests). 로그 `.bugri-hooks/foot-orbit-verify-final.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-ITEM-SURFACE-SNAP 모든 탁상 아이템 공통 접점 배치

- 상태: IN_PROGRESS. REQ-09/AC-09e. 버그리로 한정한 상판 스냅을 키보드·모니터·소품의 기존/미리보기 앵커에 공통 적용한다. 모델 바닥 원점을 유지하고 카테고리별 받침 크기와 회전까지 고려해 상판 안에 지지되도록 한다. 책상은 바닥 이동, 배경은 환경이라는 기존 계약을 유지한다. 모니터를 포함한 PC/모바일 실시간 드래그·취소·시점 회전·명시적 저장/미리보기 미저장 E2E와 순수 함수 테스트 후 전체 검증을 수행한다.
- 구현: 버그리 전용 조건을 제거하고 키보드·모니터·소품·버그리의 바닥 원점을 공통 접점으로 사용한다. 추가 아이템은 previewAnchor, 기존 아이템은 카테고리 앵커를 참조한다. 순수 상판 변환은 대상 카테고리를 명시적으로 받고 받침 반폭/반깊이를 책상 대비 회전한 범위로 접촉·가장자리 지지를 계산한다. 기존 저장 API와 미리보기 로컬 초안 경로를 그대로 사용한다.
- 재현/실패 분석: 수정 전 카테고리별 받침 범위 단위 4개와 PC/모바일 세 상품 E2E 6개가 실제 기대값 불일치로 실패했다(기존 버그리 단위 5개는 통과). 구현 중 테스트 요청에 category를 중복 지정한 타입 오류를 수정했다. 기대 높이·저장값·검사를 약화하지 않았다.
- 관련 검증: 상점 단위 30개·E2E 12개 통과. 세 상품의 바닥 높이→상판 드래그 중 반영, 취소/재드롭, 시점 회전 후 배치 유지, 기존 모니터의 임시 재배치 미저장, 신규 모니터 명시적 장착/새로고침 복원, 초기화, 책상 밖 자유 배치 및 버그리/높이 회귀를 확인했다. 실제 모니터 Canvas의 45도/135도 화면에서 받침 접촉을 확인했다.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 16 suites/94 tests·도구 3 tests·build·Playwright 49 tests). 로그 `.bugri-hooks/item-surface-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-CAMERA-DRAG-DIRECTION 공간 좌우 드래그 방향

- 상태: IN_PROGRESS. REQ-09/AC-09e. 공간을 잡아 끄는 방향과 반대로 보이던 수평 시점 회전 부호를 수정한다. PC/모바일에서 정면의 실제 오브젝트 픽셀 이동과 상점 좌우 왕복·상하 각도/배치 보존을 검증한다.
- 구현: 수평 카메라 입력을 `yaw + dx`에서 `yaw - dx`로 바꿔 장면의 가까운 쪽이 포인터를 따라 회전하도록 했다. 상하 각도·배치 좌표·아이템 자체 회전 계산은 변경하지 않는다.
- 재현: 수정 전 PC/모바일 정면의 실제 버그리 픽셀이 왼쪽 드래그 후 오른쪽으로 이동해 신규 E2E 2개가 실패했다. 각도 문자열뿐 아니라 실제 화면상 이동 방향을 검사한다. 내 공간·공개 공간·상점 미리보기 모두 같은 렌더러를 검증한다.
- 관련 검증: 신규 방향 E2E 2개와 상하 회전/아이템 상판 배치 회귀를 포함한 E2E 12개 통과. 좌우 왕복, 실제 앞쪽 픽셀 이동, 상하 각도 및 배치 좌표 보존을 확인했다. 기존 모니터·키보드·소품·버그리의 배치와 상하 회전도 통과했다.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 16 suites/94 tests·도구 3 tests·build·Playwright 51 tests). 로그 `.bugri-hooks/camera-direction-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-TRIAL-ZOOM-REPAIR 조작 후 확대 입력 누락

- 상태: IN_PROGRESS. REQ-09/AC-09e. /shop 장착해보기에서 아이템 조작 후 커서가 회전/메뉴 DOM 위에 남으면 Canvas에만 연결된 wheel 핸들러가 입력을 받지 못하는 문제를 재현했다. 실제 휠로 Canvas 선택 테두리 너비는 86→121로 늘었으나 회전 버튼 위에서는 121로 멈췄다. 공간 뷰포트와 선택 조작 레이어를 같은 wheel 입력 범위로 연결하고 영역 밖 스크롤, 배율 제한, 미리보기 배치/초기화를 유지한다.
- 구현: ThreeView의 공간/선택 오버레이 공통 부모를 명시적 interactionSurface로 엔진에 전달하고 wheel 리스너를 그 영역에 연결한다. Canvas 렌더링·포인터 드래그는 기존 요소를 유지하며 해제 시 동일한 영역에서 리스너를 제거한다. 입력이 영역 밖으로 나가면 기본 스크롤을 유지한다.
- 재현/관련 검증: 수정 전 기존 Canvas 확대 E2E 2개는 통과했지만 조작 후 회전 버튼 위 확대 E2E 2개는 PC/모바일 모두 실패했다. 수정 후 관련 E2E 8개 통과. 실제 회전 드래그 뒤 휠 확대, 메뉴 위 축소, ctrlKey wheel 형태의 트랙패드 확대 입력, 배치 좌표/각도 보존, 모달 스크롤 유지, 영역 밖 wheel 미차단, 초기화 및 기존 배율 상한/하한을 확인했다. TypeScript 통과.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 16 suites/94 tests·도구 3 tests·build·Playwright 53 tests). 로그 `.bugri-hooks/zoom-controls-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-STABLE-PLACEMENT-VIEW 높이/배치 변경 후 시점 축소 방지

- 상태: IN_PROGRESS. REQ-09/AC-09e. 사용자가 설명한 실제 현상은 높이/위치 변경 뒤 자동 맞춤 범위가 다시 계산되면서 전체 장면이 축소되는 것이다. 배치 초안·드롭·저장 재조회에서는 현재 프레이밍 기준을 유지하고, 최초 열기/상품 구성 변경/초기화에서만 기준을 다시 잡는다. 휠 확대와 창 크기/시점 대응은 유지한다. 고정 책상 픽셀의 크기와 위치를 이동 중/드롭 후 비교하는 PC/모바일 E2E로 검증한다.
- 구현: 프레이밍의 radius/height/center 계산을 배치 렌더링과 분리했다. 책상/키보드/모니터/소품/미리보기 상품 구성 키가 바뀔 때만 범위를 계산하며 transforms·선택·저장 재조회는 무시한다. 실제 줌은 기존 사용자 배율과 이 기준 범위로 계산해 높이/드롭에 의해 전체 장면이 다시 맞춰지지 않는다. 초기화/재열기와 실제 상품 구성 변경은 새 범위를 사용한다.
- 재현/관련 검증: 수정 전 PC/모바일 고정 책상 픽셀 경계가 배치 변경 후 각각 최대 10px/5px 이동해 신규 E2E 2개가 실패했다. 수정 후 관련 E2E 13개 통과. 확대 상태의 높이/위치 편집, 바닥→상판 드래그 도중/드롭 뒤 크기·화면 중심 유지, 멀리 드래그한 뒤 유지, 휠 축소와 초기화 복원, 기존 상품·버그리 배치 및 조작 영역 휠을 확인했다. 전체 검증에 모니터 높이만 1.55→2.55로 올려도 책상 경계가 변하지 않는 검사도 포함했다.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 16 suites/94 tests·도구 3 tests·build·Playwright 55 tests). 로그 `.bugri-hooks/stable-view-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

## P08-FRONT-HEIGHT-DRAG 정면 아이템 드래그

- 상태: IN_PROGRESS. REQ-09/AC-09e. /shop 정면에서 키보드를 아래로 끌면 높이는 1.55에 고정되고 깊이만 크게 변하는 문제를 PC/모바일 E2E로 재현했다. 정면 부근 ±20도에서는 책상을 제외한 아이템의 깊이를 유지하고 세로 드래그로 높이를 변경한다. 상판 스냅은 이 구간에서 생략하며 기존 위쪽 시점의 평면 이동은 유지한다. 관련 및 전체 검증 예정.

- 검증: 수정 전 신규 PC/모바일 E2E 2개가 높이 1.55 고정으로 실패했고 수정 후 관련 E2E 10개 통과. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 94개·도구 3개·build·E2E 57개). 정면 드래그 중 높이 감소·X/Z 유지·바닥 제한·시점 회전 후 좌표 보존 및 기존 상판/확대 회귀를 확인했다. 로그 `.bugri-hooks/front-height-verify.log`. 상태는 IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.
