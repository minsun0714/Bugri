### P06-TAG-SUBSCRIBED-STATE — 태그 구독 배경 구분

- 상태: DONE. 개발자 페이지에서 구독한 태그와 구독하지 않은 태그의 칩 배경색을 구분한다. 선택 상태는 별도 링으로 표시해 구독 상태와 동시에 식별할 수 있게 한다.
- 구독 전후 실제 계산된 배경색 변경과 선택 링을 E2E로 검증했다. Node v22.23.3에서 관련 개발자 E2E 1개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

