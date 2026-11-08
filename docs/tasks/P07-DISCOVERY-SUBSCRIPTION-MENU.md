### P07-DISCOVERY-SUBSCRIPTION-MENU — 탐색 카드 구독 해제 메뉴

- 상태: DONE. 개발자·태그 탐색 결과에서 구독 중인 카드의 큰 구독 해제 버튼을 제거하고, 카드 우측 말줄임표 메뉴 안에서 구독을 해제한다. 미구독 항목의 구독하기와 구독 항목의 학습하기는 유지한다.
- 개발자 카드의 메뉴 해제 단위 테스트와 개발자·태그 카드 메뉴 전환, Escape 닫기, 검색 조건 유지 E2E를 확인했다. Node v22.23.3에서 최종 `PLAYWRIGHT_PORT=3125 npm run verify`를 통과했다(lint·TypeScript·Jest 15 suites/79 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다.
