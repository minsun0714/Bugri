## P08-COIN-PAGINATION — BugCoin 내역 페이지네이션

- 상태: DONE. 사용자 요청, REQ-09/AC-09a. 최신순 10개씩 표시하고 공통 Pagination에 compact 표시를 추가해 이전/다음·현재/전체 페이지를 제공한다. 사용자 전환 시 첫 페이지, 데이터 감소 시 유효 범위로 보정하며 잔액은 전체 원장 잔액을 유지한다. 기존 wallet 전체 조회 계약은 유지하는 클라이언트 페이지네이션이다.
- 검증: 다중 페이지 경계·정렬·사용자 전환·빈/단일 페이지 단위 검사, PC/모바일 키보드 이동 E2E, 독립 UX 리뷰, 마지막 전체 verify. 기존 implement-feature·ux-designer·ux-review-loop 적용.
- TDD: 21개 내역이 그대로 표시되어 10개 기대 테스트가 실패한 것을 확인한 뒤 구현. PC/390px 구매 회귀·21개 내역 10/10/1 분할·키보드 Enter 이동·잔액 유지·새로고침 첫 페이지 E2E 4개 통과. 데이터 감소 단위 테스트에서 act import 누락을 수정(재시도 1회).
- 관련 단위 7개 통과(페이지 분할·경계·사용자 변경·내역 감소 보정 포함). 독립 UX 최초 리뷰에서 별도 Chromium 1280px/390px의 10/10/1 분할, 이전/다음 비활성화, Enter·Shift+Tab·포커스 유지, 잔액 유지와 가로 넘침 없음 직접 확인. 필수 문제 없음, 수정 0회. 사용자 변경/감소는 리뷰어 코드 검토와 메인 단위 테스트 범위이며 스크린리더 음성은 미검증. 캡처 `/tmp/coin-review-pagination-390.png`, `/tmp/coin-review-pagination-1280.png`.

- 마지막 코드 변경 후 Node v22.23.3 전체 `npm run verify` 통과: lint·TypeScript·Jest 41 suites/195 tests·도구 3 tests·production build·Playwright 121 tests. Hook 직접 실행 로그 `.bugri-hooks/verify-1.log`, 성공 비활성화 확인. 관련 Prettier·git diff --check 통과. 독립 UX/범위 코드 리뷰 완료. 커밋하며 이번 변경은 push·PR·merge하지 않는다.

