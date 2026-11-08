### P06-TAG-CLICK-SUBSCRIBE — 미구독 태그 클릭 구독

- 상태: DONE. 개발자 페이지의 미구독 태그를 클릭하면 해당 태그를 구독하면서 기존 퀴즈 필터도 적용하고 성공 토스트와 구독 상태 UI를 표시한다.
- 관련 단위 테스트 1개와 구독→해제→재구독 및 필터 유지 E2E 1개를 확인했다. Node v22.23.3에서 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.
