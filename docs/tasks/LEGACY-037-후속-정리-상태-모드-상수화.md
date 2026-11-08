### 후속 정리 — 상태·모드 상수화

- P01 관련 퀴즈 상태·학습 모드·학습 결과 상태·목록 범위를 `src/api/constants.ts`의 `as const` 객체로 통일하고 타입을 값에서 추출했다. 계약 파일에서 다시 내보내 기존 타입 import 경로를 유지한다.
- API·Mock 초기값·서비스 비교/상태 전환·저장 데이터 검증·테스트 입력을 공통 상수로 전환했다. E2E 브라우저 콜백에는 상수를 인자로 전달한다. 별도 의미인 퀴즈 공개 상태와 공개 목록 범위는 분리했다.
- 기존 API/localStorage 문자열은 그대로 유지하며, 호환성 테스트의 기대 문자열만 명시적 리터럴로 남겼다. 저장/복원과 알 수 없는 모드·PENDING 공개 범위 거부 테스트 2개를 추가했다. 제품 REQ/AC 변경 없음.
- 마지막 코드 변경 후 `npm run verify` 전체 통과: lint, TypeScript, Jest 4 suites/36 tests, production build, Chromium E2E 2개. Prettier 검사와 `git diff --check`도 통과했다. UI·디자인·package.json·lock은 변경하지 않았다.
