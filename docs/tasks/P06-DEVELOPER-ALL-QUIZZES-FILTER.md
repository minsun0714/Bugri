### P06-DEVELOPER-ALL-QUIZZES-FILTER — 전체 퀴즈 필터 위치

- 상태: DONE. 태그 영역의 `전체 퀴즈` 버튼을 제거하고, 태그 필터가 활성화된 경우에만 공개 퀴즈 제목 우측에 필터 해제 동작으로 표시한다.
- 기본 상태 숨김, 태그 선택 후 공개 퀴즈 영역 노출, 필터 해제 후 전체 목록 복원을 E2E로 확인했다. Node v22.23.3에서 최종 `PLAYWRIGHT_PORT=3125 npm run verify`를 통과했다(lint·TypeScript·Jest 15 suites/79 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다.

