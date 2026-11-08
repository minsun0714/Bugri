## THEME-01 — 라이트·다크·시스템 테마

- 상태: IN_PROGRESS(구현·독립리뷰 완료, PR 통합의 간헐 E2E 실패 이력 및 갤럭시 Chrome 실기기 확인 대기). 사용자 승인 계획 구현. REQ-15: 공통 헤더 선택, 기기 설정 기본/명시 선택 우선/브라우저 저장, 첫 화면 테마 적용, 버그리 고유색과 사용자 방 보존. 삼성 강제 다크는 실기기 별도 검증이며 CSS만으로 보장하지 않는다.
- implement-feature·UX/UI 스킬 적용. 독립 UI 설계 완료, 테마 동작 테스트를 먼저 작성해 신규 모듈 부재로 의도한 실패 확인. 공통 UI 변경이므로 관련 단위/E2E·독립 UX/UI 및 코드 리뷰 후 Node22.23.3 전체 verify 수행.
- 후속 확인: 사용자가 갤럭시 Chrome이라고 답변했다. 라이트는 `only light`, 다크는 `dark`로 선언하고 Chromium CDP Auto Dark 검증을 추가했다. [독립 리뷰](../ux-reviews/THEME-01.md): UX-01 테마 아이콘을 C1에서 반영, CODE-01 오류화면 상시 구독을 보완했다.
- 실패 처리 기록: 최초 E2E에서 투명 캔버스 모서리를 불투명으로 가정한 검사와 캐릭터의 미사용 currentColor 비교가 실패했다. 전체 painted pixel hash로 보존을 검사하고 캐릭터 inherited ink도 분리했다. 다음 실행은 홈 자동 스크롤 뒤 헤더 조작 대기와 실행 도중 추가된 오류화면 구독의 빌드 시점 차이로 실패했다. 이후 최종 코드를 고정하고 홈 학습 표시 후 헤더로 돌아가는 동작을 검사한다. Chrome only-light 변경 직후 단위 검사 구 기대값 1건은 새 계약으로 갱신했다. 테스트 제외·타임아웃 확대는 하지 않았다.
- 관련 최종 검사: Node v22.23.3, 테마/내비게이션 단위 15개 및 E2E 13개 통과. 초기화 JS만 실행되는 수화 전 스타일, 저장 차단, 시스템/명시 선택, 모바일 키보드, 오류화면 OS 추종, 전체 방 painted pixel 보존, Chromium CDP Auto Dark 양 테마 버그리 screenshot 동일성 포함. 변경 코드 Prettier·diff check 통과. 로그 `/tmp/bugri-theme-unit-final.log`, `/tmp/bugri-theme-e2e-final.log`. 최종 전체 verify 진행 중이며 실기기 호환성은 미확인이다.

- 최종 전체 검증: Node v22.23.3 `npm run verify -- -- --workers=2`에서 lint·타입·Jest 60 suites/302개·도구 3개·production build 통과, E2E 190/191 통과·1개 실패. `tests/e2e/discovery-split.spec.ts:25`는 640px에서 펼친 주 메뉴를 기대하지만 새 헤더는 1024px 미만에서 모바일 메뉴를 사용한다. 테스트의 두 `width < 640` 분기와 현행 헤더 기준을 정합화한 뒤 관련/전체 재검증이 남는다. 기대값 제외·완화는 수행하지 않았다. 로그 `/tmp/bugri-theme-verify-final.log`.
- 첫 전체 verify는 화면 진단용 `.bugri-hooks/theme/*.cjs`가 lint 대상에 들어가 실패했다. 임시 스크립트를 `/tmp/bugri-theme-scripts/`로 이동하고 재실행했다. 작업 전체 수정·재실행 한도 3회에 도달하여 추가 수정/검증을 중단한다. 전체 통과·DONE·병합 준비 완료를 주장하지 않으며, 현재 구현과 실패 근거를 로컬 커밋한다. push/PR/merge는 하지 않는다.

- 후속 사용자 승인: 재시도 한도 이후 추가 수정·검증 1회를 명시적으로 승인했다. 기존 탐색 E2E의 메뉴 분기를 1024px에 맞추고 1023/1024 경계 폭도 검증한다. 1280/640/390 기존 범위와 탐색 이동·활성 표시·뒤로 가기 검증은 유지한다. 앱 구현 변경 없이 관련 검사·독립 테스트 리뷰 후 전체 verify를 수행한다.

- 후속 최종 검증: Node v22.23.3, 변경 테스트 lint/Prettier·관련 E2E 2개 통과. 독립 테스트 리뷰에서 assertion 유지와 1023/1024 경계 추가를 확인했다. `npm run verify -- -- --workers=2` exit 0: lint·전체 타입·Jest 60 suites/302개·도구 3개·production build·E2E 191개 모두 통과. 이전 640px 기대값 실패는 해소됐다. 로그 `/tmp/bugri-theme-followup-verify.log`. 검증 대상은 3f3abc7 + discovery-split 테스트 수정이며 이후 변경은 문서 기록뿐이다. 실제 갤럭시 Chrome 호환성은 미확인으로 남기고 로컬 테스트 수정은 커밋한다.

### THEME-01 PR 통합

- 사용자 PR 게시 요청으로 최신 dev59c4a10을 통합한다. TASKS양쪽 기록 보존, QuizList생성 CTA는 최신dev공통 버튼·아이콘·중복 제거를 유지하며 공통 토큰으로 다크를 지원한다. 다크 페이지네이션도 보존한다. 독립 통합리뷰와 최신코드 전체검증 후 dev대상 PR게시. 실기기 호환성 미확인 한계는 유지한다.
- 통합 독립리뷰: upstream공통CTA·중복제거·단위테스트와 다크토큰/페이지네이션 보존 확인. UX390px다크 두사용자 생성이동, UI1280/390px양테마 두사용자 총8상태 확인, 추가결함없음. 관련단위11개 통과. 전체검증 진행중.

- PR 통합 검증: Node22.23.3 lint·전체타입·Jest60 suites/304개·도구3개·production build 통과. 전체 E2E190/191 통과, 모바일 구독 모달1개가30초 timeout으로 실패했다(`/tmp/bugri-theme-pr-verify.log`). 코드/테스트 변경 없이 `npm run test:e2e -- tests/e2e/developer-discovery-repair.spec.ts --workers=1` 재실행8개 모두통과(`/tmp/bugri-theme-pr-recheck.log`). 원인은 확정하지 않았으며 최초전체verify exit1을 전체일괄통과로 표현하지 않는다. 성공결과는동일코드에서재사용한다. 실기기미확인·간헐실패이력을명시한 Draft PR을 게시한다. 검증대상061eddd+dev59c4a10 통합이며 이후변경은기록뿐이다.


