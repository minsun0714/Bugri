## P08-COIN-REFINE — 내역 시각 개선·5개 페이지

- 상태: DONE. 사용자가 승인한 UI 문제(카드 중첩·잔액/텍스트 위계·PC너비·탭 강조·여백·페이지 조작)를 개선하고 페이지당5개로 변경한다. `/my`를 max-w-3xl로 제한하고 BugCoin을 먼저 배치, 나머지 미구현 영역은 제목 중심의 compact 형태로 유지한다. 기능/데이터 계약은 유지한다.
- 기존 Coin/Tabs/Pagination 재사용, 해당 영역에서만 스타일을 적용한다. 잔액 숫자를 확대하고 거래 사유/금액을 강조, 날짜는 짧게 표시하며 시각·시간대는 접근성 이름으로 보존한다. 지급 양수는 primary색과 부호를 함께 사용한다.
- TDD: 5개 기대 테스트3건 실패 확인 후 구현. 관련 단위·PC/모바일 E2E·독립 UX/실제 화면·마지막 전체 verify로 검증한다.
- 관련 단위9개·PC/모바일 코인/프로필 E2E8개 통과. 독립 UX R0에서 화면 위계·768px너비·모바일5행·필터/페이지·키보드·구매후70/-30 직접 확인. 필수/일반 문제0개, 수정0회. 모바일 이동기의 소폭 스크롤은 선택적 개선으로 보류(가독성 유지). [리뷰/한계](../ux-reviews/P08-COIN-REFINE.md).

- 최종 Node v22.23.3 `npm run verify` 통과: lint·TypeScript·Jest41 suites/199 tests·도구3 tests·build·Playwright123 tests. 로그 `.bugri-hooks/verify-1.log`, 관련 Prettier/diff check 통과. UI리뷰 수정0회, push·PR 없음.

