### QUIZ-CARD-UNIFY — 퀴즈 목록 카드 통일

- 상태: DONE. 사용자 승인에 따라 프로필의 노트 아이콘·둥근 카드·하단 그림자·화살표를 공통 QuizCard로 추출해 프로필/개발자별/태그별/내 퀴즈에 적용한다. 프로필 2열, 다른 목록 세로 배치와 검색·필터·페이지 이동·작성자/상태/수정 시간·풀이/관리 동작을 유지한다. REQ-03 및 공개 탐색/프로필 요구사항을 변경하지 않는다.
- 검증: Node v22.23.3 `npm run verify` exit 0 — lint·타입·Jest 54 suites/271개·도구 3개·production build·E2E 167개 통과. 변경 파일 ESLint/Prettier 및 diff 검사 통과. [독립 UX/UI 리뷰](../ux-reviews/QUIZ-CARD-UNIFY.md): PC1280/mobile390의 4개 목록, 긴 제목·태그3개·공개/비공개/검토 상태 확인. 필수 문제 없음, 수정 0회. 검증 이후 문서 기록만 변경했다.
