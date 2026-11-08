## P08-CLEAN-DESK-COPY 배치 수치와 안내 정리

- 상태: IN_PROGRESS. 사용자 요청에 따라 내 데스크·장착 미리보기의 좌표/회전 수치, 상시 조작 안내·미리보기 설명과 예약 여백을 제거한다. 카메라 각도도 화면에서 숨기고 키보드 사용자의 배치 피드백은 스크린리더 전용으로 유지한다. 구매/장착·저장 실패 안내와 편집 조작은 유지한다.
- 검증: 문구/표시 정리이므로 별도 로직 테스트 추가 없이 기존 직접 조작·저장 회귀와 전체 verify, 실제 화면 확인을 수행한다.
- 검증: 관련 직접 조작 E2E 2개 통과 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/73 tests·도구 3 tests·build·Playwright 22 tests). 로그 `.bugri-hooks/clean-desk-copy-verify.log`. 실제 모바일 화면에서 수치/문구/예약 여백 제거 확인, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.
