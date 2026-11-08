### P06-DEVELOPER-TAG-STATE — 태그 hover·구독 상태 정리

- 상태: IN_PROGRESS. 태그명 hover 밑줄을 제거하고 구독 완료 텍스트는 체크 아이콘으로 바꾼다. 구독 전 동작 문구와 선택 태그 표시는 유지하며, 체크 아이콘 버튼의 접근성 이름은 기존 “개발자명·태그명·구독 중”을 유지한다.
- hover 시 실제 text-decoration과 구독 후 빈 시각 텍스트를 검증하는 E2E를 먼저 실패 확인했다. 구독·새로고침 복원, 데스크톱·모바일 표시 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. 태그 hover의 실제 `text-decoration` 제거와 구독 후 시각 텍스트 없음·접근성 이름·체크 아이콘 상태 및 새로고침 복원을 개발자 E2E로 확인했다. Node v22.23.3에서 개발자 E2E 2개와 최종 Hook verify 통과(lint·TypeScript·Jest 15 suites/76 tests·production build·Playwright 19 tests). 근거: `.bugri-hooks/verify-1.log`.
