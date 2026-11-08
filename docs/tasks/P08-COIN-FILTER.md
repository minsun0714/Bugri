## P08-COIN-FILTER — 지급·사용 필터

- 상태: DONE. 사용자 요청/REQ09 AC09a. 전체·지급(+)·사용(-) 탭으로 원장 금액 부호를 필터링한 뒤 최신순10개 페이지네이션한다. 필터 변경은 첫 페이지, 사용자 변경은 전체/첫 페이지. 잔액은 전체 잔액 유지. 0금액은 전체에서만 표시. 선택 결과 없음을 안내한다.
- 기존 공통 Tabs를 재사용하며 API/원장/지급량은 변경하지 않는다. 단위 테스트에서 탭 부재로 실패한 뒤 구현했다. 정상·빈·혼합 부호·페이지/사용자 초기화와 PC/모바일 키보드 E2E, 독립 UX 및 마지막 전체 verify로 검증한다.
- 관련 단위9개·PC/모바일 E2E6개 통과. 새 컨텍스트 독립 UX 리뷰에서 사용빈→구매→사용-30/잔액70, 지급/전체복귀·페이지 초기화·방향키·모바일 직접 확인. 필수 문제0개, 수정0회. [관점별 리뷰 및 한계](../ux-reviews/P08-COIN-FILTER.md).

- Node v22.23.3 최종 `npm run verify` 통과: lint·TypeScript·Jest41 suites/199 tests·도구3 tests·build·Playwright123 tests. 로그 `.bugri-hooks/verify-1.log`, 관련 Prettier/diff check 통과. 커밋하며 push·PR은 하지 않는다.

