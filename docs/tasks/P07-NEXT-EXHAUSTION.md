### P07-NEXT-EXHAUSTION — 다음 문제 소진 처리

- 상태: DONE. 선택 태그의 미풀이 문제를 모두 완료하면 완료 문제를 다시 순환하지 않고 소진 상태와 태그 탐색만 제공한다. 재생 모드 결과에서도 다음 문제 대신 태그 탐색을 표시한다.
- 일반 학습 소진 시 Attempt 수가 늘지 않는 흐름과 재생 모드 결과에서 다음 문제를 숨기는 E2E를 포함해 관련 E2E 4개를 확인했다. Node v22.23.3에서 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/78 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-1.log`.
