### UI-POINTER-CURSORS — 상호작용 요소 포인터 커서

- 상태: DONE. 활성 링크·버튼·셀렉트·체크박스·라디오·연결 라벨·summary에 공통 포인터 커서를 적용하고 비활성 요소의 금지 커서는 유지한다.
- UI 전시 화면의 표시 중인 상호작용 요소를 계산된 cursor 값으로 전수 검사했다. Node v22.23.3에서 관련 E2E 1개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.
