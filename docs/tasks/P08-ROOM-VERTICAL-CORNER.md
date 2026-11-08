## P08-ROOM-VERTICAL-CORNER 벽 모서리 수직 경계

- 상태: IN_PROGRESS. REQ-09/AC-09e. 확장한 두 벽이 서로 겹쳐 사선 가장자리가 벽 경계처럼 보이는 문제를 실제 Canvas의 서로 다른 높이에서 모서리 X 좌표를 비교해 재현한다. 각 시점의 두 내부 벽을 공통 모서리에서 맞추고 화면 바깥 방향으로만 확장한다.

- 구현/검증: 카메라 방위각에 따라 두 벽의 공통 모서리를 정하고 그 부분에서만 면을 자른다. 반대 끝은 투영 가로 폭을 고려해 화면 밖까지 확장한다. 수정 전 PC/모바일 모서리 X 좌표 비교 2개 실패, 수정 후 두 테마의 수직 경계·배경 채움·장착/복원 관련 E2E 6개 통과. 실제 최소 배율 Canvas에서도 수직 모서리를 확인했다. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 94개·도구 3개·build·E2E 73개), `git diff --check` 통과. 로그 `.bugri-hooks/room-corner-verify.log`. IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.
