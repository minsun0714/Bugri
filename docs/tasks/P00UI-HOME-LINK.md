### P00UI-HOME-LINK — 풀이 워크스페이스 로고 홈 이동

- 상태: IN_PROGRESS. 3002 공통 헤더 로고를 홈(/)으로 연결한다. 탐색·직접 풀이·개발자 페이지에서 홈 이동 및 기존 UI 전시 흐름을 검증한다. 3000/3001 워크스페이스는 변경하지 않는다.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 PLAYWRIGHT_PORT=3125 npm run verify 통과(lint·TypeScript·Jest 73개·build·Playwright 18개). 홈의 자동 학습 쿼리 때문에 URL 전체 일치 검사가 실패하여 요구사항에 맞게 pathname=/ 검증으로 수정 후 전체 통과했다. 근거: /tmp/bugri-3002-home-verify.log.

