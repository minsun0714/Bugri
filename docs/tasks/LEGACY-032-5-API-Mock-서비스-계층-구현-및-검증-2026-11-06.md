## 5. API·Mock 서비스 계층 구현 및 검증 (2026-11-06)

- P01/P01M/P02: `src/api`의 요청·응답/오류 계약, API 클라이언트와 HTTP/브라우저 조립 경계, `src/mocks`의 초기 파일·사용자별 localStorage 어댑터를 구현했다. P02T/P03~P08은 서비스 부분만 구현했으며 화면 작업은 포함하지 않는다. 기존 UI·스타일·디자인 토큰·package.json·lock·공유 Playwright 설정을 변경하지 않았다.
- 서비스 범위: 4가지 문제 형식의 Mock 생성·검증, 개별/일괄 저장, PENDING 검토·리비전 승인·공개 범위·soft delete, 시작 버전 채점·재도전, 3종 구독·태그/다음 문제, 시간대별 학습일·스트릭, 상품·구매·보관함·장착. REQ-01~05, REQ-07~09, REQ-11~12의 데이터 계층 기준을 검증한다.
- 문제별 다양한 형식은 사용자 요청에 따라 단일 선택·복수 선택·OX·단답형으로 명시했다. 시간대 fallback과 BugCoin 지급량은 제품 기본값을 확정하지 않고 설정으로 분리했다. 자세한 DTO·채점·오류·미결정 정책은 API.md에 기록했다.
- Node 22.23.3에서 `npm ci`로 기존 lock에 맞춰 도구를 준비했다. package 파일 변경 없음. `npx next typegen` 후 기존 LayoutProps 생성 타입을 확인했다.
- 마지막 코드 변경 후 `CI=1 npm run verify`: lint 통과, TypeScript 통과, Jest 3 suites/34 tests 통과, Next.js production build 통과. 이후 Playwright는 다른 체크아웃(`/Users/minsun/orca/Bugri`)이 3000번 포트를 사용 중이어서 실행 전 차단됐다. 해당 서버를 종료하거나 검증 대상으로 재사용하지 않았다.
- 같은 코드에서 `CI=1 npx playwright test --config=tests/e2e/mock.config.ts`: 이 워크트리의 production build를 3107번 포트에서 실행하여 Chromium 2 tests 통과. 생성→저장→검토/승인→구독→태그/풀이/재도전→구매/장착→새로고침 복원, 다른 탭의 비공개 전환·오래된 버전 거부를 실제 브라우저 서비스 경계에서 확인했다.
- 새 UI를 구현하지 않았으므로 React Testing Library 컴포넌트 검사와 제품 화면 클릭 E2E는 이번 범위에 없다. Playwright의 서비스 검증을 UI 구현 완료 근거로 간주하지 않는다. DB·실제 인증·실제 AI·실제 거래 안전성도 검증 대상이 아니다.
- `git diff --check` 및 문서 정합성 검토를 수행했다. 최초 검증 당시 기본 전체 파이프라인은 포트 충돌로 완료되지 않았으므로 P01/P01M/P02는 IN_PROGRESS를 유지하고 P02T/P03~P09의 UI 포함 작업도 DONE으로 바꾸지 않는다. 당시 해제 조건은 전체 검증 재실행과 별도 UI 구현/검증이었다. 포트 충돌과 전체 검증은 아래 후속 작업에서 해결했다.
