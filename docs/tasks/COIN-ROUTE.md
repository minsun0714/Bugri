### COIN-ROUTE — 코인 내역 전용 페이지

- 상태: DONE(로컬 검증). 사용자 요청에 따라 `/my`를 `/coin-history`로 변경하고 풀이 기록·학습 시간대 설정 자리표시자를 제거한다. REQ-09의 잔액·거래 내역 규칙은 유지한다.
- 범위: 페이지·프로필 메뉴·브레드크럼·관련 문서/테스트. 기존 `/my`는 사용자 쿼리를 보존해 새 경로로 연결한다. `/my/desk`는 유지한다.
- 검증: 페이지 이동 변경으로 scoped lint/format, 전체 타입 검사, 관련 Jest와 navigation/profile/coin E2E 및 독립 UX/UI 화면 리뷰.

- 결과: Node v22.23.3 scoped ESLint/Prettier·전체 TypeScript·Jest 4 suites/19개·production build·관련 E2E 16개 통과. 최초 타입 오류 수정 1회 후 통과. 전체 verify는 미실행(페이지 이동 변경의 로컬 완료 범위).
- 독립 UX/UI R0와 코드 리뷰 완료, 필수 문제 없음·UI 수정 0회. [리뷰 및 검증 근거](../ux-reviews/COIN-ROUTE.md). 화면은 PC/모바일 캡처, 조작은 E2E 근거로 확인. 로딩·오류·게스트 시각 상태는 이번 리뷰에서 미확인.
