### STREAK-DAILY-COUNTS — 최근 7일 학습량

- 상태: DONE. 승인된 일별 고유 퀴즈 완료 개수를 API에서 집계하고 최근7일을 막대와 N개로 표시한다. 같은 현지 학습일·quizId는 다시 풀어도 1개이며 다른 날짜는 별도로 집계한다. 정오 무관, 미제출 제외, 삭제/시간대 변경 후 원래 완료일 보존. 스트릭 기준은 유지한다. PRD AC-12k와 API dailyCounts 계약 반영.
- API·UI 신규 테스트 의도한 실패 후 관련35개 및 E2E2개 통과. Node v22.23.3 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3337 npm run verify` 전체 통과(lint·TypeScript·Jest195개·도구3개·production build·E2E119개). diff check 통과, 로그 `.bugri-hooks/verify-1.log`.
- [독립 UX 리뷰](../ux-reviews/STREAK-DAILY-COUNTS.md) R0에서 1280/390/768 실제 화면·fixture·키보드 제출/도움말·오답 재풀이 후1개 유지 직접 확인. 필수/일반 문제0개, 수정0회. 오류 강제재현/스크린리더·날짜경계/삭제/시간대 변경은 독립 화면 리뷰 미확인(API 테스트로 집계 확인). 캡처 `.bugri-hooks/previews/streak-volume/`. 구현자 외 코드 리뷰·사용자 최종 디자인 판단은 남아 있다.
