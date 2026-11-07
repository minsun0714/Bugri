# Bugri 개발 단계와 작업 계획

### FAVICON-BUGRI — 버그리 파비콘

- 상태: IN_PROGRESS. 공통 버그리 캐릭터의 보라색 외곽·연두색 몸·안테나·얼굴을 작은 크기에 맞게 단순화한 벡터 파비콘으로 기존 기본 아이콘을 교체한다.
- Next.js 16 App Router의 앱 아이콘 파일 규칙에 따라 루트 `app` 세그먼트에 적용하고, 16px·32px 렌더링과 production build 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 구현자 외 리뷰 대기로 IN_PROGRESS를 유지한다. Node v22.23.3에서 16px·32px·64px 렌더링과 production 응답의 SVG·ICO 아이콘 링크 및 MIME 유형을 확인했다. `PLAYWRIGHT_PORT=3295 npm run verify` 전체 통과(lint·TypeScript·Jest 27 suites/123 tests·production build·Playwright 34 tests).

## 1. 기준과 현재 상태

제품 요구사항은 [PRD.md](PRD.md), API·데이터 경계는 [ARCHITECTURE.md](ARCHITECTURE.md)를 따른다. 아래 TODO는 계획이며 구현 완료 근거가 아니다. 현재 저장소에는 Next.js 프로젝트 기반·초기 홈 화면과 API·Mock 서비스 계층이 있다. API 사용 계약은 [API.md](API.md)를 따른다. 새 기능 UI 연결은 별도 작업이다.

**현재는 1단계 Next.js 프로토타입**을 만든다. DB 연결·MySQL/Prisma/mysql2 설치·실제 JWT·Google OAuth2 구현은 하지 않는다. 2단계 Spring Boot에서 실제 REST API·인증·MySQL 영속성·구매 트랜잭션을 구현한다. 전체 제품 요구사항은 PRD에 남긴다.

## 2. 1단계 — Next.js 프로토타입

| ID | 작업 | 상태 | 선행 | 완료 기준 |
| --- | --- | --- | --- | --- |
| P00F | 공통 푸터 | DONE | P00UI 시안 | 로고·링크·맨 위 이동·모바일 줄바꿈 구현. lint·타입·단위 6개·개발 서버 E2E 2개 통과. 2593d0f에서 전체 verify 통과(단위 6개·E2E 2개·빌드) |
| P00TW | Tailwind 스타일링 전환 | DONE | P00UI 시안 | Tailwind v4·PostCSS·테마 토큰 적용, 컴포넌트 CSS 제거. Node 22에서 E2E_PORT=3101 npm run verify 통과(단위 6개·E2E 2개·lint·타입·빌드). 데스크톱·모바일 캡처 확인. 디자인 검토·임시 홈 복원은 P00UI에서 별도 진행 |
| P00UI | 공통 UI 컴포넌트·홈 전시 | IN_PROGRESS | P00 | 공통 UI·임시 홈 전시 구현. 해시태그 칩 입력(Enter 추가·개별 삭제·중복 방지·3개 제한), Markdown 작성·미리보기·코드 블록 삽입 적용. Node 22에서 E2E_PORT=3101 npm run verify 통과(단위 6개·E2E 2개), 모바일·모달 키보드 검증. 상단 헤더·모바일 햄버거 드롭다운 반영(선택 표시·Escape/바깥 클릭 닫기). 해당 변경 lint·타입·개발 서버 E2E 2개 통과; 이전 빌드 환경 오류 이후 2593d0f에서 전체 verify 재실행 통과. 기본 홈은 새 공통 헤더·모바일 메뉴·푸터를 유지하고 본문 전시만 숨김. 전시는 BUGRI_UI_PREVIEW=1 로컬·테스트에서만 활성화. 최종 전체 검증 통과. 디자인 사용자 검토는 남음. 제품 기능과 별개 |
| P00 | 단계별 문서 정합성 | DONE | 없음 | AGENTS·PRD·ARCHITECTURE·TASKS의 1·2단계 경계 반영. 기능 구현과 별개 |
| P09C | Jest 설정 파일 생성 | IN_PROGRESS | 없음 | jest.config.mjs·jest.setup.ts 생성. Node 22.23.3에서 jest --showConfig, npm run lint, next typegen 후 tsc --noEmit 통과. 테스트 실행은 미실시; P09는 TODO 유지. 기본 Node 18.12.1에서는 Jest 로딩 실패 |
| P09E | Playwright 설정 파일 생성 | IN_PROGRESS | 없음 | playwright.config.ts 생성. lint·tsc 통과; Node 22에서 playwright test --list는 설정 로딩 후 No tests found(0개, 종료 코드 1). E2E 미실행, P09는 TODO 유지. 실행 전 npm run build 필요 |
| P09S | 검사 npm scripts 추가 | IN_PROGRESS | P09C, P09E | 요청한 스크립트 추가. Node 22에서 verify 실행: lint·typecheck 통과, Jest는 테스트 없음으로 종료 코드 1. 이후 build·E2E 미실행; P09는 TODO 유지 |
| P01 | 타입·Mock API 계약 | IN_PROGRESS | P00 | `/api/v1` 요청·응답 타입·오류 형식, 더미 사용자·데이터, UI API 클라이언트 경계. UI의 더미 배열 직접 의존 제거 |
| P01M | Mock 초기 파일 | IN_PROGRESS | P01 | users·quizzes·subscriptions·shop-items·learning-history 초기 데이터 파일, 배포 시 읽기 전용 |
| P02 | localStorage Mock 어댑터 | IN_PROGRESS | P01M | 초기 파일 읽기·사용자별 변경 상태 저장/복원, UI 직접 의존 제거, HTTP 호출 없이 계약 유지, 서버 파일 쓰기·메모리 영속 저장 금지 |
| P02T | 학습 시간대 감지·설정 | TODO | P02 | 브라우저 IANA 감지·마이페이지 조회/변경·설정 복원, IP 시간대 검토·국가 코드 추론 금지, 기본 시간대 확정 후 fallback |
| P03 | 학습 내용 입력·퀴즈 생성 | IN_PROGRESS | P02 | 단일 입력·코드 블록·현재/10,000자, Mock 퀴즈 1~5개와 퀴즈당 태그 최대 3개 |
| P04 | 퀴즈 개별·일괄 저장·검토 | IN_PROGRESS | P03 | 각 후보의 독립 ID·PENDING 저장, 검토·수정·PRIVATE/PUBLIC 화면 흐름 |
| P05 | 퀴즈 풀이 UX | DONE | P04 (기존 Mock API로 독립 구현) | 기존 완료 기준: 더미 사용자별 풀이, 제출 전 정답 비노출, 결과·버그리 반응 진행 기록: 홈 직접 풀이·4형식·정답 비노출·결과 복원·새 Attempt 재도전·버그리 정오/완료 표정. 학습자 3종 예시 구독과 기존 데이터 보완. Node 22.23.3 / PLAYWRIGHT_PORT=3125 전체 verify 통과(Jest 68개·E2E 15개). 탐색 전환의 입력 경합 및 테스트 타입/선택자 오류 수정 후 통과. 구현자 외 리뷰 대기 |
| P06 | 구독 3종·탐색 | TODO | P04 | 사람·사람+태그·전체 작성자+태그 구독, 더미 개발자·해시태그 탐색. 구독 피드 없음 |
| P07 | 학습 태그·연속 풀이 | IN_PROGRESS | P05, P06, P02T | 기존 완료 기준: 기본 전체·단일 태그 선택·다음 문제의 태그 유지·소진 후 다시 풀기/다른 태그·기록 보존·하루 1개 완료 조건 진행 기록: 구독 기반 한 문제·단일 태그·다음 문제·소진/빈 상태·다시 풀기를 기존 API에 연결. 빈 상태는 /discover 전용 탐색 페이지로 이동. 공통 밑줄 탭·키보드 전환·개발자/태그 검색·20개 단위 API 페이지 조회·URL 복원·구독 후 탐색 조건 유지·여러 항목 연속 추가·별도 학습 이동(AC-12i). 1,000명/1,000개 fixture 페이지 처리 및 전체 verify 통과(Jest 68개·E2E 15개). 전체 구독 관리(P06)·시간대 설정(P02T) 화면 통합과 구현자 외 리뷰는 남음 |
| P08 | BugCoin 상점·장착 UX | IN_PROGRESS | P02, P05 | 상품 조회→더미 BugCoin 구매→보관함→장착, 잔액 부족·중복 클릭 상태와 타인 데스크 화면 |
| P09 | Jest·React Testing Library·Playwright | TODO | P01M, P02, P02T, P03~P08 | API 계약·핵심 UI 동작·더미 사용자 E2E 통과. 실제 보안·거래 안전성 검증으로 기록하지 않음 |
| P10 | Vercel 프로토타입 배포 | TODO | P09 | DB·OAuth·JWT 비밀값 없이 화면·Mock API 동작 확인, Mock 데이터의 비영속성 안내 |

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

## P08-VERTICAL-CAMERA-DIRECTION 상하 시점 드래그 방향

- 상태: IN_PROGRESS. REQ-09/AC-09e. 사용자가 요청한 대로 공간 상하 회전도 드래그 방향을 따르도록 pitch 입력 부호를 수정한다. 좌우·아이템 조작은 유지한다. PC/모바일에서 위 드래그의 실제 상판 아랫면, 아래 드래그의 윗면, 각도 제한과 초기화 및 기존 정면 배치를 검증한다.

- 구현/검증: pitch 입력을 `drag.pitch + dy * 0.3`으로 수정. 수정 전 위 드래그 시 상판 아랫면이 보이지 않아 PC/모바일 E2E 2개 실패를 확인했다. 기존 각도·픽셀·배치 기대값은 유지하고 시점 진입 제스처만 새 방향에 맞췄다. 수정 후 관련 E2E 14개 및 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 94개·도구 3개·build·E2E 57개). 로그 `.bugri-hooks/vertical-camera-verify.log`. 독립 리뷰 대기로 IN_PROGRESS 유지. push·PR·merge 없음.

## P08-ALL-ITEM-DRAG 공통 아이템 드래그

- 상태: IN_PROGRESS. REQ-09/AC-09e. 정면 ±20도에만 높이 드래그를 허용해 기본 시점에서는 버그리 등 모든 아이템이 깊이 이동으로 처리되는 문제였다. 버그리·키보드·모니터·소품의 공통 MOVE에서 ±45도까지 세로 우세로 시작한 드래그를 수직 평면으로 고정한다. 아래로 내리는 동안 상판에 다시 붙지 않게 하며 바닥에서 상판으로 올리는 접점 스냅과 가로/위쪽 시점의 평면 배치를 유지한다. 책상·배경의 기존 제약은 유지한다.
- 재현: 정면 테스트를 네 종류로 확장한 8개는 통과했으나 기본 시점 테스트 8개는 높이가 바뀌지 않아 실패했다. 모니터 테스트의 정면 클릭 색은 보이지 않는 옆면에서 실제 앞면으로 수정했다. 새 테스트는 PC/모바일에서 드래그 중 높이 감소·수평 좌표 보존·바닥 제한·시점 회전 후 배치 보존을 검증한다.

- 검증: 관련 E2E 28개 통과 후 전체 검증에서 기존 상판 이동 E2E 2개가 새 세로 시작 높이 조절과 충돌했다. 상판 테스트를 가로 시작으로 변경해 평면 이동을 선택하도록 했으며 Y 1.55·가시성·저장/복원 기대값은 유지했다. 재검사 18개 통과. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 94개·도구 3개·build·E2E 71개), `git diff --check` 통과. 최종 로그 `.bugri-hooks/all-item-drag-reverify.log`. IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.

## P08-IMMERSIVE-ROOM-ZOOM 축소 시 방 내부 유지

- 상태: IN_PROGRESS. REQ-09/AC-09e. 최소 배율에서 유한한 배경 외곽이 드러나는 현상을 PC/모바일 E2E로 재현했다. 화면 전체 방 바탕과 현재 뷰포트/배율을 넘는 벽·바닥 범위를 사용하고 반대쪽 벽도 제공해 회전·축소 시 방 내부 느낌을 유지한다. 두 테마의 최소 배율·좌우 한 바퀴·상하 시점에서 빈 픽셀 없는 화면을 검증한다.

- 구현: 방 바닥색의 카메라 정렬 바탕 면을 뷰포트 전체에 유지하고, 월드 벽/바닥 범위를 화면 대각선·줌·프레이밍 기준에 따라 갱신한다. 네 방향 내부 벽을 제공하고 왼쪽 벽의 안쪽 면 방향도 수정했다. 창문·러그·가구 좌표와 배치는 유지한다. 최소 배율의 실제 Canvas 정면/회전 화면에서 외곽 없이 이어지는 벽·바닥을 확인했다.
- 검증: 수정 전 PC/모바일 E2E 2개가 최소 배율에서 빈 영역을 검출해 실패했다. 초기 실행의 3107 포트 충돌은 래퍼가 3108로 자동 재시도했다. 수정 후 두 테마의 최소 배율·좌우 한 바퀴·상하 회전·기존 장착/복원 관련 E2E 6개 통과. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 94개·도구 3개·build·E2E 73개), `git diff --check` 통과. 로그 `.bugri-hooks/room-zoom-verify.log`. IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.

## P08-ROOM-VERTICAL-CORNER 벽 모서리 수직 경계

- 상태: IN_PROGRESS. REQ-09/AC-09e. 확장한 두 벽이 서로 겹쳐 사선 가장자리가 벽 경계처럼 보이는 문제를 실제 Canvas의 서로 다른 높이에서 모서리 X 좌표를 비교해 재현한다. 각 시점의 두 내부 벽을 공통 모서리에서 맞추고 화면 바깥 방향으로만 확장한다.

- 구현/검증: 카메라 방위각에 따라 두 벽의 공통 모서리를 정하고 그 부분에서만 면을 자른다. 반대 끝은 투영 가로 폭을 고려해 화면 밖까지 확장한다. 수정 전 PC/모바일 모서리 X 좌표 비교 2개 실패, 수정 후 두 테마의 수직 경계·배경 채움·장착/복원 관련 E2E 6개 통과. 실제 최소 배율 Canvas에서도 수직 모서리를 확인했다. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 94개·도구 3개·build·E2E 73개), `git diff --check` 통과. 로그 `.bugri-hooks/room-corner-verify.log`. IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.

## P08-ROOM-THUMBNAIL-BOUNDS 썸네일 벽과 바닥 정렬

- 상태: IN_PROGRESS. REQ-09/AC-09e. 썸네일 고정 방 모델의 왼쪽 벽 깊이와 바닥 범위가 달라 경계 밖으로 겹치는 문제를 수정한다. 벽 네 면의 하단 끝점이 바닥 모서리와 일치하는지 두 테마 단위 테스트로 검증하고 실제 상품 카드 및 기존 전체 화면 배경 회귀를 확인한다. 이전 작업 Hook이 활성 상태여서 재활성화하지 않고 기존 검증 상태를 유지한다.

- 검증: 수정 전 두 테마의 벽 하단/바닥 모서리 테스트 2개 실패 후 수정으로 통과. 새 테스트의 Zdog 내부 children 타입 선언 오류로 첫 E2E 빌드가 중단되어 타입 선언을 수정했고 TypeScript와 관련 E2E 6개 통과. 실제 정원/달빛 썸네일 화면 확인. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 96개·도구 3개·build·E2E 73개). 로그 `.bugri-hooks/room-thumbnail-verify.log`. IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.

## P08-COMPOSITION-CENTER 전체 배치 중심 회전

- 상태: IN_PROGRESS. REQ-09/AC-09e. 사용자가 버그리 단독이 아니라 책상·버그리·상품을 포함한 전체 배치의 중앙 구도를 선택했다. 고정 원점 대신 전체 오브젝트의 월드 범위를 기준으로 맞춤 범위를 잡고 방위각에 따른 투영 좌우 중심을 보정한다. 배치 편집 중 카메라가 따라 움직이지 않도록 최초 구성의 범위를 유지한다. PC/모바일 내 공간·공개 공간·상점의 실제 오브젝트 픽셀 중심과 좌표 보존을 검증한다.

- 구현: 전체 오브젝트의 이동·회전과 itemFrame을 반영한 범위를 보관하고 방위각별 좌우 투영 중심을 보정한다. 버그리의 실제 모델 폭/깊이에 맞춰 외곽을 보정했다. 이전 구도에서 달라진 작은 키보드의 경계 픽셀은 선택 맵의 안티앨리어싱으로 (255,1,0)이 되어 완전 일치 선택에서 누락됐으며, 불투명한 거의 순수한 식별색(채널 오차 2 이하)만 인정하도록 수정했다.
- 검증 정합성: 방향 검사는 회전마다 바뀌는 내부 색상 픽셀 하나 대신 실제 색상 외곽 중심의 이동을 비교하며 기존 방향/이동량 기대값을 유지한다. 클릭 좌표는 보이는 픽셀의 중심을 사용한다. 사용자가 확인한 `/my` 복구와 상점 링크 제거를 반영해 기존 E2E는 직접 `/my`로 이동하고, 모달 종료 후 상품 목록 제목으로 포커스가 돌아오는 것을 검증한다. 저장·배치·가시성 검사는 유지했다.
- 실패/복구: 수정 전 중앙 정렬 E2E 2개 실패, 모바일 외곽 오차를 모델 크기로 보정한 후 통과. 병행 작업의 `/my` 삭제 시 타입 검사가 중단됐고 복구 후 통과했다. 이어 동시 Next 빌드 잠금으로 전체 검증이 중단되어 다른 검증 종료 후 재실행했다. 회전 비교와 작은 키보드 선택 실패를 위 원인대로 수정한 뒤 관련 E2E 6개 통과.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 17 suites/96 tests·도구 3 tests·build·Playwright 78 tests), `git diff --check` 통과. 로그 `.bugri-hooks/scene-center-final-verify.log`. IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음. 병행 작업의 상점 헤더·문구 변경은 이 커밋에 포함하지 않는다.

## P08-MIN-ZOOM-CENTER 최소 배율의 방/배치 공통 중심

- 상태: IN_PROGRESS. REQ-09/AC-09e. 사용자는 새 모달에서 아이템을 옮기지 않아도 최소 배율 회전 시 쏠림을 보고했다. 가구 묶음의 픽셀 중심은 유지되지만 배경 방의 비대칭 앞뒤 범위와 별도 중심 때문에 벽 모서리가 좌우로 치우치는 것을 실제 화면으로 확인했다. 실제 공간의 방은 대칭 범위와 공통 프레이밍 중심을 사용하고 고정 썸네일 범위는 유지한다.

- 구현: 실제 공간만 대칭 방 경계를 사용하고 환경 그룹·러그를 가구 프레이밍 중심과 정렬한다. 썸네일과 저장 좌표는 유지한다. 새 모달 최소 배율에서 가구 픽셀 중심 및 두 배경의 네 방향 벽 모서리 중심/수직선과 화면 채움을 PC·모바일로 검증한다. 수정 전 모서리 중심 검사 2개 실패, 수정 후 관련 E2E 8개 통과 및 실제 화면 확인.
- 검증: 자동 Hook과 수동 검증이 겹치며 동시 빌드 잠금 및 페이지 요소 로드 타임아웃이 발생했다. 추가 실행 없이 마지막 Hook 결과를 확인했으며 마지막 코드 변경 후 Node v22.23.3 전체 검증 통과(lint·TypeScript·Jest 17 suites/96 tests·도구 3 tests·build·E2E 78 tests). 근거: .bugri-hooks/verify-4.log. git diff --check 통과. IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.

## P08-SHOP-SEARCH-SORT 상품 검색·정렬

- 상태: IN_PROGRESS. REQ-09/AC-09e. 사용자 요청에 따라 `/shop` 상품명·설명 검색과 기본순·가격 낮은순·가격 높은순·이름순 정렬을 추가한다. 카테고리와 검색을 함께 적용하고 결과 없음에서 필터를 초기화한다. `/my` 보유 상품 화면과 구매·장착 계약은 변경하지 않는다.
- TDD/구현: 검색 입력 부재로 실패하는 상점 단위 테스트를 먼저 확인했다. 공통 TextField와 제어 가능한 Select를 사용하고 검색 결과 개수·설명 검색·가격 정렬·카테고리 조합·초기화를 구현했다. 검색·정렬은 상품 수 문구를 대신해 상품 목록 헤더에 배치하고 모바일에서는 세로로 쌓는다. 더미 사용자 선택도 공통 Select의 인라인 배치를 사용한다.
- 검증: 관련 단위 12개와 모바일 검색·정렬·가로 넘침 E2E를 포함한 관련 E2E 4개 통과. 실제 1100px·390px 화면 확인. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 17 suites/98 tests·도구 3 tests·build·Playwright 79 tests), `git diff --check`와 변경 파일 Prettier 검사 통과. 구현·필수 검증 완료, 독립 리뷰 대기. push·PR·merge 없음.

## P08-ROOM-ORBIT-COMPOSITION 방 안의 중앙 구도

- 상태: IN_PROGRESS. REQ-09/AC-09e. 사용자 스크린샷의 방 구도 쏠림을 확인 중이다. 환경을 카메라 역회전으로 고정하는 시도는 사용자가 요청한 공간 전체 회전과 맞지 않아 철회했다. 방·가구가 함께 회전하는 기존 동작으로 복구했다.
- 검증 기록: 철회한 방식의 관련 E2E 8개는 통과했지만 요구사항을 검증하지 못한 결과다. 전체 검증은 Jest 98개 통과, E2E 76개 통과/3개 실패(페이지 로드 중 캔버스 또는 상품 조작 요소 대기 시간 초과). 로그 .bugri-hooks/room-orbit-verify.log. 이 결과를 해결 근거로 사용하지 않는다. 모든 각도에서 벽 모서리를 화면 중앙에 고정하도록 한 테스트도 잘못된 요구 해석이므로 함께 철회했다. 최초 최소 배율 쏠림은 미해결이며 DONE으로 표시하지 않는다.

- 후속 구현: 방 내부의 2점 원근 투영과 near-plane 클리핑을 Canvas 2D로 적용한다. 정면 양쪽의 벽을 함께 표시하고 기존 창문 텍스처를 투영한다. 가구·러그의 yaw/pitch 회전과 조작/저장 좌표는 유지한다. 사용자 스크린샷에 해당하는 ±10도 시점에서 바닥 영역 중심 및 벽의 실제 회전을 검사한다. 기존 코드에서 PC 바닥 중심 검사가 실패했고 첫 수정 후 관련 E2E 8개가 통과했다. 최종 검증 진행 중.

- 최종 검증: 사용자 스크린샷과 같은 달빛 작업실 최소 배율의 ±10도 화면에서 좌우 벽·바닥 구도와 가구 중앙을 직접 확인했다. 창문은 벽 평면 역투영 샘플링으로 이음선을 제거했다. 관련 E2E 8개 통과, 마지막 코드 변경 후 Node v22.23.3 npm run verify 전체 통과(lint·TypeScript·Jest 17 suites/98 tests·도구 3 tests·build·E2E 79 tests). 로그 .bugri-hooks/perspective-verify.log. git diff --check 통과. 방 고정 없이 원근 구도로 중앙 배치를 보정한 구현이며 IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.

## P08-ROOM-ZOOM-SYNC 배경·아이템 확대 배율 동기화

- 상태: IN_PROGRESS. REQ-09/AC-09e. 원근 배경의 카메라 거리와 방 크기가 사용자 휠 배율을 상쇄하는 문제를 수정한다. 방의 기준 크기는 자동 맞춤 배율에서 계산하고 사용자 확대 배율은 가구와 동일하게 투영에 적용한다. 창틀과 책상 픽셀 너비가 함께 절반으로 줄어드는지 두 테마·PC/모바일에서 검증한다.

- 확대 동기화 관련 E2E 6개 및 전체 verify 통과(Jest 98·E2E 79, .bugri-hooks/room-sync-verify.log). 이어 사용자가 축소 시 여러 번 꺾인 벽 모양을 지적하여 같은 작업에서 사각형 방의 카메라 쪽 벽을 열고 인접 벽을 화면 밖까지 연장한다. 대각선 시점에 두 벽만 보이는 검사를 추가했고 수정 전 PC·모바일 모두 실패를 확인했다. 추가 수정 후 전체 재검증 예정.

- 최종 검증: 모바일에서 가구에 가려지는 창틀 대신 정면 두 벽 모서리 간격과 책상 픽셀 너비를 함께 비교한다. 축소 후 추가 모서리가 보이는 경우에도 중앙 모서리의 수직/중앙 정렬을 검사하며, 대각선 사각형 방은 두 벽으로 보이는지 확인한다. 관련 E2E 6개와 마지막 코드 변경 후 Node v22.23.3 npm run verify 전체 통과(lint·TypeScript·Jest 17 suites/98 tests·도구 3 tests·build·E2E 79 tests). 로그 .bugri-hooks/square-room-verify.log. 실제 최소 배율의 대각선/정면 화면과 git diff --check 확인. IN_PROGRESS(독립 리뷰 대기). 사용자가 커밋·푸시·PR 생성을 요청하여 진행한다.

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

### P06-DEVELOPER-BACK-LINK — 개발자 페이지 탐색 복귀 링크

- 상태: DONE. 개발자 공개 퀴즈 페이지의 모호한 `개발자·태그 탐색` 링크를 방향이 분명한 `탐색으로 돌아가기` 보조 링크로 바꾸고, 버튼처럼 과하게 보이지 않도록 정리했다.
- 탐색 복귀 링크의 이름·URL E2E를 확인했다. Node v22.23.3에서 최종 `PLAYWRIGHT_PORT=3125 npm run verify`를 통과했다(lint·TypeScript·Jest 15 suites/79 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다.

### P06-DEVELOPER-ALL-QUIZZES-FILTER — 전체 퀴즈 필터 위치

- 상태: DONE. 태그 영역의 `전체 퀴즈` 버튼을 제거하고, 태그 필터가 활성화된 경우에만 공개 퀴즈 제목 우측에 필터 해제 동작으로 표시한다.
- 기본 상태 숨김, 태그 선택 후 공개 퀴즈 영역 노출, 필터 해제 후 전체 목록 복원을 E2E로 확인했다. Node v22.23.3에서 최종 `PLAYWRIGHT_PORT=3125 npm run verify`를 통과했다(lint·TypeScript·Jest 15 suites/79 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다.

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

### A · 미처리 생성 후보 닫기 경고 — DONE

- 생성 모달에 임시저장·공개하지 않은 후보가 하나라도 있으면 닫기 버튼과 Escape에서 소실 경고를 표시한다. 취소하면 모달을 유지하고, 모든 후보를 임시저장·공개·삭제했으면 경고 없이 닫는다.
- 공통 Modal의 cancel 기본 닫기를 막아 호출부가 닫기를 거부할 수 있게 했다. 의도한 경고 미호출 실패를 확인했고, Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 20 suites/86 tests·production build·Playwright 16 tests. 독립 리뷰는 남아 있다.

### A · LLM 요청 전송 아이콘 — DONE

- LLM 추가 요청의 `요청 보내기` 텍스트 버튼을 종이비행기 아이콘 버튼으로 바꾸고, 접근성 이름·hover 제목·로딩·비활성 동작은 유지했다.
- Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 20 suites/86 tests·production build·Playwright 16 tests. 독립 리뷰는 남아 있다.

### A · 퀴즈 관리 상세 UX 재구성 — DONE

- 관리 상세의 목록 복귀·퀴즈 제목·상태를 sticky 헤더로 통합하고, 편집 폼을 기본 정보·문제 구성·해설·분류 섹션으로 나뉘다. 원본 학습 내용은 기본으로 접고 Markdown 편집기와 선택지 밀도를 줄였다.
- 추천 태그를 입력 아래 칩으로 변경하고, 선택지의 입력·정답·삭제를 컴팩트한 행으로 재배치했다. 편집 중 변경 상태·취소·저장은 viewport 하단 고정 바에 두고, 재조회는 아이콘, 삭제는 비편집 상태의 독립 위험 영역으로 분리했다.
- 의도한 구조 테스트 실패를 확인한 뒤 관리 컴포넌트와 승인·수정·재생성·공개 범위·삭제 모바일 E2E를 통과했고 데스크톱·390px 실화면을 확인했다. Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 20 suites/87 tests·production build·Playwright 16 tests. 독립 리뷰는 남아 있다.

### A · 내 퀴즈 목록 탐색 UX — DONE

- 큰 반복 카드를 컴팩트한 목록 행으로 바꾸고 전체 개수·상태별 개수, 제목·태그 검색, 검토 필요·공개·나만 보기 필터, 최근·오래된·제목순 정렬과 10개 단위 페이지를 제공한다. wire 상태값은 사용자 문구와 배지로 표시하고 항목 전체에서 상태에 맞는 검토·관리 화면으로 이동한다.
- 검색·필터·정렬·페이지를 URL에 보존해 상세 화면에서 돌아오거나 새로고침해도 목록 맥락을 유지한다. 새 퀴즈 만들기를 주요 동작으로 정리하고 새로고침은 정렬 옆 아이콘으로 축소했다.
- 목록 단위 테스트 4개와 검색 조건 복귀·390px 가로 넘침 E2E를 추가하고 데스크톱·모바일 production 화면을 확인했다. Node 22.23.3 `PLAYWRIGHT_PORT=3293 npm run verify` 전체 통과: lint·TypeScript·Jest 21 suites/93 tests·production build·Playwright 17 tests. 독립 리뷰는 남아 있다.

### A · 채팅 Enter 전송 — DONE

- 최초 학습 대화와 퀴즈 LLM 수정 textarea에서 Enter는 전송하고 Shift+Enter는 줄바꿈으로 동작한다. 한글 등 IME 조합 중 Enter는 전송하지 않으며 기존 전송 버튼도 유지한다.
- 두 채팅의 키보드 단위 테스트와 실제 브라우저의 Enter·Shift+Enter 흐름을 추가했다. Node 22.23.3 `PLAYWRIGHT_PORT=3293 npm run verify` 전체 통과: lint·TypeScript·Jest 21 suites/93 tests·production build·Playwright 17 tests. 독립 리뷰는 남아 있다.

### A/B 통합 · dev 충돌 해결 — DONE

- `origin/dev`의 퀴즈 작성·관리 기능과 `feat/solving-quiz`의 홈 풀이·탐색 기능을 병합한다. 작성 대화와 학습 데모 상태, 작성·탐색 HTTP 계약, 공통 Tabs·Modal 동작을 모두 유지한다.
- 공통 Modal의 StrictMode 닫힘 경합과 URL 전환 후 Tabs 키보드 포커스 소실을 통합 테스트에서 발견해 수정했다. Node 22.23.3에서 `PLAYWRIGHT_PORT=3125 npm run verify` 전체 통과: lint·TypeScript·Jest 27 suites/123 tests·production build·Playwright 34 tests.
- 독립 UX 리뷰는 3002의 홈·탐색·개발자·작성 화면을 1440px/390px에서 확인했으며 중대한 병합 회귀 없이 수정 0회로 종료했다. 구현자 외 코드 리뷰와 최종 병합 판단은 남아 있다.

## P08-DEV-MERGE 상점·퀴즈 기능 통합

- 상태: IN_PROGRESS(구현자 외 코드 리뷰 대기). 사용자와 파일별 충돌을 해결하여 dev의 작성·풀이·탐색과 상점의 구매·미리보기·공간 편집을 함께 보존했다. 공통 Select의 문자열/객체 옵션·가로 배치, Modal의 방 크기·대화 레이아웃·초기 포커스를 통합했다. 헤더 로고는 사용자 결정대로 홈으로 연결한다.
- HTTP 검사는 양쪽 9개 테스트를 모두 유지했고 엔드포인트 계약 합집합 44개를 확인했다. 통합 검증의 첫 lint에서 상수 사이 빈 줄 누락을 수정했다.
- Node v22.23.3 npm run verify 전체 통과: lint·TypeScript·Jest 36 suites/175 tests·도구 3 tests·build·Playwright 109 tests. 로그 .bugri-hooks/merge-verify-2.log. 충돌 표식과 git diff --check 확인.
- ux-review-loop 독립 리뷰는 Chromium 1440px/390px 홈 풀이·상점·내 공간·선택 정렬·모달 Esc/포커스 복귀를 확인했으며 병합 회귀 없이 수정 0회로 종료했다. fresh dummy 정상 흐름 중심이며 구매와 모든 배치 제스처를 독립 리뷰에서 확인한 것은 아니다. 캡처 .bugri-hooks/previews/merge-*.png. 사용자 요청에 따라 병합 커밋을 푸시하고 Draft PR #10을 갱신한다.
