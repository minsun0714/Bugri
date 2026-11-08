### DEVELOPER-TAG-PANEL — 다중 필터와 독립 구독 패널

- 상태: DONE — 구현 및 독립 UX/UI 리뷰, 전체 검증 완료. AC-12j. 외부 라이브러리 없이 공통 ResponsivePopover(PC Popover/모바일 Drawer)와 FilterChips를 구현했다. 헤더에서 전체·태그 구독을 검색/페이지 단위로 관리하고 기존 위치의 필터는 펼친 다중 선택(OR)을 제공한다.
- Node v22.23.3. API 다중 태그 선실패 후 통과, 관련 단위 13개 및 PC/mobile/guest/empty E2E 4개 통과. [독립 UX/UI 리뷰](../ux-reviews/DEVELOPER-TAG-PANEL.md)는 C2/R2(수정 2회)에서 짧은 화면 페이지 조작 잘림 해결, 독립 코드 리뷰 추가 문제 없음. C2 production build 통과. 이후 짧은 화면 E2E 2개와 HTTP 직렬화 테스트를 추가했지만 전체 실행은 아래 lint에서 멈췄으므로 신규 테스트 통과를 주장하지 않는다.
- 실패/재실행: (1) signIn 인자 타입 수정, (2) Testing Library의 미지원 exact 옵션 제거, (3) 다중 필터 navigation 직후 reload를 실행하던 E2E에 URL/결과 반영 대기 추가 후 관련 검사 통과. TDD 최초 실패는 제외한다.
- 최초 전체 검증은 HTTP 테스트의 구조 분해/빈 줄 lint 2건으로 중단했다. 사용자 재개 지시로 `fetcher`의 `mock.calls`를 중첩 구조 분해하고 빈 줄을 수정했다. 수정 파일 정적 검사 통과 후 `npm run verify -- -- --workers=1` exit 0: lint·타입·Jest 56 suites/281개·도구 3개·production build·E2E 175개 모두 통과. 최종 전체 실행은 짧은 화면 E2E 2개 및 HTTP 반복 쿼리 테스트도 포함한다. 로그 `/tmp/bugri-tag-panel/verify-resumed.log`. 검증 후 변경은 문서 기록뿐이다.

