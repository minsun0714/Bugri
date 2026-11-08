### 후속 정리 — 선언·처리 단계 사이 빈 줄

- P01 관련 API·Mock·서비스와 테스트에 ESLint `padding-line-between-statements`를 적용했다. 선언·함수·테스트·제어문·여러 줄 호출 사이와 반환문 앞을 분리하고 import/짧은 변수 선언 묶음은 유지한다. 코드 변경은 빈 줄 추가뿐이며 UI·디자인·package.json·lock은 변경하지 않았다.
- scoped `eslint --fix` 후 Prettier를 적용했다. ESLint API로 타입/함수/제어문/반환문 간격, Prettier 재실행 후 유지, UI 제외를 직접 검증했다.
- 마지막 코드 변경 후 `npm run verify` 전체 통과: lint, TypeScript, Jest 34개, production build, Chromium E2E 2개. 관련 파일 Prettier 검사와 `git diff --check`도 통과했다.

