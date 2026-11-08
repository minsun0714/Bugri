## P08-TRIAL-WHEEL-ZOOM 장착해보기 휠 확대/축소

- 상태: IN_PROGRESS. 미리보기 Canvas 위 마우스 휠로 확대/축소하며 비율은 0.5~2.5로 제한한다. 배치 좌표는 바꾸지 않고 확대 상태의 이동·선택·회전을 유지한다. 초기화/재열기는 기본 배율로 복원하며 Canvas 밖의 페이지 스크롤은 유지한다.
- 검증: 미구현 E2E 2개 실패 확인 후 PC/모바일 확대·축소·상한/하한·확대 상태 드래그·초기화/재열기 복원 및 기존 미리보기 E2E 4개 통과. Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/80 tests·도구 3 tests·build·Playwright 33 tests). 로그 `.bugri-hooks/trial-zoom-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

