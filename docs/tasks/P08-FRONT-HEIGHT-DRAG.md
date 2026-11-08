## P08-FRONT-HEIGHT-DRAG 정면 아이템 드래그

- 상태: IN_PROGRESS. REQ-09/AC-09e. /shop 정면에서 키보드를 아래로 끌면 높이는 1.55에 고정되고 깊이만 크게 변하는 문제를 PC/모바일 E2E로 재현했다. 정면 부근 ±20도에서는 책상을 제외한 아이템의 깊이를 유지하고 세로 드래그로 높이를 변경한다. 상판 스냅은 이 구간에서 생략하며 기존 위쪽 시점의 평면 이동은 유지한다. 관련 및 전체 검증 예정.

- 검증: 수정 전 신규 PC/모바일 E2E 2개가 높이 1.55 고정으로 실패했고 수정 후 관련 E2E 10개 통과. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 94개·도구 3개·build·E2E 57개). 정면 드래그 중 높이 감소·X/Z 유지·바닥 제한·시점 회전 후 좌표 보존 및 기존 상판/확대 회귀를 확인했다. 로그 `.bugri-hooks/front-height-verify.log`. 상태는 IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.

