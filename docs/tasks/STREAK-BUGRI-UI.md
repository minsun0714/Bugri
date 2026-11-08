### STREAK-BUGRI-UI — 버그리와 절제된 학습 기록

- 상태: DONE. 사용자 승인에 따라 불꽃 대신 공통 Bugri의 초기/응원/완료 표정을 사용하고, 주간 캡슐·배지·오늘 테두리를 작은 완료 표시와 요일로 단순화했다. 기간을 시작일–종료일로 명시하고 숫자/상태 강조를 낮췄다. 기록 상세와 API 정책은 추가하지 않는다.
- [독립 UX 리뷰](../ux-reviews/STREAK-BUGRI-UI.md)에서 768px 상태 제목 단어 분리를 발견해 좌측 최소240px로 수정했다. C1/R1 1회 후 768px 최초/재시작 한줄, 390/1280 회귀없음 직접 확인. 오류·전체 키보드·스크린리더·다른 사용자 격리는 독립 리뷰 미확인으로 남겼다.
- Node v22.23.3 관련 단위5개·E2E2개 통과. C1 이전 첫 전체검사는 통과했지만 최종 근거로 대체하지 않고 마지막 코드 변경 뒤 `PLAYWRIGHT_PORT=3337 npm run verify` 재실행 통과(lint·TypeScript·Jest193개·도구3개·production build·E2E119개). 로그 `.bugri-hooks/streak-bugri-final-verify.log`, diff check 통과. 캡처 `.bugri-hooks/previews/streak-bugri/`. 구현자 외 코드 리뷰·최종 디자인 판단은 남아 있다.

