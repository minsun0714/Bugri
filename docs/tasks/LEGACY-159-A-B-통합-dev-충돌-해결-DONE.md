### A/B 통합 · dev 충돌 해결 — DONE

- `origin/dev`의 퀴즈 작성·관리 기능과 `feat/solving-quiz`의 홈 풀이·탐색 기능을 병합한다. 작성 대화와 학습 데모 상태, 작성·탐색 HTTP 계약, 공통 Tabs·Modal 동작을 모두 유지한다.
- 공통 Modal의 StrictMode 닫힘 경합과 URL 전환 후 Tabs 키보드 포커스 소실을 통합 테스트에서 발견해 수정했다. Node 22.23.3에서 `PLAYWRIGHT_PORT=3125 npm run verify` 전체 통과: lint·TypeScript·Jest 27 suites/123 tests·production build·Playwright 34 tests.
- 독립 UX 리뷰는 3002의 홈·탐색·개발자·작성 화면을 1440px/390px에서 확인했으며 중대한 병합 회귀 없이 수정 0회로 종료했다. 구현자 외 코드 리뷰와 최종 병합 판단은 남아 있다.
