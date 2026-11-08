## TAG-QUIZ-CATALOG — 태그별 공개 퀴즈 목록

- 상태: IN_PROGRESS. 사용자 요청으로 태그명 링크 → /tags/[hashtagId]/quizzes를 추가한다. 전체 작성자의 활성 PUBLIC 퀴즈 제목·작성자 목록, 페이지네이션, 구독과 명시 학습, 방문자 선택 안내, 빈/오류/없는 태그 복구를 구현한다. API 계약·서비스·화면·관련 테스트와 문서를 수정하며 홈/개발자 목록 내부는 유지한다.
- 검증: API 테스트 우선 실패 확인, 관련 Jest/E2E, 독립 UI 설계·UX/UI 실제 화면 리뷰, 최종 전체 verify.

- 구현과 C1/R1·C2/R2 독립 UX/UI 검토 완료. 태그 링크/목록/구독/학습/개별풀이·귀여운 노트 카드 반영. 최종 전체 lint·타입·Jest238개·도구3개·build 통과, E2E148통과/1실패(URL이 정상 attempt로 전환되는데 테스트는 quiz를 기대). C2 dev 검사2통과/2실패. 재시도3회 한도이므로 전체 완료 아님, IN_PROGRESS 유지. [근거·남은 검증](../ux-reviews/TAG-QUIZ-CATALOG.md).

