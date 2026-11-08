# PROFILE-SUBSCRIPTION-STATE — 프로필 구독 상태 버튼

- 상태: DONE (로컬 범위 검증·독립 리뷰 완료)
- 요청: 개발자 구독 해제 버튼을 구독 중 상태로 표시. REQ-08/AC-08a의 등록·해제·현재 조건 확인 유지.
- 범위: 로그인 공개 프로필에 기존 SubscriptionControl 재사용. 미구독은 + 구독하기, 구독은 ✓ 구독 중과 관리 메뉴로 통일. 방문자·카탈로그 동작 유지.
- UX/UI 사전 논의: 상태 문구 일치에 동의. UX 의견에 따라 관리 메뉴를 재사용하여 즉시 해제 혼동 방지. 화살표는 실제 메뉴 동작과 함께 사용.
- 검증 계획: 변경 파일 lint/format, 전체 타입, developer 단위, 프로필 구독 PC/모바일 E2E와 독립 UX/UI 리뷰. 상점·3D 동작 영향 없어 전용 spec 제외. Hook 미사용.

- Node v22.23.3, a72d943 + 본 변경에서 변경 코드/테스트 ESLint·Prettier, 전체 TypeScript, developer 단위 4개, 프로필 구독 E2E 2개(1280/390, worker 1) 통과. E2E 서버 production build 성공. 마지막 테스트 포맷 변경은 공백뿐이며 동작 결과 재사용.
- 최초 TDD 2개 실패 확인 후 구현. E2E 처음 두 실행의 Toast exact locator 실패는 role=status+문구 선택으로 수정해 통과. 마지막 E2E 파일 포맷 검사 실패는 Prettier 적용 후 통과. 테스트 조건/타임아웃 완화 없음.
- [독립 UX/UI 리뷰](../ux-reviews/PROFILE-SUBSCRIPTION-STATE.md): R0 완료, 추가 수정 0회. 두 리뷰어가 최신 PC/모바일 캡처 6장씩 확인. 방문자·본인은 코드/단위 근거, 실제 기기·실패/저장중·다크/영문 화면 미확인.
- 작은 컴포넌트 동작 변경의 로컬 검증이며 전체 테스트/PR 최종 검증은 미실행. push/PR/merge 미실행.

## 후속: 비로그인 버튼 문구

- 상태: DONE. 사용자 지적에 따라 구현 환경 설명을 제거하고 비로그인 버튼을 `구독하기`로 통일. 기존 signIn 경계와 사용자 선택 후 명시적 구독 동작은 유지. 인증 자체 교체는 이번 범위 아님.
- 후속 검증: 변경 파일 lint/format·전체 타입·단위4·PC/모바일 E2E2 통과. 최초 테스트 옵션 타입 오류 수정 후 통과. 동일 UX/UI 리뷰어 R1에서 방문자 캡처2장씩 직접 확인, 추가 문제 없음.

## PR 검증

- 검증 코드 b992863, Node22.23.3. 전체 lint/타입/Jest/도구/build 및 상점·3D 전용을 제외한 E2E 27개 spec 실행 완료. 프로필·탐색·공통 이동/언어/theme 혼합 spec 유지. 상점 구매·3D 배치/회전/렌더링은 코드 영향 없어 제외.
- 최종 결과: lint·전체 타입·Jest69 suites/362개·도구3개·production build·선정 E2E142개 모두 통과. E2E worker1, 포트3109, 로그 `/tmp/bugri-subscription-pr-e2e.log`. 코드 b992863 이후 검증 기록만 변경.
- E2E 실행 spec: tests/e2e/bugcoin-rewards.spec.ts, tests/e2e/coin-history.spec.ts, tests/e2e/design-system.spec.ts, tests/e2e/developer-discovery-repair.spec.ts, tests/e2e/developer.spec.ts, tests/e2e/discovery-split.spec.ts, tests/e2e/error-handling.spec.ts, tests/e2e/home-quiz-review.spec.ts, tests/e2e/locale.spec.ts, tests/e2e/markdown-editor.spec.ts, tests/e2e/mock-api.spec.ts, tests/e2e/navigation.spec.ts, tests/e2e/profile-about.spec.ts, tests/e2e/profile-layout.spec.ts, tests/e2e/profile-order.spec.ts, tests/e2e/profile-polish.spec.ts, tests/e2e/profile-split.spec.ts, tests/e2e/profile-streak.spec.ts, tests/e2e/profile-subscription-state.spec.ts, tests/e2e/quiz-authoring.spec.ts, tests/e2e/quiz-card-actions.spec.ts, tests/e2e/quiz-reactions.spec.ts, tests/e2e/solving.spec.ts, tests/e2e/streak.spec.ts, tests/e2e/tag-catalog.spec.ts, tests/e2e/tag-discovery.spec.ts, tests/e2e/theme.spec.ts
