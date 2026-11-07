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
| P05 | 퀴즈 풀이 UX | DONE | P04 (기존 Mock API로 독립 구현) | 홈 직접 풀이·4형식·정답 비노출·결과 복원·새 Attempt 재도전·버그리 정오/완료 표정. 학습자 3종 예시 구독과 기존 데이터 보완. Node 22.23.3 / PLAYWRIGHT_PORT=3125 전체 verify 통과(Jest 68개·E2E 15개). 탐색 전환의 입력 경합 및 테스트 타입/선택자 오류 수정 후 통과. 구현자 외 리뷰 대기 |
| P06   | 구독 3종·탐색                         | TODO        | P04                      | 사람·사람+태그·전체 작성자+태그 구독, 더미 개발자·해시태그 탐색. 구독 피드 없음                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| P07 | 학습 태그·연속 풀이 | IN_PROGRESS | P05, P06, P02T | 구독 기반 한 문제·단일 태그·다음 문제·소진/빈 상태·다시 풀기를 기존 API에 연결. 빈 상태는 /discover 전용 탐색 페이지로 이동. 공통 밑줄 탭·키보드 전환·개발자/태그 검색·20개 단위 API 페이지 조회·URL 복원·구독 후 탐색 조건 유지·여러 항목 연속 추가·별도 학습 이동(AC-12i). 1,000명/1,000개 fixture 페이지 처리 및 전체 verify 통과(Jest 68개·E2E 15개). 전체 구독 관리(P06)·시간대 설정(P02T) 화면 통합과 구현자 외 리뷰는 남음 |
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

### P06-DEVELOPER-QUIZZES — 개발자별 공개 퀴즈·태그

- 상태: IN_PROGRESS. 사용자 요청 및 AC-12j에 따라 탐색 이름 링크, 개발자 공개 퀴즈·태그 페이지, 태그 필터·검색·페이지 조회, PERSON/PERSON_HASHTAG 구독 후 화면 유지, 기존 직접 풀이 연결을 구현한다.
- 작성자 CRUD와 전체 개인 프로필/데스크는 범위 밖이다. 공개 목록 민감 정보 제외·상태 필터·대량 페이지 처리 단위 테스트를 먼저 실패 확인 후 구현했다.
- 구현·필수 검증 완료, 구현자 외 리뷰 대기로 IN_PROGRESS를 유지한다. Node v22.23.3에서 관련 API/UI 테스트와 전체 Hook verify 통과: lint·TypeScript·Jest 14 suites/73 tests·production build·Playwright 17 tests. 초기 lint 구조 분해 오류와 UI 테스트 타입 오류를 수정한 후 전체 통과했다. 근거: .bugri-hooks/verify-2.log.
- 3002 개발 서버에서 데스크톱·390px 모바일 화면 확인, 가로 넘침 없음. 구독 후 현재 페이지 유지 및 새로고침 복원·직접 풀이 이동, 비공개/삭제/검토 중 제외·1,000개 퀴즈 페이지 처리·빈/없는 개발자 상태를 검증했다. push/PR/merge는 수행하지 않는다.

### P00UI-HOME-LINK — 풀이 워크스페이스 로고 홈 이동

- 상태: IN_PROGRESS. 3002 공통 헤더 로고를 홈(/)으로 연결한다. 탐색·직접 풀이·개발자 페이지에서 홈 이동 및 기존 UI 전시 흐름을 검증한다. 3000/3001 워크스페이스는 변경하지 않는다.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 PLAYWRIGHT_PORT=3125 npm run verify 통과(lint·TypeScript·Jest 73개·build·Playwright 18개). 홈의 자동 학습 쿼리 때문에 URL 전체 일치 검사가 실패하여 요구사항에 맞게 pathname=/ 검증으로 수정 후 전체 통과했다. 근거: /tmp/bugri-3002-home-verify.log.

### P07-TAG-DROPDOWN — 학습 태그 공통 드롭다운

- 상태: IN_PROGRESS. 3002 학습 태그의 native select를 공통 Dropdown으로 교체한다. 기존 CRUD 공통 Dropdown·훅·접근성 테스트를 가져오되 다른 워크스페이스는 수정하지 않는다. 햄버거 메뉴의 둥근 패널·선택 강조 스타일을 사용하고 필터·URL·구독 정책은 유지한다.
- 검증: 공통 드롭다운 선택·키보드·닫기·비활성 단위 테스트, 기존 태그 필터/복원 흐름 및 모바일 E2E, 전체 verify.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 공통 Dropdown 단위 3개 및 최종 PLAYWRIGHT_PORT=3125 npm run verify 통과(lint·TypeScript·Jest 76개·production build·Playwright 19개). 초기 모바일 키보드 테스트가 실제 태그 순서보다 한 칸 덜 이동하여 실패한 것을 수정 후 전체 통과했다.
- 3002의 390px 모바일에서 열린 메뉴 캡처와 가로 넘침 없음을 확인했다. Escape·바깥 클릭 닫기·방향키 선택, 태그별 출제·새로고침 복원·구독 미변경을 검증했다. 근거: /tmp/bugri-tag-dropdown-verify.log.

### P05-MULTIPLE-CHOICE-LAYOUT — 복수 선택 답안 배치
- 상태: IN_PROGRESS. 일반 폼용 inline 체크박스로 인해 선택지가 붙어 보이는 문제를 공통 Checkbox의 choice variant로 해결한다. 한 선택지당 카드 한 줄, 선택 강조를 제공하고 복수 선택 안내를 한 줄로 합친다. 기존 선택·해제·제출 규칙은 유지한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 관련 UI/풀이 단위 6개, 최종 PLAYWRIGHT_PORT=3125 npm run verify 통과(lint·TypeScript·Jest 76개·build·Playwright 19개). 390px 모바일에서 각 선택지가 폭 312px·높이 47.5px의 별도 행으로 표시되고 선택 강조되는 것을 확인했다.
- 첫 E2E 및 개별 재검사에서 결과 교체 후 기존 마우스 위치가 완료 버튼 hover 가장자리에 남아 stability 시간 초과가 재현됐다. 결과 확인 후 마우스를 이동하고 일반 클릭하도록 조정했다(강제 클릭·검사 생략 없음). 전체 재검증 통과. 근거: /tmp/bugri-answer-layout-verify.log.

### P05-RESULT-ACTIONS — 결과 버튼 가로 배치
- 상태: IN_PROGRESS. 다시 풀기·다음 문제를 같은 flex 행에 배치한다. 직접 풀이 및 이용 불가 퀴즈의 기존 버튼 표시 조건은 유지한다. 기존 재도전·다음 문제 E2E와 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 PLAYWRIGHT_PORT=3125 npm run verify 통과(lint·TypeScript·Jest 76개·build·Playwright 19개). 3002의 390px 모바일에서 두 버튼 y=890 동일 행 배치를 실제 브라우저로 확인했다. 근거: /tmp/bugri-result-actions-verify.log.

### UI-ACTIONS-RIGHT — 제품 화면 동작 버튼 오른쪽 정렬
- 상태: IN_PROGRESS. 3002의 풀이 제출·결과·오류/빈 상태, 탐색 구독·학습·페이지 이동, 개발자 페이지 구독·오류·페이지 이동 버튼을 오른쪽 정렬한다. 답안 선택지·필터·탭 같은 입력 요소 및 UI 전시는 범위 밖이다. 기존 동작 테스트와 모바일 배치를 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 PLAYWRIGHT_PORT=3125 npm run verify 종료 코드 0(lint·TypeScript·Jest 76개·build·Playwright 19개). 3002의 390px 모바일에서 제출 및 다음 문제 버튼 오른쪽 끝 x=351 일치·가로 넘침 없음을 확인했다.

### P06-DEVELOPER-TAGS-TOP — 개발자 태그 상단 배치

- 상태: IN_PROGRESS. 개발자 공개 퀴즈 페이지의 태그 검색·선택·구독 영역을 사이드바에서 페이지 상단 전체 너비로 옮기고 공개 퀴즈 목록을 그 아래에 배치한다. 태그는 반응형 1·2·3열 카드로 표시하며 기존 검색·필터·구독·URL 복원 정책은 유지한다.
- 기존 좌우 배치에서 실패하는 영역 순서·동일 너비 E2E를 먼저 확인했다. 관련 개발자 흐름과 데스크톱·모바일 배치 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 개발자 E2E 2개와 최종 Hook verify 통과(lint·TypeScript·Jest 15 suites/76 tests·production build·Playwright 19 tests). 3002 데스크톱·390px 모바일에서 태그 영역이 공개 퀴즈 위에 같은 너비로 배치되고 가로 넘침이 없음을 확인했다. 근거: `.bugri-hooks/verify-1.log`.

### P06-DEVELOPER-TAGS-COMPACT — 개발자 태그 영역 압축

- 상태: IN_PROGRESS. 태그 글자 크기는 유지하고 컨테이너 패딩·요소 간격·태그 카드 패딩을 줄인다. 태그가 한 페이지뿐이면 무의미한 페이지 이동 행을 숨기며, 10개를 넘으면 기존 페이지 이동을 표시한다.
- 기존 3개 태그 컨테이너 높이 318px 및 단일 페이지 이동 노출로 실패하는 E2E를 먼저 확인했다. 데스크톱 높이 260px 미만, 모바일 가로 넘침, 검색·필터·구독 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. 글자 크기 변경 없이 데스크톱 태그 영역을 318px에서 218.5px로 줄였고 390px 모바일은 338.5px·가로 넘침 없음으로 확인했다. Node v22.23.3에서 개발자 E2E 2개와 최종 Hook verify 통과(lint·TypeScript·Jest 15 suites/76 tests·production build·Playwright 19 tests). 근거: `.bugri-hooks/verify-1.log`.

### P06-DEVELOPER-TAG-CHIPS — 개별 태그 칩 압축

- 상태: IN_PROGRESS. 개별 태그를 균등 3열 카드에서 내용 너비만 차지하는 둥근 칩으로 바꾼다. 태그명·개수·구독 상태 글자 크기와 필터·구독 동작은 유지하고, 칩은 필요한 만큼 한 줄에 배치한 뒤 넘치면 줄바꿈한다.
- 기존 태그 카드가 각 250px 이상을 차지해 실패하는 데스크톱 E2E를 먼저 확인했다. 각 칩 250px 미만·동일 행 배치, 모바일 줄바꿈·가로 넘침 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. 글자 크기를 유지하면서 개별 칩을 높이 32px, 너비 139~182px로 줄였고 데스크톱 한 줄 배치·390px 모바일 줄바꿈·가로 넘침 없음을 확인했다. Node v22.23.3에서 개발자 E2E 2개와 최종 Hook verify 통과(lint·TypeScript·Jest 15 suites/76 tests·production build·Playwright 19 tests). 근거: `.bugri-hooks/verify-1.log`.

### P06-DEVELOPER-TAG-STATE — 태그 hover·구독 상태 정리

- 상태: IN_PROGRESS. 태그명 hover 밑줄을 제거하고 구독 완료 텍스트는 체크 아이콘으로 바꾼다. 구독 전 동작 문구와 선택 태그 표시는 유지하며, 체크 아이콘 버튼의 접근성 이름은 기존 “개발자명·태그명·구독 중”을 유지한다.
- hover 시 실제 text-decoration과 구독 후 빈 시각 텍스트를 검증하는 E2E를 먼저 실패 확인했다. 구독·새로고침 복원, 데스크톱·모바일 표시 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. 태그 hover의 실제 `text-decoration` 제거와 구독 후 시각 텍스트 없음·접근성 이름·체크 아이콘 상태 및 새로고침 복원을 개발자 E2E로 확인했다. Node v22.23.3에서 개발자 E2E 2개와 최종 Hook verify 통과(lint·TypeScript·Jest 15 suites/76 tests·production build·Playwright 19 tests). 근거: `.bugri-hooks/verify-1.log`.

### 풀이·탐색 UX 검토 반영

- 상태: DONE. 완료 결과의 별도 ‘완료 확인’을 제거하고 ‘다음 문제’를 주 행동, ‘다시 풀기’를 보조 행동으로 표시한다.
- 구독된 개발자·태그는 같은 위치에서 해제할 수 있으며, 단일 페이지의 페이지 이동 컨트롤은 숨긴다.
- 개발자 페이지는 선택 태그를 채운 칩으로 표시하고 원시 태그 ID 안내 문구를 노출하지 않는다.
- 미제출 답안이 있는 상태에서 학습 태그를 바꾸면 답안 소실 경고를 표시한다.
- Node v22.23.3에서 관련 단위 테스트 11개와 풀이·개발자 E2E 15개를 통과했다. 최종 Hook verify도 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P05-RESULT-NO-BUGRI — 풀이 결과 캐릭터 제거

- 상태: DONE. 풀이 결과 화면에서 버그리 이미지와 반응 문구를 제거하고 정오·답안·해설·다음 행동만 유지한다. 공통 캐릭터 컴포넌트와 다른 화면의 사용은 변경하지 않는다.
- Node v22.23.3에서 정답·오답 관련 E2E 2개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P06-TAG-SUBSCRIPTION-MENU — 태그 구독 메뉴

- 상태: DONE. 개발자 페이지의 태그 칩은 필터 선택에 집중시키고, 우측 말줄임표 메뉴에서 현재 상태에 맞는 구독 또는 구독 해제를 제공한다. 검색 결과의 명시적 구독 버튼은 유지한다.
- 말줄임표를 세 점 SVG로 중앙 정렬하고 메뉴 열기·구독·새로고침 복원·Escape 닫기를 검증했다. Node v22.23.3에서 관련 단위 테스트 1개·개발자 E2E 2개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P06-TAG-SEARCH-ALIGNMENT — 태그 검색 상태·정렬

- 상태: DONE. 태그 필터 전환 중 검색 입력이 비활성화되어 어두워지는 현상을 제거하고 검색 입력과 검색 버튼의 상단 y좌표를 맞춘다. 구독 저장 중 중복 동작 방지는 유지한다.
- 전환 중 검색 입력에 disabled 속성이 생기지 않고 입력·버튼 상단 좌표 차이가 1px 미만인지 E2E로 검증했다. Node v22.23.3에서 관련 개발자 E2E 1개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P06-TAG-SUBSCRIBED-STATE — 태그 구독 배경 구분

- 상태: DONE. 개발자 페이지에서 구독한 태그와 구독하지 않은 태그의 칩 배경색을 구분한다. 선택 상태는 별도 링으로 표시해 구독 상태와 동시에 식별할 수 있게 한다.
- 구독 전후 실제 계산된 배경색 변경과 선택 링을 E2E로 검증했다. Node v22.23.3에서 관련 개발자 E2E 1개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P06-TAG-THEME-COLOR — 구독 태그 테마 색상

- 상태: DONE. 구독 태그의 배경·테두리와 선택 링을 브랜드 primary 계열로 통일하고, 미구독 태그의 중립 배경과 구분한다.
- 구독 전후 primary 배경색 변경과 선택 링을 E2E로 검증했다. Node v22.23.3에서 관련 개발자 E2E 1개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P06-SUBSCRIPTION-FEEDBACK — 구독 동작 노출·피드백

- 상태: DONE. 개발자 페이지의 미구독 태그는 말줄임표를 숨기고 구독 태그만 해제 메뉴를 제공한다. 태그·개발자 구독 변경 성공은 대상명이 포함된 토스트로 알린다. 개발자 구독 완료 후 상단 버튼은 숨기고 해당 위치의 구독 해제는 제거한다.
- 관련 단위 테스트 7개와 구독·해제 토스트, 미구독 메뉴 숨김, 개발자 구독 버튼 제거를 포함한 E2E 2개를 확인했다. Node v22.23.3에서 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P06-TAG-CLICK-SUBSCRIBE — 미구독 태그 클릭 구독

- 상태: DONE. 개발자 페이지의 미구독 태그를 클릭하면 해당 태그를 구독하면서 기존 퀴즈 필터도 적용하고 성공 토스트와 구독 상태 UI를 표시한다.
- 관련 단위 테스트 1개와 구독→해제→재구독 및 필터 유지 E2E 1개를 확인했다. Node v22.23.3에서 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### UI-POINTER-CURSORS — 상호작용 요소 포인터 커서

- 상태: DONE. 활성 링크·버튼·셀렉트·체크박스·라디오·연결 라벨·summary에 공통 포인터 커서를 적용하고 비활성 요소의 금지 커서는 유지한다.
- UI 전시 화면의 표시 중인 상호작용 요소를 계산된 cursor 값으로 전수 검사했다. Node v22.23.3에서 관련 E2E 1개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P07-NEXT-EXHAUSTION — 다음 문제 소진 처리

- 상태: DONE. 선택 태그의 미풀이 문제를 모두 완료하면 완료 문제를 다시 순환하지 않고 소진 상태와 태그 탐색만 제공한다. 재생 모드 결과에서도 다음 문제 대신 태그 탐색을 표시한다.
- 일반 학습 소진 시 Attempt 수가 늘지 않는 흐름과 재생 모드 결과에서 다음 문제를 숨기는 E2E를 포함해 관련 E2E 4개를 확인했다. Node v22.23.3에서 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P07-NEXT-DUPLICATE-QUIZ — 동일 문제 재출제 방지

- 상태: DONE. 다른 quizId로 저장된 동일 문제를 완료한 경우에도 다음 문제 후보에서 제외하고, 남은 고유 문제가 없으면 소진 상태와 태그 탐색을 제공한다.
- 다른 quizId에 같은 문제를 복제한 회귀 테스트를 추가해 첫 완료 직후 EXHAUSTED와 null quiz를 확인했다. 첫 전체 검증은 기존 E2E의 중복 출제 기대값 때문에 실패했고 요구사항에 맞게 갱신한 뒤 재검증했다. Node v22.23.3에서 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/79 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-2.log`.

### P07-NEXT-THEN-EXHAUSTED — 결과 후 소진 화면 전환

- 상태: DONE. 마지막 문제 결과에서도 바로 태그 탐색으로 바꾸지 않고 다음 문제를 유지한다. 다음 문제를 누른 뒤 남은 문제가 없을 때 소진 제목·안내·태그 탐색 화면으로 전환한다.
- 재생 모드도 다음 문제 요청 후 일반 미풀이 모드로 종료해 자동 재선택을 막고, 선택 태그 소진 안내의 제목·설명·태그 탐색을 E2E로 확인했다. Node v22.23.3에서 관련 API 단위 테스트 28개·풀이 E2E 2개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/79 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

### P07-DISCOVERY-SUBSCRIPTION-MENU — 탐색 카드 구독 해제 메뉴

- 상태: DONE. 개발자·태그 탐색 결과에서 구독 중인 카드의 큰 구독 해제 버튼을 제거하고, 카드 우측 말줄임표 메뉴 안에서 구독을 해제한다. 미구독 항목의 구독하기와 구독 항목의 학습하기는 유지한다.
- 개발자 카드의 메뉴 해제 단위 테스트와 개발자·태그 카드 메뉴 전환, Escape 닫기, 검색 조건 유지 E2E를 확인했다. Node v22.23.3에서 최종 `PLAYWRIGHT_PORT=3125 npm run verify`를 통과했다(lint·TypeScript·Jest 15 suites/79 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다.
