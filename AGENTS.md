<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project

Bugri is a developer learning platform with AI-generated quizzes.

## Scope and stages

- Implement only the requested scope. Documentation or review requests do not authorize application implementation. Respect worktree/file ownership and exclusions set by the user.
- Current stage: Next.js 16 + TypeScript prototype, dummy users, Mock API/data, Jest/React Testing Library and Playwright, deployed to Vercel. No DB, MySQL/Prisma/mysql2 installation, real JWT/Google OAuth, or real AI calls.
- Stage 2: Spring Boot + Java 21, MySQL 8.4 + Spring Data JPA, JWT/Google OAuth2, REST persistence and transactional purchases. Kubernetes remains a separate practice environment. Do not promote future requirements into stage 1.

## Required references and workflows

- Before implementing a feature, read [PRD](docs/PRD.md), [architecture](docs/ARCHITECTURE.md), and [tasks](docs/TASKS.md). Product rules and REQ/AC live in the PRD; do not duplicate or silently change them here.
- For API/Mock changes, also read [API contracts and usage](docs/API.md). Consult the relevant PRD sections for quiz generation/revisions, subscriptions, learning/timezones, and shop behavior.
- For code changes, read [coding conventions](docs/CODING_CONVENTIONS.md).
- For requested feature implementation or fixes, use [implement-feature](.agents/skills/implement-feature/SKILL.md). Its verification reference also applies to refactoring and configuration changes.
- For PR preparation, creation, or updates, use [prepare-pr](.agents/skills/prepare-pr/SKILL.md). Ordinary implementation does not itself authorize publishing a PR.
- For documentation-only changes, follow the documentation exception in the [verification guide](.agents/skills/implement-feature/references/verification.md); do not start implementation or the feature Hook.

## Architectural and safety invariants

- Keep business logic outside route handlers. Define explicit typed HTTP request/response contracts and validate requests and generated results.
- UI uses the typed API client, never Mock files or localStorage directly. Separate browser Mock adapters from HTTP/server code so Spring Boot can replace the Mock implementation.
- Use read-only TypeScript seeds and dummy-user-isolated localStorage changes. Never persist user data in Vercel files or server memory. Browser storage can be lost and is not a security boundary.
- Dummy identity and Mock permissions validate UX only. Do not introduce anonymous OwnerSession ownership or claim real authentication/security guarantees.
- Never expose unsubmitted answers, explanations, or source content in solving/public responses. Owner-only review may include them. Preserve completed records and earned rewards when content becomes unavailable, as specified in the PRD.
- Never execute user-submitted code or commit secrets/.env files. No real-money checkout or payment gateway.
- Preserve confirmed product requirements and undecided policies in the PRD/architecture; do not choose product defaults silently.

## Styling

- Use Tailwind CSS v4 utilities for all UI styling, including responsive layouts and component states. Do not introduce twin.macro, styled-components, Emotion, or another CSS-in-JS engine.
- Define shared design tokens in `src/app/globals.css` with `@theme`; use semantic utilities such as `bg-primary`, `text-foreground`, and `border-line`.
- Keep static utility strings and variant mappings beside their components in `styles.ts` when long class lists need reuse. Class names must be complete literals for Tailwind detection, never interpolated fragments.
- Global CSS is limited to the Tailwind import, theme/keyframes, and document-wide base/accessibility rules. Use local arbitrary variants for Markdown/highlight output and pseudo-elements; do not restore global component selectors or CSS Modules.
- Preserve keyboard focus, reduced-motion behavior, and mobile layouts when changing styles.

## Coding essentials

- Use `@/` imports for `src` modules, including type and dynamic imports.
- Use shared `as const` objects and derived union types for domain statuses/modes; preserve wire values.
- Use object/array destructuring for value extraction, including renamed fields and function parameters. Preserve mutations, method receivers, fresh reads, and type narrowing.
- Keep blank lines between declarations, functions, tests, and processing steps; write objects across lines. Follow the detailed conventions and scoped lint/format settings.

## Runtime

- Use Node 22.23.3 as pinned in `.nvmrc` for development and verification; check `node -v` before running commands. Do not report a different runtime as verified.

## Commits

- Commit each completed feature after running relevant verification. Report failed or blocked checks explicitly; a commit does not imply DONE or merge readiness.
- Do not push, open a PR, or merge unless the user requests it.

## Completion and review

- Never claim an unexecuted check passed or skip/weaken tests to obtain a pass. Apply the [verification and failure-handling procedure](.agents/skills/implement-feature/references/verification.md) before reporting completion.
- Require review by someone other than the implementer. The user makes the final merge decision.
