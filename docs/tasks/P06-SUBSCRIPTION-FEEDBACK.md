### P06-SUBSCRIPTION-FEEDBACK — 구독 동작 노출·피드백

- 상태: DONE. 개발자 페이지의 미구독 태그는 말줄임표를 숨기고 구독 태그만 해제 메뉴를 제공한다. 태그·개발자 구독 변경 성공은 대상명이 포함된 토스트로 알린다. 개발자 구독 완료 후 상단 버튼은 숨기고 해당 위치의 구독 해제는 제거한다.
- 관련 단위 테스트 7개와 구독·해제 토스트, 미구독 메뉴 숨김, 개발자 구독 버튼 제거를 포함한 E2E 2개를 확인했다. Node v22.23.3에서 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

