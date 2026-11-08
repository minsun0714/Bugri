### A · 생성 후보 검토 진입·삭제 — DONE

- 후보별 `검토·승인`을 제거하고, 남은 후보가 모두 임시저장 또는 바로 공개로 처리된 뒤에만 상단에 단일 검토 진입을 표시한다.
- 현재 후보를 삭제하는 타입 API·Mock 서비스·UI를 추가했다. 이미 저장·공개한 후보는 연결 퀴즈도 soft delete하며, 삭제 후 탭·편집 초안 인덱스를 재정렬한다.
- 의도한 단위 테스트 실패를 확인한 뒤 API 권한·충돌·HTTP 직렬화, UI 노출 조건·삭제, 검토 이동·새로고침 복원을 검증했다. Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 20 suites/84 tests·production build·Playwright 16 tests. 독립 리뷰는 남아 있다.

