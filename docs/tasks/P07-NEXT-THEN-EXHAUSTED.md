### P07-NEXT-THEN-EXHAUSTED — 결과 후 소진 화면 전환

- 상태: DONE. 마지막 문제 결과에서도 바로 태그 탐색으로 바꾸지 않고 다음 문제를 유지한다. 다음 문제를 누른 뒤 남은 문제가 없을 때 소진 제목·안내·태그 탐색 화면으로 전환한다.
- 재생 모드도 다음 문제 요청 후 일반 미풀이 모드로 종료해 자동 재선택을 막고, 선택 태그 소진 안내의 제목·설명·태그 탐색을 E2E로 확인했다. Node v22.23.3에서 관련 API 단위 테스트 28개·풀이 E2E 2개와 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/79 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.
