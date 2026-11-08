### P05-RESULT-NO-BUGRI — 풀이 결과 캐릭터 제거

- 상태: DONE. 풀이 결과 화면에서 버그리 이미지와 반응 문구를 제거하고 정오·답안·해설·다음 행동만 유지한다. 공통 캐릭터 컴포넌트와 다른 화면의 사용은 변경하지 않는다.
- Node v22.23.3에서 정답·오답 관련 E2E 2개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 20 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.
