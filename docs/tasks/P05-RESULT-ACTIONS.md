### P05-RESULT-ACTIONS — 결과 버튼 가로 배치

- 상태: IN_PROGRESS. 다시 풀기·다음 문제를 같은 flex 행에 배치한다. 직접 풀이 및 이용 불가 퀴즈의 기존 버튼 표시 조건은 유지한다. 기존 재도전·다음 문제 E2E와 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 PLAYWRIGHT_PORT=3125 npm run verify 통과(lint·TypeScript·Jest 76개·build·Playwright 19개). 3002의 390px 모바일에서 두 버튼 y=890 동일 행 배치를 실제 브라우저로 확인했다. 근거: /tmp/bugri-result-actions-verify.log.

