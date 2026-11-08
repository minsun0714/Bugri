## P08-DESK-OCCLUSION 드래그 중 상품 가림 수정

- 상태: IN_PROGRESS. 키보드를 책상 위에서 이동할 때 사라지는 사용자 보고를 재현하고 렌더 순서를 수정한다. 좌표 저장/경계 규칙은 유지한다.
- 검증: 실제 Canvas의 키보드 색 픽셀을 검사하여 상판 앞/뒤/좌우 이동 중 표시, 드롭·복원, 회전 시점·모바일·타인 데스크를 검증한다. 기존 이동 E2E는 좌표만 확인했으므로 시각 회귀 검사를 추가한다.
- 원인: Zdog의 중심 깊이 정렬로 큰 상판이 뒤쪽 키보드보다 나중에 그려져 실제 상품을 덮었다. 좌표는 정상 상판 높이 1.55였으며 재현 캡처에서 뒤쪽으로 이동한 키보드가 일부만 보였다. 초기 시각 E2E는 데스크톱에서 키보드 색 픽셀 0, 모바일에서 39를 검출해 실패했다.
- 수정: 위에서 보는 카메라·상판 고정 높이 조건에 맞춰 책상 자체와 상판 위 상품의 렌더 순서를 분리했다. 상품끼리는 깊이 정렬을 유지하고, 각 상품의 부품을 하나의 그룹으로 묶었다. 키보드 몸체 다음에 키캡을 그려 몸체가 키캡을 덮는 현상도 수정했다. 좌표·구매·저장 API는 변경하지 않았다.
- 시각 회귀 테스트: 1100px/390px에서 이동 전 키보드 몸체 색 픽셀 대비 80% 이상 유지, 네 모서리 드래그·드롭·새로고침·정면/위/45도 시점·키보드 90도 회전·시점 한 바퀴·공개 데스크 표시. 기존 이동/터치 취소 E2E 포함 관련 4개 통과 후 최종 전체 검증을 실행했다.
- 최종 Node v22.23.3 `PLAYWRIGHT_PORT=3114 npm run verify` 통과(lint·TypeScript·Jest 12 suites/66 tests·build·Playwright 11 tests). 로그 `.bugri-hooks/visibility-verify.log`. 변경 파일 Prettier와 `git diff --check` 통과. 수정 전/후 캡처 `.bugri-hooks/previews/keyboard-disappear.png`, `keyboard-fixed.png` 확인.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.
- 후속 자동 Hook 검증은 기본 포트 3107 점유로 Playwright 서버 시작 전에 실패했다(`.bugri-hooks/verify-1.log`). lint·TypeScript·단위 66개·build는 통과했고 자동 E2E는 미실행이다. 앞선 전용 포트 3114 수동 전체 검증 통과와 구분한다. 후속 조사 시 3107 리스너는 확인되지 않았다. Hook 지시대로 환경 blocked 처리했으며, Hook 실행 환경에 전용 `PLAYWRIGHT_PORT` 전달 후 재검증이 필요하다. DONE으로 표시하지 않는다.

