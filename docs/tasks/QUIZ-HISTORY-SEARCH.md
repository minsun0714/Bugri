# QUIZ-HISTORY-SEARCH — 풀이 내역 본문 검색

- 상태: REVIEW_PENDING (구현·자동 검증 완료, 독립 UX/UI 리뷰와 실제 화면 확인 미실행)
- 목적: `/my/learning` 풀이 내역에서 제목·문제 본문으로 지난 풀이를 찾는다.
- 근거: 사용자 요청. 기존 QUIZ-HISTORY의 "검색 제외"를 사용자 요청으로 해제했다(PRD·API 갱신). 선행: QUIZ-HISTORY.
- 범위: `attemptHistory`의 `query`·`matchedIn`·`excerpt`, Mock 서비스 검색, 검색 UI(SearchField + URL 유지), 더미 풀이 기록(learner), 한영 문구, 테스트.
- 제외: 정렬 선택, 해설·답안 검색, 하이라이트 렌더링 고도화, 다른 사용자 기록 검색, 실제 DB 검색.
- 확정 정책: 위 PRD "풀이 내역 검색" 항목과 API.md `attemptHistory` 참조. 접근 불가 퀴즈 기록은 검색어가 있으면 제외한다.
- 더미 데이터: `src/mocks/quizzes.ts`의 `historyDemoQuizzes`(learner 본인 PRIVATE 연습 퀴즈 8개, seed-quiz-5~12)와 `src/mocks/learning-history.ts`의 `historyDemoAttempts`(learner 완료 Attempt 12개, 2026-10-12~11-06, 정/오답 혼합·같은 퀴즈 재도전 포함).
- 시드 방식 결정: 처음에는 공개 카탈로그에 퀴즈를 추가했으나 후보 수·태그/작성자 집계를 전제한 기존 테스트 19개가 깨졌고, 기본 시드로 넣은 비공개 퀴즈도 learner를 빈 상태로 가정한 테스트 13개가 깨졌다. 그래서 `MockOptions.demoHistory`(기본 꺼짐)로 분리했다. `createBrowserApi`가 `NEXT_PUBLIC_DEMO_HISTORY === "1"`일 때만 켜며 `next.config.ts`가 기본 "1"을 주입한다(제품 빌드는 항상 켜짐). Jest 단위 테스트는 플래그 없이 빈 learner로 시작하고, E2E는 `playwright.config.ts`에서 "0"으로 빌드해 기존처럼 직접 시드한다.
- 병합: `applyHistoryDemo`(storage.ts)는 멱등이며 `historyDemoVersion: 1`로 한 번만 합친다. 조회 전용 연산(`attemptHistory`·`attempt`)은 메모리에서만 합쳐 저장하지 않고(PRD의 읽기 전용 규칙 유지) 다음 쓰기 연산에서 저장된다. 이미 저장된 기존 learner 상태에도 데모 기록이 한 번 더해진다.

## 변경 파일

- 명세: `docs/PRD.md`(풀이 내역 검색 항목, 검색 제외 문구 수정), `docs/API.md`(`attemptHistory` query/matchedIn/excerpt, Query 키).
- API/서비스: `src/api/constants.ts`(`AttemptHistoryMatch`), `contracts.ts`, `src/services/history-search.ts`(신규, 순수 검색 규칙), `mock-service.ts`.
- 더미/저장: `src/mocks/quizzes.ts`, `learning-history.ts`, `storage.ts`, `adapter.ts`, `src/services/state.ts`, `src/api/browser.ts`, `next.config.ts`, `playwright.config.ts`.
- UI: `src/components/learning-history/history-screen.tsx`, `queries.ts`, `src/lib/i18n/en.json`.
- 검사: `tests/unit/api/quiz-history-search.test.ts`(신규 11개), `tests/unit/quiz-history.test.tsx`(+4), `tests/e2e/quiz-history.spec.ts`(+2, ko/en).

## 검증 결과 (Node v22.23.3)

- 실패 확인: 검색 API 테스트를 구현 전에 먼저 실행해 9개 모두 실패(미구현)를 확인했다.
- `npm run lint`·`npm run typecheck` 통과. `npm run test:tools` 3개 통과.
- 전체 Jest: 75 suite/405개 통과.
- E2E: `npm run test:e2e -- tests/e2e/quiz-history.spec.ts --workers=1` 8개 통과(신규 ko/en 검색 흐름 포함).
- 브랜치 분리 후 최종 상태(`feat/history-search`, `UI-STYLE-REFRESH` 위에 쌓음) 재검증: lint·typecheck 통과, Jest 75 suite/405개, `test:tools` 3개 통과. E2E quiz-history·navigation·locale·solving·home-quiz-review·mock-api 37개 통과. 전체 영향 범위 E2E 187개는 기반 브랜치에서 통과했고 이 브랜치 전체를 다시 실행하지는 않았다. `npm run build`는 이 브랜치에서 별도 실행하지 않았다(E2E가 production build로 실행됨).
- 미실행: 독립 UX/UI 리뷰(ux-review-loop), 실제 브라우저에서의 화면 확인(데모 플래그가 켜진 제품 빌드 포함), 다크 테마·모바일 육안 확인, 전체 E2E. 데모 플래그가 켜진 상태의 화면은 단위 테스트(API)로만 검증했다.
- `docs/API.md`·`docs/PRD.md`는 변경 전부터 Prettier 검사에 실패하던 파일이라 형식은 건드리지 않았다.

## 남은 제약

- 검색은 Mock의 클라이언트 측 부분 일치다. 형태소 분석·유사도·실제 DB 검색은 2단계 범위다.
- 해설·제출 답안 검색, 정렬 선택은 제외했다.
