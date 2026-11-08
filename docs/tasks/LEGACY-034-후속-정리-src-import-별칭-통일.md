### 후속 정리 — src import 별칭 통일

- P01 관련 코드 정리로 API·Mock·서비스와 관련 테스트의 `src` 모듈 import를 기존 `@/*` 별칭으로 통일했다. 타입 import·동적 import도 적용하고 `src` 밖의 Playwright 설정 참조는 상대 경로를 유지했다. 제품 REQ/AC 변경은 없다.
- AGENTS.md에 작성 규칙을 기록하고 해당 범위에만 ESLint 상대 import 제한을 추가했다. Jest의 moduleNameMapper와 E2E 테스트 번들러도 `@/`를 처리하도록 수정했다. UI·디자인·package.json·lock·tsconfig.json은 변경하지 않았다.
- 마지막 코드 변경 후 Node 22.23.3에서 `npm run verify` 전체 통과: lint, TypeScript, Jest 34개, production build, Chromium E2E 2개.
- ESLint API로 별칭 타입 import·별칭 동적 import·외부 설정 상대 참조 허용과 상대 타입 import·상위 경로 re-export·상대 동적 import 거부의 6가지 사례를 직접 검증했다. 관련 파일 Prettier 검사와 `git diff --check`도 수행했다.
