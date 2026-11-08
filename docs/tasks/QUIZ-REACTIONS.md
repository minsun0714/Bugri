### QUIZ-REACTIONS — 개별 문제 좋아요·싫어요

- 상태: DONE — 구현·독립 리뷰·전체 검증 완료. AC-05j. 제출 후 개별 문제의 좋아요·싫어요 선택·취소·변경을 사용자·quizId별로 저장한다. 사유·집계는 추가하지 않는다. 재풀이·새로고침 복원 및 실패 보존, 완료/접근 가능 여부 검증을 포함한다.
- [독립 UX/UI·코드 리뷰](../ux-reviews/QUIZ-REACTIONS.md): C1/R1에서 버튼 높이 보완, 수정 1회. PC1280/mobile390 캡처·실제 E2E 조작 증거를 간접 리뷰했으며 필수 미해결 문제 없음. 음성 출력·실제 Tab/다크 테마·로딩/모바일 오류 화면은 미확인.
- Node v22.23.3. 신규 API 테스트 의도한 선실패 후 4개 통과, 관련 API/HTTP 15개 및 평가 E2E 3개 통과. 변경 ESLint/Prettier·타입·diff 검사 통과. 수정/재실행 1회는 빈 줄 lint 정리, 2회는 기존 API 개수 고정 기대값 51→53 및 신규 GET/PUT 경로 검증 추가였다. 첫 전체 검증은 해당 고정값 테스트에서 멈췄으며 실패 기록 `/tmp/bugri-reactions-verify.log`를 유지한다.
- 최종 `npm run verify` exit 0: lint·타입·Jest 61 suites/308개·도구3개·production build·E2E194개 통과. 로그 `/tmp/bugri-reactions-verify-r2.log`. 검증 후 변경은 TASKS/리뷰 기록뿐이며 코드·테스트·의존성·런타임은 동일하다.

