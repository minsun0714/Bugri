### P07-NEXT-DUPLICATE-QUIZ — 동일 문제 재출제 방지

- 상태: DONE. 다른 quizId로 저장된 동일 문제를 완료한 경우에도 다음 문제 후보에서 제외하고, 남은 고유 문제가 없으면 소진 상태와 태그 탐색을 제공한다.
- 다른 quizId에 같은 문제를 복제한 회귀 테스트를 추가해 첫 완료 직후 EXHAUSTED와 null quiz를 확인했다. 첫 전체 검증은 기존 E2E의 중복 출제 기대값 때문에 실패했고 요구사항에 맞게 갱신한 뒤 재검증했다. Node v22.23.3에서 최종 Hook verify를 통과했다(lint·TypeScript·Jest 15 suites/79 tests·production build·Playwright 21 tests). 구현자 외 리뷰는 남아 있다. 근거: `.bugri-hooks/verify-2.log`.

