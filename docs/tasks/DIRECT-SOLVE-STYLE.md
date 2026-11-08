## DIRECT-SOLVE-STYLE — 개별 풀이와 홈 스타일 통일

- 상태: DONE(스타일 범위). 사용자 요청으로 개별 풀이 `/solve`를 홈과 동일한 스타일로 맞춘다. 이미 공통 QuizPanel/AnswerForm/결과 버그리를 사용하므로 중복 컴포넌트를 만들지 않는다. 개별 화면만의768px 제한을 제거해 공통 frame으로 통일하고 하단 홈 링크를 공통 보조영역 스타일로 옮긴다. 풀이/API/정답/기록·홈의 외형은 변경하지 않는다.
- 순수 UI 변경: 별도 UI 설계자의 실제 PC비교, 변경 파일 lint/포맷, PC/mobile과 독립 UX/UI 리뷰, 관련 기존 풀이 검사를 실행한다. 앞선 TAG-QUIZ-CATALOG의 미통과 검증은 별도로 유지하며 이 작업으로 초기화하지 않는다.

- Node v22.23.3 변경 파일 lint/Prettier·단위8개·관련 E2E4개 통과. 독립 UX/UI 실제1440/375/320 및 입력/제출/재풀이/홈이동 R0 완료, 수정0회. [검토·범위·한계](../ux-reviews/DIRECT-SOLVE-STYLE.md). 전체 verify는 이 순수 스타일 변경에서 반복하지 않았으며 TAG-QUIZ-CATALOG의 기존 미해결 검증은 유지한다.

