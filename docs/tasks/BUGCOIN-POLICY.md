## BUGCOIN-POLICY — 풀이 보상 정책

- 상태: IN_PROGRESS(구현 반영, 전체 E2E 검증 차단). REQ-09/AC-09a 및 사용자 확정 금액. 기존 제출·지갑·사용자별 저장을 재사용하며 순수 BugCent 계산, 멱등 지급, 출제 보상, 168시간 복습을 검증한다. CRUD·디자인·상점 기능은 중복 구현하지 않는다.
- 기존 문서의 지급량 미결정/기본0을 이번 요청으로 대체한다. 방문자 체험에는 저장 세션이 없으므로 익명 청구는 후속 계약으로 남긴다.
- 구현: `services/bugcoin.ts` 순수 정수 계산, `answer` 완료와 solver/creator 지급 동시 저장, 수령자별 wallet/구매 잔액 합산, 불변 생성 시각, 결과 합계·내역 연결. 기존 schemaVersion1 원장/가격 단위와 명시적 dailyReward 테스트 fixture를 호환한다.
- 테스트 우선: 신규 모듈 부재·API 지급 필드 미구현·결과 표시 미구현 실패를 각각 확인 후 구현했다. 요구13항목을 계산/API 테스트20개로 검증하고 결과 컴포넌트1개·PC/모바일 E2E2개를 추가했다.
- 독립 코드 리뷰: 생성 시각 복원 검증 보완 및 실제 Revision 변경 테스트로 강화, 재리뷰 차단 사항 없음. [독립 UX/UI R0](../ux-reviews/BUGCOIN-POLICY.md) 필수 문제0, UI수정0회; 직접 조작과 캡처 리뷰의 한계 구분.
- 검증 환경: Node22.23.3. 불완전 node_modules는 기존 디렉터리를 /tmp에 보관하고 동일 lockfile의 별도 경로 npm ci로 복원(패키지/lockfile 변경 없음). 관련161개와 최종 집중25개 통과, 변경파일 Prettier·lint·타입·diff 검사 통과. Stop Hook을 arm 후 스크립트에 이벤트를 직접 전달해 전체 verify 실행(세션 자동 로드 여부 미확인); 3430부터 자동 포트 선택. 최종 결과는 아래에 기록한다.
- 통합 주의: `contracts.ts`, `mock-service.ts`, `storage.ts`와 풀이 화면 변경을 함께 반영. 생성 경로 두 곳의 createdAt과 RewardReason·rewards 복원 검증을 누락하지 않는다. 기존 coin 단위 가격/원장에 cents를 그대로 넣지 않는다. 익명 청구는 세션 부재로 후속 계약만 문서화.
- 첫 전체 verify: lint·타입·Jest332개·도구3개·build 통과, E2E198/199 통과. 기존 mock-api E2E가 보상0 시절 잔액70을 기대해 실제72와 불일치했다. 확정 정책(100+1+1−30)에 맞춰72 및 두 사유 각1건 검증으로 갱신했으며 앱 코드 변경 없음. 관련 E2E4개 재실행 통과 후 같은 Hook 상태로 최종 전체 재검증했다.

- 최종 전체 검증: Hook3회차 lint·typecheck·Jest64 suites/332 tests·도구3개·build 통과, Playwright192/199 통과·7실패. 보상 E2E2개 및 mock-api2개는 모두 통과. 2회차 시간초과3개가 있던 파일은 별도 재실행12개 모두 통과했으나, 최종 실행에는 다른 기존 화면의 실패도 발생했다. 보상 외 실패를 해결한 것으로 간주하지 않는다.
- 미해결 E2E: desk-visibility(390), developer-discovery-repair 모바일구독, item-tabletop 모니터(390), navigation 현재위치, room-theme-bugri(1100), shop-extra-items(1100), shop-tryon-edit(1100). 시간초과·브라우저 종료/디스플레이오류·탐색 assertion이 관찰됨. 실제 원인 확정 전 환경 문제로 단정하지 않는다. `.bugri-hooks/verify-1.log`~`verify-3.log` 보존, Hook blocked 기록 후 비활성화. 재시도 한도에 따라 추가 반복 없이 전체 완료/DONE 판정 보류.
- 변경 파일: API `src/api/constants.ts`, `contracts.ts`; 서비스 `src/services/bugcoin.ts`, `mock-service.ts`, `state.ts`; Mock `src/mocks/adapter.ts`, `quizzes.ts`, `storage.ts`; 화면 `src/components/coins/coin-history.tsx`, `src/components/solving/quiz-panel.tsx`, `solve-screen.tsx`; 테스트 `tests/unit/api/bugcoin.test.ts`, `bugcoin-flow.test.ts`, `tests/unit/quiz-panel.test.tsx`, `tests/e2e/bugcoin-rewards.spec.ts`, `mock-api.spec.ts`; 문서 `docs/PRD.md`, `ARCHITECTURE.md`, `API.md`, `BUGCOIN_POLICY.md`, `TASKS.md`, `ux-reviews/BUGCOIN-POLICY.md`.
