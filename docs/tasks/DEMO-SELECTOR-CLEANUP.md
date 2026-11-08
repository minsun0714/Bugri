## DEMO-SELECTOR-CLEANUP — 중복 데모 전환 UI 제거

- 상태: DONE. 헤더 우측 데모 사용자 선택을 유지하고 로그인 상태에도 노출한다. 헤더 하단 배너·상점 프로필 전환 항목·개발자 탐색 오류의 별도 선택 모달을 제거한다. 사용자별 저장과 기능 진입 시 사용자 선택은 유지한다. 관련 기준: PRD AC-13a 및 1단계 더미 사용자 규칙.
- Node v22.23.3 최종 `npm run verify -- -- --workers=2` exit 0: lint·전체 타입·Jest 54 suites/273개·도구 3개·production build·E2E 167개 통과. 로그 `/tmp/demo-final-verify.log`. 변경 코드 Prettier·git diff --check 통과. 생성 타입 부재, 중간 시간 초과, 전역 선택 버튼 검사 실패는 [리뷰·검증 기록](../ux-reviews/DEMO-SELECTOR-CLEANUP.md)에 보존했다. 최종 코드는 기대값 완화 없이 재검증했다.
- 독립 UX/UI R0→C1/R1 수정 1회: 320px 헤더 레이블 줄바꿈 해결. UX가 모바일 전환·키보드 열기/닫기·방문자 복귀 직접 확인, UI가 1280/390/320px 캡처 확인. 필수 미해결 문제 없음. 오류 모바일·스크린리더·작성자/타인 상태의 독립 직접 조작은 미확인. 구현자 외 코드 리뷰 완료.
