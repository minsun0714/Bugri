### 후속 검증 — E2E 포트 분리

- `playwright.config.ts`의 기본 포트를 3107로 변경하고 `PLAYWRIGHT_PORT`로 다른 포트를 지정할 수 있게 했다. 서버 명령과 baseURL이 같은 값을 사용하고 다른 서버는 재사용하지 않는다. Mock 전용 설정도 공통 설정을 따른다.
- 마지막 코드 변경 후 Node 22.23.3에서 `npm run verify` 전체 통과: lint, TypeScript, Jest 34개, production build, Chromium E2E 2개. 기존 3000번 포트 충돌은 더 이상 검증 차단 요인이 아니다.
- 포트 변경 동작은 `PLAYWRIGHT_PORT=3108 npx playwright test --config=tests/e2e/mock.config.ts`로도 E2E 2개 통과를 확인했다. 이후 변경은 공유 설정 객체의 줄바꿈뿐이며 최종 전체 검증을 다시 통과했다.
- UI·디자인·package.json·lock은 수정하지 않았다. 데이터 계층 검증과 별도로 UI 연결·컴포넌트 검증 작업은 남아 있다.

