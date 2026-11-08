## P08-VERTICAL-CAMERA-DIRECTION 상하 시점 드래그 방향

- 상태: IN_PROGRESS. REQ-09/AC-09e. 사용자가 요청한 대로 공간 상하 회전도 드래그 방향을 따르도록 pitch 입력 부호를 수정한다. 좌우·아이템 조작은 유지한다. PC/모바일에서 위 드래그의 실제 상판 아랫면, 아래 드래그의 윗면, 각도 제한과 초기화 및 기존 정면 배치를 검증한다.

- 구현/검증: pitch 입력을 `drag.pitch + dy * 0.3`으로 수정. 수정 전 위 드래그 시 상판 아랫면이 보이지 않아 PC/모바일 E2E 2개 실패를 확인했다. 기존 각도·픽셀·배치 기대값은 유지하고 시점 진입 제스처만 새 방향에 맞췄다. 수정 후 관련 E2E 14개 및 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 94개·도구 3개·build·E2E 57개). 로그 `.bugri-hooks/vertical-camera-verify.log`. 독립 리뷰 대기로 IN_PROGRESS 유지. push·PR·merge 없음.

