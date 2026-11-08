## P08-SHOP-LIST 상점 탭 제거

- 상태: IN_PROGRESS. 사용자 요청에 따라 `/shop`의 상점/보관함 전환을 제거하고 전체 상품·카테고리·보유 표시와 미리보기 장착을 유지한다. `/my`의 보유 상품 장착/해제는 유지하고 단일 탭 버튼은 제목으로 바꾼다. 회전 도구 선택은 아직 미확정이므로 이번 범위에 포함하지 않는다.
- TDD: 상점/보관함 버튼 부재·상품 10개 표시 테스트의 미구현 실패 확인. 기존 구매/장착 회귀의 진입 경로를 상품 모달로 갱신하고 보유 상품 관리 단위 검사는 `/my`에서 실행한다.
- 검증: 관련 단위 7개·E2E 5개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 20 tests). 로그 `.bugri-hooks/shop-list-verify.log`. 실제 PC/모바일 화면에서 탭 제거와 상품 목록 표시 확인. 기존 장착/자유 배치/높이/공개 저장 검증은 새 모달 진입 경로로 유지했으며 `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

