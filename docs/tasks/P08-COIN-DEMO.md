## P08-COIN-DEMO — 화면용 예시 내역

- 상태: DONE. 사용자 요청에 따라 테스트 내부 fixture만 있던 한계를 수정한다. 기본 100 BugCoin을 25개 날짜별 데모 지급(+4)으로 나눠 실제 `/my`에서 10/10/5 페이지를 표시한다. 보상 정책이나 학습 완료 기록을 꾸며 넣지 않고 `SEED` 사유/데모 지급 문구를 사용한다. 실제 더미 구매는 기존 PURCHASE 원장으로 표시된다.
- 기존 원장의 원본 seed-balance 항목만 동일 합계로 한 번 변환하고 나머지 원장·구매·보관함·잔액은 보존한다. 해당 seed가 없는 사용자 기록에는 임의 내역을 넣지 않는다. 사용자별 marker와 단일 저장 경계를 사용한다.
- TDD: 기본 원장 1개가 20개 초과 기대를 만족하지 못하는 실패 확인. 단위·실제 기본 내역 E2E·새 컨텍스트 독립 UX 리뷰·최종 verify 예정.
- 관련 단위 8개 및 E2E4개 통과. 독립 UX 리뷰는 새 컨텍스트로 기본 내역/페이지 이동/키보드/모바일 구매→차감을 직접 확인했고 필수 문제 없음, 수정0회. [리뷰 기록](../ux-reviews/P08-COIN-DEMO.md)에 관점별 근거와 미확인 상태를 기록했다.
- 첫 전체 verify는 새 테스트의 줄 간격 lint3건으로 실패해 scoped ESLint/Prettier 후 재검증했다(수정·재실행1회). 기능 기대값 변경 없음.

- 최종 Node v22.23.3 `npm run verify` 통과: lint·TypeScript·Jest41 suites/197 tests·도구3 tests·build·Playwright121 tests. 로그 `.bugri-hooks/verify-2.log`. diff check/관련 Prettier 통과. 미리보기 전용 서버3149에서 실제 화면 확인 가능. 커밋하며 push·PR은 하지 않는다.

