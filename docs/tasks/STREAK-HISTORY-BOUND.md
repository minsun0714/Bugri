### STREAK-HISTORY-BOUND — 기간 선택과 학습 기록 탐색 하한

- 상태: DONE. 사용자 승인에 따라 첫 학습 기록이 있는 연도·월까지만 이동하고 기록이 없으면 올해·이번 달만 표시한다. 연간 첫 기록 이전 월 진입도 막는다. API가 제공하는 완료일과 양수 일별 개수에서 첫 기록을 찾고 빈 중간 기간은 유지한다. 후속 승인에 따라 월·년 탭을 제거하고 날짜 제목 → 월 목록 → 제목 아래 연도 드롭다운으로 바꿨다. 연도 메뉴를 열어도 월별 기록·합계를 유지하며 카드 높이와 선택 후 초점 복귀를 보존한다.
- [독립 UX·UI 리뷰](../ux-reviews/STREAK-HISTORY-BOUND.md): R0의 빈 연도 화면을 사용자 스크린샷이 지적해 종료 판단을 철회했다. C1에서 공통 Dropdown compact variant를 추가하고 R1에서 단일 연도 작은 메뉴·월 목록 유지·동일 높이·키보드/외부 클릭을 직접 확인했다. 수정 1회. 수십 년 목록 스크롤·스크린리더 음성은 미확인이다.
- Node v22.23.3. 마지막 C1 코드 변경 후 전체 `PLAYWRIGHT_PORT=3337 npm run verify` 통과(lint·TypeScript·Jest 204개·도구 3개·production build·E2E 123개), 로그 `.bugri-hooks/verify-1.log`. 관련 단위 15개·E2E 6개 통과, diff check 통과. 최초 E2E의 이전 탭 초기화 가정 및 C1 제목 높이 1.328px 차이를 각각 수정하고 기대값을 완화하지 않았다. 캡처 `.bugri-hooks/previews/streak-history/`.

