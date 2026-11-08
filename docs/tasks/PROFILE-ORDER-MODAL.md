## PROFILE-ORDER-MODAL — 순서 편집 모달

- 상태: DONE(로컬 범위 검증·독립 리뷰 완료). 사용자 요청으로 본문 편집용 큰 컨테이너를 제거하고 공통 Modal의 간결한 세 행으로 이동 조작을 옮긴다. 본문은 저장 전까지 기존 순서·크기 유지, 저장/공개 조회 API 유지. 취소·닫기·Escape는 초안 폐기, 저장 실패 시 모달/초안 유지. UI 동작 변경으로 scoped 정적 검사·전체타입·관련 Jest 및 production E2E·독립 UX/UI 리뷰 수행. API/공통UI 변경 없음.
- 새 모달/초안 격리 요구의 Jest2개 최초 실패 확인 후 구현하여 통과.

- Node v22.23.3: 변경파일 ESLint/Prettier·전체 타입·관련 Jest10개 통과. production build 및 E2E8개(순서모달1280/390/320, 기존프로필배치3개·분리2개) 통과. 저장전 본문 순서/높이 보존, 모달500px미만, 드래그/키보드, 취소/닫기/Escape/초점, 저장실패후재시도, 방문자/타인 복원 검증. 기존 본문 장거리 edge scroll 테스트는 제거된 동작으로 모달 내 세 행 조작 테스트로 교체했다. 로그 `/tmp/profile-modal-e2e.log`, `/tmp/profile-modal-unit.log`, `/tmp/profile-modal-types.log`.
- [독립 UX/UI R0](../ux-reviews/PROFILE-ORDER-MODAL.md): UX는320/390실제브라우저핵심흐름·코드검토, UI는9개PC/mobile캡처 검토. 필수문제0개/수정0회, 작은화살표glyph 선택개선 보류. 실기기터치/스크린리더/낮은높이 미확인. API·저장·공통UI·의존성 변경 없이 로컬 동작 변경으로 전체 verify는 재실행하지 않았다. 검증 후 변경은 문서 기록뿐이며 로컬 커밋한다.


