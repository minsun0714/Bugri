### STREAK-PERIODS — 월·년 학습량과 고정 높이

- 상태: DONE. 사용자 최종 승인에 따라 7일 보기를 제거하고 이번 달을 기본으로 하는 월·년 탭으로 정리했다. 두 보기의 카드 높이를 동일하게 유지한다. 월 달력은 6행, 년은 월별 합계와 해당 월 이동을 제공한다. 현재 스트릭은 조회 기간과 독립적이고 사용자 전환 시 이번 달로 돌아간다. API·일별 고유 개수·재풀이 제외 정책은 유지한다.
- [독립 UX·UI 리뷰](../ux-reviews/STREAK-PERIODS.md): C1의 탭별 높이 유지 판단은 사용자 정정으로 철회했다. C2에서 모든 탭의 공통 높이를 구현하고 두 리뷰어가 확인했다. C3는 승인된 주간 제거와 기본 월 변경이며 R3에서 두 리뷰어가 확인했다. 이후 사용자 요청인 연간 2열 × 6행 가로 막대 변경은 STREAK-YEAR-GRID로 별도 검토한다.
- Node v22.23.3. C3 관련 단위 10개와 스트릭 E2E 4개 통과. 앞선 전체 검사에서 별도 3D 장면의 scrollIntoViewIfNeeded가 30초 시간 초과로 실패했고, 해당 파일 2개 테스트를 변경 없이 재실행해 통과했다. 월·년 기본 보기 및 연간 2열 최종 코드 변경 후 `PLAYWRIGHT_PORT=3337 npm run verify` 전체 통과(lint·TypeScript·Jest 199개·도구 3개·production build·E2E 121개). 로그 `.bugri-hooks/verify-2.log`. diff check 통과.
