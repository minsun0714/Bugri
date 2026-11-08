## P08-TRIAL-ZOOM-REPAIR 조작 후 확대 입력 누락

- 상태: IN_PROGRESS. REQ-09/AC-09e. /shop 장착해보기에서 아이템 조작 후 커서가 회전/메뉴 DOM 위에 남으면 Canvas에만 연결된 wheel 핸들러가 입력을 받지 못하는 문제를 재현했다. 실제 휠로 Canvas 선택 테두리 너비는 86→121로 늘었으나 회전 버튼 위에서는 121로 멈췄다. 공간 뷰포트와 선택 조작 레이어를 같은 wheel 입력 범위로 연결하고 영역 밖 스크롤, 배율 제한, 미리보기 배치/초기화를 유지한다.
- 구현: ThreeView의 공간/선택 오버레이 공통 부모를 명시적 interactionSurface로 엔진에 전달하고 wheel 리스너를 그 영역에 연결한다. Canvas 렌더링·포인터 드래그는 기존 요소를 유지하며 해제 시 동일한 영역에서 리스너를 제거한다. 입력이 영역 밖으로 나가면 기본 스크롤을 유지한다.
- 재현/관련 검증: 수정 전 기존 Canvas 확대 E2E 2개는 통과했지만 조작 후 회전 버튼 위 확대 E2E 2개는 PC/모바일 모두 실패했다. 수정 후 관련 E2E 8개 통과. 실제 회전 드래그 뒤 휠 확대, 메뉴 위 축소, ctrlKey wheel 형태의 트랙패드 확대 입력, 배치 좌표/각도 보존, 모달 스크롤 유지, 영역 밖 wheel 미차단, 초기화 및 기존 배율 상한/하한을 확인했다. TypeScript 통과.
- 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 16 suites/94 tests·도구 3 tests·build·Playwright 53 tests). 로그 `.bugri-hooks/zoom-controls-verify.log`, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.
