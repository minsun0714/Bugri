### QUIZ-UI-MERGE — 최신 오류 처리와 퀴즈 UI 통합

- 상태: DONE. dev `2baec2e`를 통합한 `b298fea`에서 태그별 퀴즈 페이지의 import 충돌을 해결했다. 공통 QuizCard와 createQueryClient를 모두 보존하고 오류 처리·공개 학습 기록·다중 태그 필터 동작을 유지한다. 독립 통합 코드 리뷰에서 추가 문제 없음.
- Node v22.23.3. `npm run verify -- -- --workers=1` exit 0: lint·타입·Jest59 suites/297개·도구3개·production build·E2E184개 모두 통과. 로그 `/tmp/bugri-tag-panel/verify-merge.log`. 검증 후 변경은 이 문서 기록뿐이다.
