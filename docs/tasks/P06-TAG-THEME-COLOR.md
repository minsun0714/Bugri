### P06-TAG-THEME-COLOR — 구독 태그 테마 색상

- 상태: DONE. 구독 태그의 배경·테두리와 선택 링을 브랜드 primary 계열로 통일하고, 미구독 태그의 중립 배경과 구분한다.
- 구독 전후 primary 배경색 변경과 선택 링을 E2E로 검증했다. Node v22.23.3에서 관련 개발자 E2E 1개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

