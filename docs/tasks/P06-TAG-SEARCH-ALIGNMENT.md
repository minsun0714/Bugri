### P06-TAG-SEARCH-ALIGNMENT — 태그 검색 상태·정렬

- 상태: DONE. 태그 필터 전환 중 검색 입력이 비활성화되어 어두워지는 현상을 제거하고 검색 입력과 검색 버튼의 상단 y좌표를 맞춘다. 구독 저장 중 중복 동작 방지는 유지한다.
- 전환 중 검색 입력에 disabled 속성이 생기지 않고 입력·버튼 상단 좌표 차이가 1px 미만인지 E2E로 검증했다. Node v22.23.3에서 관련 개발자 E2E 1개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.

