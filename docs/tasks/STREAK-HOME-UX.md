### STREAK-HOME-UX — 스트릭 요약 밀도 개선

- 상태: DONE. 사용자 피드백에 따라 큰 카드와 반복 미완료 문구를 줄이고 일수/오늘 상태를 중심으로 최근 7일을 요일로 간결하게 표시했다. 0일은 시작 상태로 표현하고 시간대는 공통 접근성 툴팁으로 이동했다. API·집계 규칙은 유지한다.
- Node v22.23.3에서 관련 단위 4개·신규 문구/Tooltip focus·Escape를 반영한 E2E 1개 통과. 최종 Hook 수동 호출의 전체 verify 통과(lint·TypeScript·Jest 192개·도구 3개·production build·E2E 118개). `git diff --check` 통과. 기존 표시 문구 기대를 승인된 디자인 변경에 맞췄으며 집계/격리 검증은 유지했다.
- 독립 UX 리뷰는 실제 1280×900/390×844 초기·완료 상태의 밀도/위계/퀴즈 위치와 Tooltip 키보드를 검토했다. 카드 높이 데스크톱 262→122px, 모바일 246→194px. 필수 수정 없음(수정 0회). 선택적 의견: 넓은 화면의 요약/주간 표시 간격과 오늘 표시가 버튼처럼 읽힐 가능성. 현 우측 정렬 유지도 타당하다는 리뷰에 따라 보류했다. 오류 상태·스크린리더 음성은 이번 리뷰에서 미실행. 캡처 `.bugri-hooks/previews/streak-ux/`. 구현자 외 코드 리뷰 및 사용자 디자인 검토는 남아 있다.


## 2026-11-08 홈 요약·접힘 달력 후속 작업

- 계획 당시 상태: IN_PROGRESS → 아래 후속 완료 기록에서 DONE. AC-12g/k/l, 홈에만 작은 버그리·현재 스트릭·오늘 상태와 달력 토글 적용. 공개 프로필 유지.
- 검증 계획: 변경 파일 lint/format, 전체 타입, 스트릭 단위 테스트, streak E2E와 공개 프로필 학습 활동 회귀, PC·모바일 화면 및 독립 UX/UI 리뷰. 상점 구매·3D 조작은 변경 영향이 없어 제외. Hook 미사용.

### 후속 완료 기록

- 상태: DONE (로컬 범위 검증 완료). 홈 요약과 달력 토글, 4가지 기록 상태, 사용자 전환 초기화, 제출 후 펼침 유지 구현. 공개 프로필·집계/API 유지. 학습일 기준 툴팁은 펼친 영역에 배치했다. PRD AC-12l 및 페이지 구조를 요청과 일치시켰다.
- Node v22.23.3. TDD 최초 summary 테스트 7실패/2통과로 변경 동작 미구현 확인 후 구현. `npm test -- --runInBand tests/unit/streak`: 18개 통과.
- 변경 TS/TSX 파일 ESLint, 변경 소스·테스트·영문 사전 Prettier, `npm run typecheck`, `git diff --check` 통과. E2E 서버의 production build 성공.
- E2E: `npm run test:e2e -- tests/e2e/streak.spec.ts tests/e2e/profile-streak.spec.ts --workers=1` 최초 9통과/2실패. 사용자 전환 직후 이전 사용자의 펼침 상태를 읽은 테스트 동기화 문제였다. 새 사용자 문구를 기다리도록 수정했다.
- 재실행 `npm run test:e2e -- tests/e2e/streak.spec.ts --workers=1`: 6통과/1실패. 새 사용자 기다림을 월 선택 뒤에도 잘못 삽입한 테스트 수정 실수를 확인했다. 해당 잘못 추가한 대기만 제거하고 기존 포커스·달력 assertion 유지.
- 최종 `npm run test:e2e -- tests/e2e/streak.spec.ts --grep 'date heading navigates' --workers=1`: 1통과. 수정·재검증 2회. 앱 코드가 같고 테스트 수정이 해당 케이스에만 한정되어 앞선 성공 결과 재사용: 관련 E2E 총11개 모두 통과. 전체 저장소 검증 통과를 의미하지 않는다.
- 320×568/390×844/1280×844 초기 문제 본문 노출, 제출 후 접힘·키보드 토글과 모바일 수평 배치를 확인. 추가 수동 Playwright 캡처로 미완료/완료 상태 상단을 확인했다.
- 독립 UX·UI R0 및 캡처 보완: 필수 문제0, 구현 수정0회. 독립 코드 리뷰에서 구체적 회귀 없음. [리뷰 기록](../ux-reviews/STREAK-HOME-UX.md). 실제 스크린리더 음성·확대글꼴·다크/영어/오류 화면은 미확인.
- 범위가 홈 표시 동작으로 한정되어 전체 Jest·전체 E2E·도구 테스트는 미실행. 구매·3D 조작은 영향 없음으로 제외했으며, 공개 프로필 학습 활동 spec은 유지하고 worker1로 실행했다. push·PR·병합은 하지 않았다.

### 버튼 문구·화살표 후속

- 상태: DONE. 사용자 요청으로 토글 문구를 ‘학습 기록’으로 변경하고 글자 화살표를 중앙 정렬 SVG로 교체한다. 동작·집계 변경 없음.

- Node22.23.3, 변경 파일 ESLint·Prettier, summary 단위9개, production build, diff 검사 통과. 실제 브라우저1280/390/320px에서 SVG/버튼 세로중심차0px·수평넘침 없음과 펼침/접힘 확인. 기존 영어 ‘Learning history’ 번역 재사용.
- 별도 dev 실행은 동일 워크트리의 기존 서버 잠금으로 종료됐다. 해당 서버는 중단·재사용하지 않고 production build와 별도3217 포트에서 검증했다.
- 독립 UI 후속 리뷰에서320px 어절 분리 개선 의견을 반영해 break-keep 적용. `.bugri-hooks/previews/streak-compact/label-320-fixed.png` 및 `label-320-open.png`로 재확인. 문구·정렬만 변경하여 전체 타입/Jest/E2E 파이프라인은 재실행하지 않았다.

### PR 최종 검증 계획

- 기준 코드: c625d08, Node22.23.3. 전체 lint·타입·Jest·도구 검사와 아래 E2E 실행. 최종 코드 production build 성공 결과 재사용, E2E도 동일 코드로 빌드한다.
- 실행 spec: bugcoin-rewards.spec.ts, coin-history.spec.ts, design-system.spec.ts, developer-discovery-repair.spec.ts, developer.spec.ts, discovery-split.spec.ts, error-handling.spec.ts, home-quiz-review.spec.ts, locale.spec.ts, markdown-editor.spec.ts, mock-api.spec.ts, navigation.spec.ts, profile-about.spec.ts, profile-layout.spec.ts, profile-order.spec.ts, profile-polish.spec.ts, profile-split.spec.ts, profile-streak.spec.ts, quiz-authoring.spec.ts, quiz-card-actions.spec.ts, quiz-reactions.spec.ts, solving.spec.ts, streak.spec.ts, tag-catalog.spec.ts, tag-discovery.spec.ts, theme.spec.ts.
- 제외 spec: bugri-tabletop.spec.ts, camera-drag-direction.spec.ts, desk-3d.spec.ts, desk-bugri.spec.ts, desk-direct.spec.ts, desk-foot-orbit.spec.ts, desk-free-placement.spec.ts, desk-height.spec.ts, desk-independent-trial.spec.ts, desk-layer-menu.spec.ts, desk-shared-controls.spec.ts, desk-visibility.spec.ts, front-height-drag.spec.ts, item-tabletop.spec.ts, monitor-screens.spec.ts, my-desk.spec.ts, room-projection.spec.ts, room-theme-bugri.spec.ts, room-zoom.spec.ts, scene-centering.spec.ts, shop-additive-preview.spec.ts, shop-extra-items.spec.ts, shop-locale.spec.ts, shop-tryon-edit.spec.ts, shop-tryon.spec.ts, shop.spec.ts, stable-placement-view.spec.ts, trial-zoom.spec.ts. 홈 전용 표시·신규 번역만 변경해 상점 구매/데스크 렌더링·조작 영향 없음. profile/theme 등 혼합 spec은 유지하며 worker1 사용.

### PR 최종 검증 결과

- 검증 코드 c625d08, Node22.23.3. `npm run lint`, `npm run typecheck` 통과. `npm test -- --runInBand`:69 suites/363 tests 통과. `npm run test:tools`:3 tests 통과.
- 위26개 spec을 `npm run test:e2e -- <선택 spec> --workers=1`로 실행:141개 통과(2.4분). E2E 서버 production build 성공. 상점/3D 전용28개 spec 제외, 혼합 spec 유지.
- 최종 검증 실패 없음. 이후 변경은 이 검증 기록 문서뿐이므로 성공 결과 재사용. `git diff --check` 통과. 최신 origin/dev(d9e257e)와 merge-tree로 충돌 없음 확인했으며 해당 브랜치를 로컬 코드에 통합하지는 않았다.
