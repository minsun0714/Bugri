### FAVICON-BUGRI — 버그리 파비콘

- 상태: IN_PROGRESS. 공통 버그리 캐릭터의 보라색 외곽·연두색 몸·안테나·얼굴을 작은 크기에 맞게 단순화한 벡터 파비콘으로 기존 기본 아이콘을 교체한다.
- Next.js 16 App Router의 앱 아이콘 파일 규칙에 따라 루트 `app` 세그먼트에 적용하고, 16px·32px 렌더링과 production build 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 구현자 외 리뷰 대기로 IN_PROGRESS를 유지한다. Node v22.23.3에서 16px·32px·64px 렌더링과 production 응답의 SVG·ICO 아이콘 링크 및 MIME 유형을 확인했다. `PLAYWRIGHT_PORT=3295 npm run verify` 전체 통과(lint·TypeScript·Jest 27 suites/123 tests·production build·Playwright 34 tests).
