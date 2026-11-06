# 코딩 규칙

코드 작성·리팩터링 전에 읽는다. 아래 규칙은 특정 스킬 사용 여부와 무관하게 적용한다. ESLint·Prettier 설정은 실행 가능한 검사 기준이며, 이 문서는 의도·예시·예외를 설명한다.

## Import Style

- Use the existing `@/*` alias for imports of modules under `src`, including same-directory imports, type-only imports, re-exports, and dynamic `import()` calls.
- Keep package imports and `node:` imports unchanged. Relative paths remain allowed for targets outside `src`, such as the root Playwright configuration.
- ESLint currently enforces this rule in the API, Mock, service, and related test files. Do not expand enforcement into UI/design files as part of API-only work.
- Keep Jest alias mapping and the E2E test bundle resolver compatible with `tsconfig.json` paths when changing imports.

## Domain Constants

- Define domain status/mode values as shared `as const` objects in `src/api/constants.ts` and derive their union types from those objects. Use members such as `QuizStatus.PUBLIC` and `LearningMode.REPLAY` in application code, fixtures, and test inputs instead of repeating string literals.
- Keep distinct concepts separate even if they share a wire value: `QuizScope.PUBLIC` is a list filter, while `QuizStatus.PUBLIC` is a quiz status.
- Preserve existing API/localStorage string values. Literal expectations are allowed in compatibility tests that intentionally verify serialized wire values.

## Destructuring

- Use object and array destructuring when extracting values into local variables. This is the default coding rule, not an optional style preference. ESLint `prefer-destructuring` enforces variable declarations, including renamed properties, in API/Mock/service code and related tests; assignment expressions remain outside enforcement to preserve mutations.
- Write `const { userId, displayName } = user` instead of separate property assignments. Use aliases when renaming: `const { userId: ownerUserId } = user`.
- Write `const [first] = items` instead of `const first = items[0]`. Avoid long lists of skipped array entries; use direct indexing for a dynamic index.
- Destructure object parameters in the function signature or at the start of the body when their fields are needed. Destructure returned objects and tuples when extracting their values.
- Preserve behavior: keep direct property access for mutations, methods that depend on `this`, and reads that must observe updated object state. Preserve TypeScript discriminated-union narrowing; destructure after narrowing where needed.

## Code Spacing

- Separate exported types/interfaces, functions, classes, and test cases with one blank line.
- Separate declarations from execution, control-flow blocks, multiline calls, and return/throw statements with a blank line. Consecutive imports and short single-line variable declarations may stay grouped.
- Prettier preserves existing blank lines; ESLint `padding-line-between-statements` inserts missing lines in API/Mock/service code and related tests. Run scoped `eslint --fix` before Prettier when applying spacing in bulk.
- Keep UI/design files outside this formatting scope. Do not change runtime behavior for spacing changes.

## 자동 정리

API·Mock 계층만 정리할 때는 아래처럼 범위를 제한한다. 다른 작업에서는 승인된 변경 파일에 맞춰 경로를 조정한다. 전체 저장소 포맷을 실행해 다른 워크트리 작업과 충돌하는 변경을 만들지 않는다.

```sh
npx prettier --write src/api src/mocks src/services tests/unit/api tests/e2e/mock-api.spec.ts
npx eslint --fix src/api src/mocks src/services tests/unit/api tests/e2e/mock-api.spec.ts
npx prettier --write src/api src/mocks src/services tests/unit/api tests/e2e/mock-api.spec.ts
```

첫 Prettier 실행으로 줄바꿈을 정리하고, ESLint로 선언·처리 단계 사이 빈 줄을 추가한 뒤 Prettier로 마무리한다. 포맷 후 lint와 Prettier 검사를 모두 확인한다. `.prettierrc.json`의 `printWidth: 60`, `objectWrap: preserve`를 따르며, `objectWrap`은 기존 객체 줄바꿈을 보존하는 옵션이다. 새 객체도 여러 줄로 작성한다.

`padding-line-between-statements`는 패키지 변경 없이 설치된 ESLint 9 내장 규칙을 사용한다. 이 규칙은 deprecated 상태이므로 향후 ESLint 11 전환 시 `@stylistic/eslint-plugin` 이전을 검토한다. 검증 절차와 문서 전용 변경 예외는 [검증 지침](../.agents/skills/implement-feature/references/verification.md)을 따른다.
