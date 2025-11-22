# Repository Guidelines

## Project Structure & Module Organization
`app/` hosts the App Router grouped as `(auth)`, `(dashboard)`, and `(admin)`; add new routes next to the closest group to inherit layouts. Shared UI belongs in `components/`, while Supabase clients, mocks, and domain logic live under `lib/` (see `lib/actions`, `lib/services`, `lib/types.ts`). Static/PWA assets stay in `public/`, database artifacts in `supabase/`, and tests split cleanly between `tests/unit` (Vitest) and `tests/e2e` (Playwright).

## Build, Test, and Development Commands
- `npm run dev`: Hot-reload server for local feature work.
- `npm run build`: Production bundle used by Vercel/Supabase previews.
- `npm run start`: Serves the last build for smoke tests.
- `npm run lint`: Next.js ESLint rules; required before every push.
- `npm run test:unit`: Vitest suites (runs `tests/unit` and colocated `*.test.tsx`).
- `npm run test:e2e`: Playwright specs; launch `npm run dev` in another shell first.

## Coding Style & Naming Conventions
Everything ships in TypeScript with `strict` mode on, so skip `.js` files and type Supabase responses explicitly. Components use `PascalCase`, hooks use `useCamelCase`, and feature modules under `lib/` should mirror the domain (`lib/services/exchangeService.ts`). Prefer the path aliases (`@/app`, `@/components`, `@/lib`) to long relative imports, and run ESLint before committing; avoid formatting-only churn.

## Testing Guidelines
Use Vitest for utilities, Supabase fallbacks, and server actions, structuring specs as `describe('feature')` and expressive `it()` blocks. Playwright guards mission-critical flows (auth, dashboard, admin); gate destructive cases behind tags or dedicated fixtures. Every feature should land with at least one unit spec plus E2E coverage for risky paths, and skipped suites must be justified in the PR. Reuse mocks in `lib/data/mock.ts` to keep runs deterministic.

## Commit & Pull Request Guidelines
History shows terse, imperative summaries (`first commit`); keep that style, prefix with the area (`dashboard:`) when possible, and stay under 72 characters. Squash noisy fixups so each commit is reviewable. PRs need context or linked issues, screenshots/terminal output for visible changes, confirmation of `lint`, `test:unit`, and `test:e2e` (when relevant), plus any schema or env callouts; switch from draft only after those boxes are ticked.

## Security & Configuration Tips
Copy `.env.example` to `.env.local`, fill in Supabase, LINE, PeX, and push secrets, and keep `.env*` files untracked. Schema edits live in `supabase/sql/schema.sql` with paired RLS updates in `supabase/policies/rls.sql`; PWA tweaks should touch both `public/manifest.json` and `public/sw.js`. Note any key rotations or Edge Function changes (`supabase/edge-functions/pex-exchange`) in the PR so deploy steps are clear.
