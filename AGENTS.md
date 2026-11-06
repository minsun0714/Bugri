<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project

Developer learning platform with AI-generated quizzes.

## Development stages

- Stage 1: Next.js 16 + TypeScript prototype, mock API and dummy users/data, Jest + React Testing Library and Playwright, deployed to Vercel.
- Stage 1 has no database connection, MySQL/Prisma/mysql2 installation, real JWT, or Google OAuth. Load initial fixtures from project mock files and persist user changes in localStorage, isolated by dummy user.
- Stage 2: Spring Boot + Java 21, MySQL 8.4 + Spring Data JPA, JWT authentication and Google OAuth2 login, real persistence and transactional shop operations. Replace mock API with REST API.
- Kubernetes remains a separate practice environment. Keep the full product requirements in docs/PRD.md.

## Working Rules

- Read docs/PRD.md before implementing features.
- Implement only the requested scope.
- Keep business logic outside route handlers.
- Use explicit HTTP API contracts.
- Define request and response types for the stage 1 mock `/api/v1`; keep UI behind the API/service boundary so stage 2 can replace the mock with REST.
- Do not install or connect MySQL, Prisma, or mysql2, and do not implement real authentication in stage 1.
- UI must use the typed API client and mock adapter, never mock files or localStorage directly. The adapter may run without HTTP Route Handlers. Deployed mock files are read-only seeds; never write user data to Vercel files or use server memory as persistent storage. localStorage can be lost on browser data deletion or device changes.
- Detect an IANA timezone from the browser on first use; allow viewing/changing it on My Page. Consider Vercel IP timezone only as a fallback; never infer timezone from country alone. The explicit fallback timezone remains to be decided. Count new quizzes and replays regardless of correctness once per user-local date. Preserve past learning records/rewards after timezone changes; stage 2 records UTC completion times and prevents duplicate daily rewards without trusting browser timezone as security evidence.
- Validate request and AI response data.
- Never expose answers or explanations for unsubmitted questions in solving responses or screens. Owner-only draft review may show them. In the mock stage, answer hiding and permission checks validate UX, not actual security.
- Never execute user-submitted code.
- Never commit secrets or .env files.
- The generation contract returns 1–5 independent quizzes per request; stage 1 uses mock results. Owners may save them individually or all at once; saved quizzes start as PENDING. A follow-up prompt can regenerate a PENDING quiz without auto-approving it.
- After review, the owner chooses PRIVATE or PUBLIC; allow switching between them. Home learning uses PUBLIC quizzes matching direct subscriptions and the selected learning hashtag.
- Owners can edit, regenerate with an LLM prompt, and delete approved quizzes. Keep the active revision available while a new PENDING revision is reviewed; existing attempts use the revision they started with.
- Soft-delete quizzes and hide them immediately. PRIVATE/deleted quizzes leave subscription learning immediately; reject other users' in-progress submissions once unavailable. Preserve completed attempts and earned streak, XP, and BugCoin. Deletion also blocks the owner's submissions.
- Support subscriptions to a user, a hashtag across all users, or a specific user and hashtag combination. Quizzes are learning content selected by those conditions, never subscription targets. Deduplicate matching quizzes by quiz ID.
- Assign at most three hashtags to each independent quiz.
- Use dummy users only to verify stage 1 screens and flows; mock identity is not a security feature. Stage 2 uses Google OAuth2, JWT, and an internal User ID for ownership; do not use anonymous OwnerSession ownership.
- Stage 1 implements BugCoin product listing, purchase and equipment UX with mock state. Stage 2 enforces balances, idempotency, and atomic deduction/inventory updates with MySQL transactions. No real-money checkout or payment gateway.
- The full product includes direct admin product registration. Do not schedule or generate shop products with AI.
- Home learning defaults to All and supports one selected hashtag. Keep it for Next question, offer Replay/Choose another tag when unseen quizzes are exhausted, and preserve attempts and subscriptions when changing tags. One completed quiz per day satisfies the streak condition; multiple quizzes per day are allowed. No subscription feed, infinite scrolling, or unrelated default/recommended quiz.
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
- npm test (Jest + React Testing Library, when configured)
- npx playwright test (Playwright E2E for UI changes, when configured)
