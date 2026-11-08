### STREAK-SUMMARY-CENTER — 요약 가로·세로 중앙 정렬

- 상태: DONE. 사용자 승인에 따라 데스크톱에서 버그리·연속 학습·일수·오늘 상태 묶음을 왼쪽 영역의 가로·세로 중앙으로 배치한다. 모바일 세로 배치와 기록 탐색 동작은 유지한다.
- [독립 UX·UI 검토](../ux-reviews/STREAK-SUMMARY-CENTER.md): 1280px에서 묶음과 왼쪽 열의 가로·세로 중심 일치, 390/768 세로 배치 유지 확인. UX는 빈 상태·제출 후 상태를 직접 확인했다. 필수 수정 없음, 수정 0회. 전체 키보드·긴 일수는 직접 미확인.
- Node v22.23.3. 최초 E2E 서버 시작 timeout 이후 수동 build와 E2E 6개 재실행 통과. 중앙 정렬 최종 코드 이후 전체 `PLAYWRIGHT_PORT=3337 npm run verify` 통과(lint·TypeScript·Jest 204개·도구3개·production build·E2E123개). 이후 달력 후속 조정은 별도 STREAK-CALENDAR-VOLUME으로 검증한다.

