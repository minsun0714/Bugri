### P06-TAG-SUBSCRIPTION-MENU — 태그 구독 메뉴

- 상태: DONE. 개발자 페이지의 태그 칩은 필터 선택에 집중시키고, 우측 말줄임표 메뉴에서 현재 상태에 맞는 구독 또는 구독 해제를 제공한다. 검색 결과의 명시적 구독 버튼은 유지한다.
- 말줄임표를 세 점 SVG로 중앙 정렬하고 메뉴 열기·구독·새로고침 복원·Escape 닫기를 검증했다. Node v22.23.3에서 관련 단위 테스트 1개·개발자 E2E 2개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

