## P08-NO-ROTATION-SLIDER 회전 슬라이더 제거

- 상태: IN_PROGRESS. 사용자 요청에 따라 내 데스크와 미리보기의 회전 슬라이더를 제거한다. 작은 회전 화살표 드래그·키보드 회전·각도 표시·저장은 유지한다. 미리보기의 예약 공간도 각도 표시 한 줄 크기로 줄여 선택 시 화면 이동을 방지한다.
- TDD: 슬라이더 부재 단위 테스트의 미구현 실패 확인. 기존 회전 테스트를 화살표 드래그/키보드 조작과 배치 각도 출력으로 변경하고 저장·실패 초안 유지·복원 기대값은 유지한다.
- 검증: 관련 단위 13개·E2E 6개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 22 tests). 로그 `.bugri-hooks/no-rotation-slider-verify.log`. 슬라이더 부재·드래그 중 각도·키보드 회전·실패 초안 보존·저장 복원 확인, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.

