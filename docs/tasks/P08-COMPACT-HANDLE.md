## P08-COMPACT-HANDLE 작은 회전 화살표

- 상태: IN_PROGRESS. 사용자 요청에 따라 선택 테두리 모서리 위로 돌출된 작은 회전 화살표로 바꾸고 상하 화살표 핸들을 제거한다. 28px 조작 영역·20px 아이콘, 회전 드래그·키보드·기존 높이 입력/저장은 유지한다.
- 검증: PC/모바일 회전 핸들 크기·상하 핸들 부재·드래그/저장 회귀, 높이 입력·가림·저장 회귀와 전체 verify. 요청에 따라 높이 E2E 진입을 제거된 핸들에서 기존 숫자 입력으로 변경한다.
- 검증: 관련 E2E 3개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 22 tests). 로그 `.bugri-hooks/compact-handle-verify.log`. 모바일 실제 화면에서 작은 화살표와 연결선 확인, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.
