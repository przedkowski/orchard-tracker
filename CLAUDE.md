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
- `CRUD + filter /api/sprays`, `PATCH /api/sprays/:id`
- `GET /api/suggestions` → `{ suggestions: Suggestion[] }`
- `CRUD /api/products`

Section and spray ids are `string`, not number.

## Frontend conventions

- Pages use default exports.
- Components (`Button`, `Input`, `Card`, `NavBar`) are named exports.
- All components forward `data-testid`.
- `Button` is a `forwardRef` component; defaults `type="button"`.
- `Input` derives its error testid as `${testid}-error`.
- Forms use real `<form>` with `noValidate` and handle `HttpError`
  (from `src/api/client`) with a form-level error message.
- Auth: `src/context/auth-context.ts` (types/context, no JSX),
  `src/context/AuthContext.tsx` (provider only),
  `src/hooks/useAuth.ts` (hook). Split to satisfy fast-refresh rule.
- Toasts: `src/context/toast-context.ts`, `src/context/ToastContext.tsx`,
  `src/hooks/useToast.ts`. Same fast-refresh split pattern.
- JWT stored in localStorage under key `orchard_token`.
- Query keys: `["sections"]`, `["sprays", filters?]`, `["suggestions"]`,
  `["section", id]`, `["products"]`. Mutations invalidate relevant keys on success.
- `Tabs` accepts optional `panelId` per tab for `aria-controls` wiring.
  Compliant pages wrap each active panel in `role="tabpanel"` + `aria-labelledby`.
- Spray forms validate product name against library before mutation
  (case-insensitive match on name + category). `EditSprayModal` is exempt.

## WCAG 2.2 testing setup

**Compliant views:** `SignIn`, `SignUp`, `Sprays`, `Products`, `NotFound`.

**4 intentionally non-compliant views** for Playwright accessibility testing.
Each contains one violation per axe severity, marked with:

```
{/* wcag-violation: <severity> — <description> (WCAG X.X.X Level X) */}
```

| View | Critical | Serious | Moderate | Minor |
|------|----------|---------|----------|-------|
| `Dashboard` | `<img>` without `alt` | `text-slate-500` small-caps, ~3.4:1 contrast | unnamed `<section>` landmark | `tabIndex={0}` on non-interactive `<p>` |
| `Sections` | `<img>` without `alt` in list items | `text-slate-600` subtitle, ~2.4:1 contrast | tab panels missing `role="tabpanel"` | redundant `role="list"` on `<ul>` |
| `BatchSpray` | `<input>` without label | `text-slate-600` metadata, ~2.4:1 contrast | checkbox group without `<fieldset>` | `tabIndex={1}` on back link |
| `SectionDetail` | icon-only button with no accessible name | `text-slate-600` meta text, ~2.4:1 contrast | unnamed `<section>` landmark | decorative emoji without `aria-hidden` |

## Implemented features

- Auth (sign up / sign in / sign out) ✅
- Orchard sections CRUD + detail view ✅
- Spray records CRUD with per-section filtering ✅
- Batch spray — log the same spray across multiple sections at once ✅
- PHI tracker — Pre-Harvest Interval countdown badge + section-level safety banner ✅
- Product Library — CRUD UI; spray forms reject products not in library ✅
- Crop type & product autocomplete — DB-backed dictionaries with per-category filtering ✅
- Suggestions — rule-based, sortable by urgency, Apply button opens prefilled modal ✅
- Edit sections and sprays ✅
- Confirm dialogs on delete, toast notifications on success ✅
- WCAG 2.2 partial compliance — 5 clean views, 4 intentionally broken for testing ✅

## Feature backlog (not yet started)

- Export to CSV — download spray history for regulatory records
- Spray calendar / timeline view — visualize spray frequency per section
- Section map / area visualization — simple visual layout of orchard blocks
- Low-stock / reorder alerts — flag products running low
- Weather integration — auto-fill weather note from a weather API
- Spray report by section — summary of total doses, products used, last spray date
