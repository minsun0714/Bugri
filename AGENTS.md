<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project

Developer learning platform with AI-generated quizzes.

## Stack

- Next.js 16 App Router / React 19
- TypeScript
- Initial backend: Next.js Route Handlers
- MySQL 8.4
- AI: external LLM API (provider undecided)
- Development tool: Codex
- Deployment learning: Docker and Kubernetes (not MVP feature prerequisites)
- Future backend: Spring Boot

## Working Rules

- Read docs/PRD.md before implementing features.
- Implement only the requested scope.
- Keep business logic outside route handlers.
- Use explicit HTTP API contracts.
- Validate request and AI response data.
- Never expose answers or explanations for unsubmitted questions in solving responses or screens. Owner-only draft review may show them.
- Never execute user-submitted code.
- Never commit secrets or .env files.
- AI-generated quizzes start as drafts.
- Users must approve quizzes before publishing.
- In the MVP, approval means READY for private solving, not public publishing.
- Read the relevant installed guide in node_modules/next/dist/docs/ before writing Next.js code.
- Documentation or review requests do not authorize application implementation.

## Development Workflow

1. Inspect existing code.
2. Propose a brief implementation plan.
3. Implement one feature.
4. Run relevant tests.
5. Fix failures.
6. Report changed files and test results.

## Verification

- npm run lint
- npx tsc --noEmit
- npm test (when configured)
- npx playwright test (for UI changes)
