## P08-ROTATE-DRAG 회전 드래그 핸들

- 상태: IN_PROGRESS. 사용자 요청에 따라 회전 핸들의 클릭 15도 동작을 제거하고 누른 채 좌우 드래그하는 방식으로 표시한다. 드래그 안내와 잡기 커서를 추가하며 키보드 조절은 유지한다.
- TDD: 단순 클릭 시 각도 유지 기대값으로 변경한 PC/모바일 E2E 2개가 기존 클릭 회전 때문에 실패함을 확인했다. 드래그 중 각도 변경·드롭 저장·새로고침 복원·단순 클릭 무변경을 검증한다.
- 구현: 회전 핸들에 드래그 표시·잡기 커서를 추가하고 포인터 클릭 회전과 2px 이하 흔들림을 무시한다. 드래그 중 실시간 각도 반영·드롭 확정, 키보드 방향키 조절과 기존 높이 핸들 동작은 유지한다.
- 검증: 관련 E2E 2개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 22 tests). 로그 `.bugri-hooks/rotate-drag-verify.log`. `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

