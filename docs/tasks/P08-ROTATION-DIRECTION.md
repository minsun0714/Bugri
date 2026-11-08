## P08-ROTATION-DIRECTION 회전 드래그 방향 수정

- 상태: IN_PROGRESS. 오른쪽 드래그에 상품이 반대로 도는 입력 부호를 수정한다. 기존 저장 각도와 렌더링 계약을 유지하고 PC/모바일 직접 회전·저장 회귀와 전체 verify로 검증한다.
- 원인/수정: 렌더러가 저장된 rotationY를 음수로 변환하므로 오른쪽 드래그의 양수 입력이 화면에서 역회전했다. 드래그 입력 부호를 반대로 적용하며 저장 각도·기존 배치·키보드 각도 증감 계약은 유지한다.
- TDD: 방향을 검사하도록 강화한 PC/모바일 E2E 2개가 수정 전 324° 기대/36° 실제로 실패한 것을 확인했다. 수정 후 오른쪽 60px와 왼쪽 30px 드래그, 드래그 중/종료 각도, 저장·복원 E2E 2개 통과.
- 검증: Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 14 suites/75 tests·도구 3 tests·build·Playwright 24 tests), `git diff --check` 통과. 로그 `.bugri-hooks/rotation-direction-verify.log`.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

