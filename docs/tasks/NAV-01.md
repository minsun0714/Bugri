### NAV-01 — 공통 헤더·브레드크럼

- 상태: DONE(요청한 헤더 통합 범위). 공통 ProductLayout에 제품 헤더·현재 메뉴·모바일 메뉴·브레드크럼을 연결했다. UI 전시의 섹션 헤더는 유지한다. 관련: PAGE_STRUCTURE, REQ-04·05·08 및 접근성 기준.
- 사용자 요청에 따라 홈 메뉴는 제거하고 로고로 이동한다. 현재 존재하는 탐색·내 퀴즈 경로만 연결하며 상점·마이페이지는 후속 통합에서 추가한다. 브레드크럼은 홈 링크를 유지하고 동적 ID를 노출하지 않는다.
- `Google 로그인 (데모)` 클릭으로 헤더 상태를 전환한다. 로그인 표시 상태에서는 내 퀴즈·로그아웃을 제공한다. 상태는 브라우저 메모리에서 페이지 이동 중 유지되고 새로고침 시 초기화한다. 기존 본문과 API의 더미 사용자·기록·권한을 변경하지 않는 헤더 전용 데모이며 실제 인증·방문자 랜덤 풀이 구현이 아니다.
- Node v22.23.3에서 `PLAYWRIGHT_PORT=3296 npm run verify` 전체 통과: lint·TypeScript·Jest 28 suites/129 tests·production build·Chromium E2E 38 tests. 내비게이션 단위 6개와 브라우저 4개를 추가했다. 로고·메뉴·현재 위치·사용자 인자 보존·직접 진입/새로고침/뒤로가기·데모 전환·키보드·Escape/바깥 클릭·모바일 크기 변경을 확인했다.
- 초기 검사에서는 설치 누락과 Turbopack 포트 제한/오류 캐시로 막혔다. 남아 있던 설치 프로세스는 종료 상태를 확인했고 기존 npm 캐시와 lockfile로 의존성을 복구했다. 생성 산출물은 `/tmp`로 분리 후 권한을 허용한 검증으로 해결했다. package 파일 변경 없음. 브라우저 테스트의 가려진 클릭 대상·화면 전환 대기를 바로잡고 모바일 breakpoint 이벤트 처리를 수정한 후 전체 검증을 통과했다.
- 독립 UX sub-agent가 최신 데스크톱·모바일·방문자 캡처와 코드를 검토했다. 최초 검토 후 수정·재검토 1회, 필수 미해결 문제 없음. 조작 검증은 메인이 실행한 E2E 근거이며 리뷰어의 직접 브라우저 테스트로 주장하지 않는다. 최종 병합은 사용자 결정이다.

### 브레드크럼 구분자 정렬 후속 수정

- 상태: DONE(로컬 여백 수정). 구분자에도 텍스트와 동일한 `py-1` 세로 여백을 적용했다.
- 동작 없는 여백 수정으로 변경 파일 lint/포맷, 기존 내비게이션 단위 테스트, PC·모바일 표시를 확인한다. 상점 구매·3D 동작에는 영향이 없어 해당 E2E는 제외한다.
- Node v22.23.3: 변경 컴포넌트 ESLint·Prettier 통과, `npm test -- --runInBand tests/unit/navigation.test.tsx` 10개 통과. Playwright Chromium으로 개발 서버의 `/discover/developers`를 1280px·390px에서 캡처·확인했고 구분자와 글자의 상단 위치 및 4px 패딩이 일치했다. 긴 문구를 임시 주입한 모바일 두 줄 상태에서도 첫 줄 정렬을 확인했다.
- 독립 코드 리뷰 지적 없음(줄바꿈·접근성 확인, 리뷰어의 직접 화면 검증은 아님). 단순 여백 변경으로 별도 UX/UI 설계 루프와 전체 빌드/E2E는 실행하지 않았다. 최종 코드 확인 후 문서만 갱신했다.

### 브레드크럼 정렬 PR 최종 검증

- 검증 커밋: `cf0e7aa`, Node v22.23.3. 이후 변경은 이 검증 기록뿐이다.
- `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`(69 suites / 361 tests), `npm run test:tools`(3 tests), `npm run build` 모두 통과.
- 아래 명령으로 E2E 26개 spec / 140 tests 통과. 상점·데스크·3D 전용 spec은 구분자 내부 세로 여백이 구매·캔버스 크기·조작에 영향을 주지 않아 제외했다. 프로필·테마 등 혼합 spec은 유지하고 worker 1개로 실행했다.

```sh
npm run test:e2e -- tests/e2e/bugcoin-rewards.spec.ts tests/e2e/coin-history.spec.ts tests/e2e/design-system.spec.ts tests/e2e/developer-discovery-repair.spec.ts tests/e2e/developer.spec.ts tests/e2e/discovery-split.spec.ts tests/e2e/error-handling.spec.ts tests/e2e/home-quiz-review.spec.ts tests/e2e/locale.spec.ts tests/e2e/markdown-editor.spec.ts tests/e2e/mock-api.spec.ts tests/e2e/navigation.spec.ts tests/e2e/profile-about.spec.ts tests/e2e/profile-layout.spec.ts tests/e2e/profile-order.spec.ts tests/e2e/profile-polish.spec.ts tests/e2e/profile-split.spec.ts tests/e2e/profile-streak.spec.ts tests/e2e/quiz-authoring.spec.ts tests/e2e/quiz-card-actions.spec.ts tests/e2e/quiz-reactions.spec.ts tests/e2e/solving.spec.ts tests/e2e/streak.spec.ts tests/e2e/tag-catalog.spec.ts tests/e2e/tag-discovery.spec.ts tests/e2e/theme.spec.ts --workers=1
```

- 실패한 필수 검사 없음. 기존 독립 코드 리뷰 및 PC·모바일 시각 확인 결과를 재사용한다. 전체 `npm run verify` 실행 결과로 주장하지 않는다.
