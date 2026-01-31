# Geroxym Travel – Audit & 2026 Upgrade Plan

**Project:** Geroxym Travel  
**Stack:** Next.js 16 + React 19 + Supabase (SSR, Service Role) + Tailwind  
**Runtime/deploy:** Vercel (assumed) / Node  
**Date:** 2026-01-31  

---

## 1. Repository map

### Modules / layers

| Layer | Path | Role |
|-------|------|------|
| **App routes** | `src/app/` | Entrypoints: root redirect → `/ro`, `(admin)/admin`, `[locale]/*` |
| **Server actions** | `src/app/**/actions.ts`, `src/lib/admin/*.ts` | Mutations, RPC, revalidate; auth checked in actions |
| **Supabase** | `src/lib/supabase/` | `server.ts` (RLS), `client.ts` (browser), `service.ts` (bypass RLS) |
| **Shared UI** | `src/components/ui/` | Radix-based primitives |
| **Feature components** | `src/components/{account,admin,auth,checkout,routes,layout,sections}/` | Pages composition |
| **Data/cache** | `unstable_cache`, `revalidateTag`, `revalidatePath` | Admin routes, homepage, dashboard |

### Critical flows

1. **Booking (hot path):** `[locale]/routes` → route detail → (guest or user) → `checkout/[orderId]` → `finalizeOrder` (RPC `allocate_tickets`) → success.
2. **Admin:** `(admin)/admin` layout (auth + role check) → orders/routes/tickets; actions in `lib/admin/*` with optional `locale` for paths.
3. **Auth:** Login/signup → `signup/actions.linkCustomerAfterSignup` for linking guest orders to new user.

### Entrypoints

- **Public:** `/`, `/ro`, `/ro/routes`, `/ro/routes/[id]`, `/ro/login`, `/ro/signup`, `/ro/checkout/[orderId]`, `/ro/account`, `/ro/my-bookings`.
- **Admin:** `/admin`, `/admin/routes`, `/admin/orders`, `/admin/tickets` (no locale).
- **Root:** `src/app/page.tsx` → redirect `/ro`.

---

## 2. Problems list (prioritized)

| # | Severity | Issue | Evidence | Suggested fix |
|---|----------|------|----------|----------------|
| 1 | High | No error/loading boundaries on critical routes | No `error.tsx`/`loading.tsx` under checkout, account | **Done:** Added `error.tsx` + `loading.tsx` for `[locale]/checkout` and `[locale]/account`. |
| 2 | High | Env vars used with non-null assertion; app can crash at runtime | `server.ts`, `client.ts`, `service.ts` use `process.env.X!` | **Done:** Guard at client creation; throw clear error if URL/key missing. |
| 3 | Medium | Dead code: unused component and duplicate action | `AdminNav.tsx` never imported; `auth/actions.linkCustomerToUser` never imported (signup uses `signup/actions.linkCustomerAfterSignup`) | **Done:** Removed `AdminNav.tsx` and `auth/actions.ts`. |
| 4 | Medium | No schema validation on server actions | FormData/params passed as-is in orders, routes, checkout | Add Zod (or similar) schemas for critical actions; validate before DB/RPC. |
| 5 | Medium | `next.config` uses deprecated `images.domains` | `next.config.ts` has `images.domains` | Switch to `images.remotePatterns` (and add Supabase storage if used). |
| 6 | Medium | Heavy components not lazy-loaded | SeatMap, RichTextEditor, BookingDetailSheet loaded eagerly | Use `dynamic(..., { ssr: false })` or `loading` for these (see ROADMAP). |
| 7 | Low | Checkout revalidatePath without locale | `checkout/[orderId]/actions.ts` uses `/checkout`, `/account`, `/routes` | If all traffic is under `[locale]`, consider locale-aware paths or leave as-is if intentional. |
| 8 | Low | Duplicate root-level folders | `components/`, `hooks/`, `lib/` at repo root + under `src/` | Prefer single source under `src/`; remove or document root usage. |
| 9 | Low | SQL scripts in repo root | `check_tickets_rls.sql`, `FIX_*.sql`, `inspect_rls_status.sql` | Move to `supabase/migrations` or `MD/` / docs. |
| 10 | Low | No tests / coverage gates | No test runner or CI coverage | Add Vitest/Jest for actions + critical flows; CI coverage threshold. |

---

## 3. 2026 refactor plan (phases)

| Phase | Scope | Risk | Quick wins |
|-------|--------|------|------------|
| **1** | Dead code removal, env guards, error/loading | Low | ✅ Done: AdminNav, auth/actions, env guards, error/loading for checkout & account. |
| **2** | Lazy load SeatMap, RichTextEditor, BookingDetailSheet | Low | ✅ Done: dynamic import with `ssr: false` / loading fallback. |
| **3** | Zod (or similar) on server actions (createOrder, createRoute, createOfflineOrder, finalizeOrder) | Medium | ✅ Done: `lib/schemas.ts` + validare createOfflineOrder, finalizeOrder. |
| **4** | next.config: `remotePatterns`, Supabase images if used | Low | ✅ Done: `remotePatterns` + Supabase storage path; SQL scripts moved to `MD/sql-scripts/`. |
| **5** | Consolidate root vs src (components/hooks/lib) | Low | App uses only `src/` via `@/*`; root `components/`, `hooks/`, `lib/` are legacy (e.g. tourism-routes-page). Document only. |
| **6** | Tests: actions + critical E2E (booking, checkout) | Medium | Vitest for server actions; Playwright for one happy path. |
| **7** | Observability: structured logging, error reporting | Low | Add logger / Sentry (or similar) in error boundaries and key actions. |

---

## 4. Implementation (done today)

### 4.1 Remove dead code

- **Deleted:** `src/components/admin/AdminNav.tsx` (never imported; admin uses AdminSidebar).
- **Deleted:** `src/app/[locale]/auth/actions.ts` (only exported `linkCustomerToUser`, never imported; signup uses `signup/actions.linkCustomerAfterSignup`).

### 4.2 Env guard for Supabase

- **`src/lib/supabase/server.ts`:** `getEnv()` checks `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; throws clear error if missing.
- **`src/lib/supabase/client.ts`:** Same guard for browser client.
- **`src/lib/supabase/service.ts`:** `getServiceEnv()` checks URL + `SUPABASE_SERVICE_ROLE_KEY`; throws if missing.

### 4.3 Error and loading boundaries

- **`src/app/[locale]/checkout/error.tsx`:** Client error boundary; message + “Încearcă din nou” + link to `/ro/account`.
- **`src/app/[locale]/checkout/loading.tsx`:** Spinner + sr-only text.
- **`src/app/[locale]/account/error.tsx`:** Client error boundary; message + “Încearcă din nou” + link home.
- **`src/app/[locale]/account/loading.tsx`:** Spinner + sr-only text.
- **`src/app/(admin)/admin/error.tsx`:** Client error boundary for admin; "Încearcă din nou" + link home.
- **`src/app/(admin)/admin/loading.tsx`:** Spinner for admin segment.

### 4.4 Lazy load (Phase 2)

- **SeatMap:** `(admin)/admin/routes/[id]/page.tsx` – `dynamic(..., { ssr: false, loading: ... })`.
- **RichTextEditor:** `RouteForm.tsx`, `RouteEditForm.tsx` – `dynamic(..., { ssr: false, loading: ... })`.
- **BookingDetailSheet:** `AccountClient.tsx` – `dynamic(..., { loading: () => null })`.

### 4.5 Copy-to-clipboard (roadmap)

- **`src/lib/copyToClipboard.ts`:** `isIOS()`, `toPlainCopyableText()`, `copyToClipboardCrossBrowser()` – folosit de `BookingDetailSheet`.

### 4.6 Zod validation (Phase 3)

- **`src/lib/schemas.ts`:** `createOfflineOrderSchema`, `parseCreateOfflineOrderFormData`; `finalizeOrderSchema`, `parseFinalizeOrderOrderId`.
- **`lib/admin/orders-actions.ts`:** validează FormData cu `parseCreateOfflineOrderFormData` înainte de DB.
- **`[locale]/checkout/[orderId]/actions.ts`:** validează `orderId` cu `parseFinalizeOrderOrderId` înainte de RPC.

### 4.7 CI script

- **`package.json`:** script `check` = `lint && format:check && build` (pentru CI).

### 4.8 next.config + SQL scripts (Phase 4 & 9)

- **`images.domains`** înlocuit cu **`images.remotePatterns`** (Unsplash, placeholder, Supabase Storage din `NEXT_PUBLIC_SUPABASE_URL`).
- Scripturi SQL mutate din root în **`MD/sql-scripts/`** (check_tickets_rls, FIX_*, inspect_rls_status); README în `MD/sql-scripts/README.md`.

---

## 5. Performance & efficiency (pointers)

- **N+1:** ✅ Route detail page (`[locale]/routes/[id]/page.tsx`) – route + tickets fetches rulează în paralel cu `Promise.all`; getUser + customer rămân secvențiale (depind de user).
- **Caching:** Admin routes, dashboard, homepage already use `unstable_cache` + tags; keep revalidate values (e.g. 10–30s) and tag usage consistent.
- **Heavy UI:** ✅ SeatMap, RichTextEditor, BookingDetailSheet → lazy load (done).
- **Metrics:** ✅ În `finalizeOrder`: timing cu `Date.now()`; în development se loghează `[perf] finalizeOrder <id> took Xms` pentru a detecta regresii.

---

## 6. Security hardening

- **Auth:** Admin layout and actions check `getUser()` and `profile.role === 'admin'`; service client only server-side.
- **Secrets:** Service role key only in `service.ts` and env; never sent to client.
- **Input:** No Zod yet; add validation on FormData/params for orders, routes, and checkout (phase 3).
- **OWASP:** No raw SQL in app code; RLS on Supabase; ensure RLS covers all tables used by anon/key.

---

## 7. Quality gates (proposed)

- **CI:** `npm run lint`, `npm run format:check`, `npm run build`.
- **Pre-commit (lint-staged):** Already runs ESLint + Prettier on staged files.
- **Tests:** Add `vitest` (or Jest); run `test` in CI; target coverage on `lib/admin/*`, `checkout/actions`, `signup/actions`.
- **Commit:** Conventional commits or short rule (e.g. “fix:”, “feat:”) for changelog.

---

## 8. Deliverables summary

### Executive summary

- **Done:** Dead code removal; env guards; error/loading (checkout, account, admin); lazy load (SeatMap, RichTextEditor, BookingDetailSheet); next.config remotePatterns; SQL scripts → MD/sql-scripts; copy-to-clipboard → lib; Zod on createOfflineOrder + finalizeOrder; script `check` (lint + format:check + build).
- **Next:** Tests (Phase 6), observability (Phase 7). SEO generateMetadata deja pe routes, route/[id], account.

### Checklist of changes

- [x] Delete `AdminNav.tsx`
- [x] Delete `auth/actions.ts` (unused `linkCustomerToUser`)
- [x] Env guard in `server.ts`, `client.ts`, `service.ts`
- [x] `[locale]/checkout/error.tsx` + `loading.tsx`
- [x] `[locale]/account/error.tsx` + `loading.tsx`
- [x] `(admin)/admin/error.tsx` + `loading.tsx`
- [x] Lazy load SeatMap, RichTextEditor, BookingDetailSheet
- [x] next.config: `remotePatterns` + Supabase storage
- [x] SQL scripts: root → `MD/sql-scripts/`
- [x] Copy-to-clipboard: `lib/copyToClipboard.ts`, BookingDetailSheet folosește
- [x] Zod: `lib/schemas.ts`, createOfflineOrder + finalizeOrder validează input
- [x] CI: script `npm run check` (lint + format:check + build)

### PR-sized commits (suggested)

1. `chore: remove dead AdminNav and unused auth/actions linkCustomerToUser`
2. `fix(supabase): add env guards for URL and keys in server, client, service`
3. `feat(checkout,account): add error and loading boundaries`
4. `feat(admin): add error and loading boundaries`
5. `perf: lazy load SeatMap, RichTextEditor, BookingDetailSheet`
6. `chore(next): use images.remotePatterns, add Supabase storage pattern`
7. `chore: move SQL scripts from root to MD/sql-scripts`

### Before/after (risky changes)

- **Env guards:** Before: missing env could cause cryptic Supabase errors. After: first use of a Supabase client throws a clear message (e.g. “Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and ...”).
- **Removing auth/actions:** No callers; signup flow uses only `signup/actions.linkCustomerAfterSignup`. Behavior unchanged.
- **Error/loading:** New boundaries only; no change to success paths. Checkout and account errors now show a dedicated UI and “Încearcă din nou” instead of a generic error.
