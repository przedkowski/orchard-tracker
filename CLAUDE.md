# Orchard Tracker — Claude Working Notes

Spray-tracking web app. Sole purpose beyond being useful: serve as a
realistic target for a Playwright test framework I'll build against it
later. Testability is a first-class requirement, not an afterthought.

## Working style

- Step by step, one thing at a time. Wait for my confirmation between steps.
- Deliver files in batches of 3 unless a file is unusually large.
- Tight, focused outputs. No filler, no recaps of what you just did.
- Give me commands to run; I execute them myself unless I say otherwise.
- Flag testability decisions as you go.
- When uncertain about an API shape or existing file's contents, READ THE
  FILE before writing code. Do not guess and do not ask me to paste it.
- Ask before making assumptions about tech choices.
- Do not write tests. I write all tests myself later.

## Environment

- Windows 11, VS Code, Git Bash
- Node v22 LTS
- Repo: https://github.com/przedkowski/orchard-tracker

## Tech stack (locked — do not change without asking)

- Monorepo via npm workspaces: `apps/api`, `apps/web`, `packages/shared`
- Backend: Fastify 5 + TS (ESM), Prisma 6.16.1 (PINNED), Zod, bcryptjs,
  @fastify/jwt, @fastify/cors, @fastify/sensible
- DB: Neon Postgres
- Frontend: Vite + React 18 + TS, TailwindCSS v3 (PINNED), React Router,
  TanStack Query, Zod
- LLM: Groq (rule-based placeholder for now)
- Deploy: Fly.io (api) + Vercel (web)
- Monitoring: Grafana Cloud

## Gotchas — already hit, do not repeat

- Paths with `&` or spaces break Node tooling on Windows.
- Prisma 7 broke `url = env("DATABASE_URL")`. Stay on 6.16.1.
- Vite 8 requires Node 20.19+.
- Vite's TS template enables `erasableSyntaxOnly` — no parameter-property
  shorthand in constructors.
- Tailwind v4 changed config format. Stay on v3.
- React 19 lint rule `react-hooks/set-state-in-effect` fires on setState
  in effect bodies. Compute sync initial state in `useState` initializer
  instead.
- Fast Refresh rule `react-refresh/only-export-components`: context
  objects go in their own non-`.tsx` file, hooks in their own file,
  providers alone in the `.tsx` file.

## data-testid convention

Every interactive element and every element a Playwright test might
assert on gets a unique `data-testid`.

Format: `<scope>-<role>` or `<scope>-<role>-<identifier>`

Examples:

- `signin-email-input`, `signin-submit`
- `section-card-${id}`, `section-delete-${id}`
- `suggestion-item-${index}`

Scope is the page or feature area. Role is what the element _is_
(input/submit/card/link/error/loading/empty/list). Identifier is only
for repeated elements.

Page-level containers also get testids: `sections-page`, `sections-list`,
`sections-empty`, `sections-loading`, `sections-error`, etc.

## Backend API shape (reference)

- `POST /api/auth/signup`, `POST /api/auth/signin`
- `GET /api/auth/me` → `{ user: User }` (NOT `{ userId }`)
- `CRUD /api/sections`
- `CRUD + filter /api/sprays`
- `GET /api/suggestions` → `{ suggestions: Suggestion[] }`

Section and spray ids are `string`, not number.

## Frontend conventions

- Pages use default exports.
- Components (`Button`, `Input`, `Card`, `NavBar`) are named exports.
- All components forward `data-testid`.
- `Input` derives its error testid as `${testid}-error`.
- `Button` defaults `type="button"`; set `type="submit"` explicitly inside forms.
- Forms use real `<form>` with `noValidate` and handle `HttpError`
  (from `src/api/client`) with a form-level error message.
- Auth: `src/context/auth-context.ts` (types/context, no JSX),
  `src/context/AuthContext.tsx` (provider only),
  `src/hooks/useAuth.ts` (hook). Split to satisfy fast-refresh rule.
- JWT stored in localStorage under key `orchard_token`.
- Query keys: `["sections"]`, `["sprays", filters?]`, `["suggestions"]`,
  `["section", id]`. Mutations invalidate the relevant keys on success.

## What's still left (high-level)

- Frontend pages: `Sections.tsx` ✅, `SectionDetail.tsx` ✅, `Sprays.tsx` ✅,
  wire up `App.tsx` routing with AuthProvider + QueryClientProvider ✅
- Replace rule-based suggestions with Groq integration
- Deploy api (Fly.io) and web (Vercel)
- GitHub Actions CI/CD
- Grafana Cloud hookup
- At least 8 distinct E2E user paths must be possible by the end

## Implemented features

- Batch spray — log the same spray across multiple sections at once ✅
- PHI tracker — Pre-Harvest Interval countdown badge + section-level safety banner ✅
- Product & crop type autocomplete — DB-backed dictionaries with per-category filtering ✅

## Feature backlog (not yet started)

- Export to CSV — download spray history for regulatory records
- Spray calendar / timeline view — visualize spray frequency per section
- Section map / area visualization — simple visual layout of orchard blocks
- Low-stock / reorder alerts — flag products running low
- Weather integration — auto-fill weather note from a weather API
- Spray report by section — summary of total doses, products used, last spray date
