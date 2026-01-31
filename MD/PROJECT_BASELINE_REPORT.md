# Project Baseline Report - Geroxym Travel
**Generated:** 2025-01-27  
**Purpose:** Starting point audit for Next.js + Supabase + online payment seat booking system

---

## A) Tech Stack Summary

- **Framework:** Next.js 15.5.4 (with Turbopack)
- **Router:** App Router (not Pages Router)
- **Language:** TypeScript 5.x
- **UI/styling:** 
  - Tailwind CSS v4 (via PostCSS)
  - shadcn/ui component library (New York style)
  - Radix UI primitives
  - Framer Motion for animations
  - Lucide React for icons
- **Backend:** None currently (no API routes, no server actions)
- **Auth:** Not found
- **Payments:** Not found
- **Deployment config:** Basic Next.js config (Vercel-ready, image optimization enabled)

---

## B) Current Features (what works now)

- ✅ **Landing page** (`src/app/[locale]/page.tsx`)
  - Hero section with parallax effects
  - Search form UI (non-functional - static dropdowns)
  - Popular routes showcase (static cards)
  - About section with features
  - Parallax section
  - Testimonials section
  - Footer with contact info
  - Responsive design (mobile/tablet/desktop)
  - Smooth scrolling navigation
  - Back-to-top button

- ✅ **Internationalization (i18n)**
  - next-intl integration
  - Romanian (ro) and English (en) support
  - Locale routing: `/ro` and `/en`
  - Translation files: `locales/ro.json`, `locales/en.json`
  - Config: `i18n.ts`

- ✅ **UI Component Library**
  - shadcn/ui components installed (50+ components in `components/ui/`)
  - Custom components in `src/components/ui/` (button, card, dialog, input, select, sheet)
  - Layout components: Header.tsx, Footer.tsx (in `src/components/layout/`)

- ✅ **Styling System**
  - Tailwind CSS v4 with custom theme
  - Dark mode support (CSS variables)
  - Custom animations (fade-in, parallax, scroll-triggered)
  - Custom scrollbar styling
  - Typography: Poppins (headings), Inter (body)

- ✅ **Developer Experience**
  - ESLint + Prettier configured
  - Husky + lint-staged for git hooks
  - TypeScript strict mode
  - Path aliases: `@/*` → `./src/*`

---

## C) Missing Features vs. Goal

### Landing polish:
- ⚠️ Search form is non-functional (static dropdowns, no API calls)
- ⚠️ "Rezervă acum" buttons don't navigate anywhere
- ⚠️ Route cards are static (no dynamic data)
- ⚠️ No actual route search/results page

### Admin dashboard:
- ❌ **Not found** - No admin routes, components, or authentication
- ❌ No admin layout or protected routes
- ❌ No CRUD interfaces for routes, buses, schedules

### Routes CRUD:
- ❌ **Not found** - No database schema
- ❌ No API routes for routes management
- ❌ No server actions for data operations
- ❌ No route model/types

### Seat-map UI:
- ❌ **Not found** - No seat selection component
- ❌ No bus layout visualization
- ❌ No seat availability logic

### Booking flow:
- ❌ **Not found** - No booking pages/routes
- ❌ No booking form (passenger details)
- ❌ No booking confirmation page
- ❌ No booking history/user account

### Online payment:
- ❌ **Not found** - No payment gateway integration (Stripe/Netopia/etc.)
- ❌ No payment processing endpoints
- ❌ No payment success/failure handlers

### Concurrency/double-book prevention:
- ❌ **Not found** - No database locking mechanism
- ❌ No real-time seat availability updates
- ❌ No booking transaction system

---

## D) File Map (where to edit)

### Landing:
- **Main landing page:** `src/app/[locale]/page.tsx` (1042 lines - large monolithic component)
  - Contains all sections: hero, search, routes, about, parallax, testimonials, footer
  - Uses shadcn/ui components: Button, Card, Input
  - Client component with scroll handlers and state

- **Layout components:**
  - `src/components/layout/Header.tsx` - Alternative header (uses next-intl, not currently used)
  - `src/components/layout/Footer.tsx` - Alternative footer (uses next-intl, not currently used)
  - Note: Landing page has inline header/footer, these components exist but aren't used

- **Root layout:** `src/app/layout.tsx` - Root HTML structure, fonts, metadata
- **Locale layout:** `src/app/[locale]/layout.tsx` - Minimal wrapper (just renders children)

### Admin:
- ❌ **Not found** - Need to create:
  - `src/app/[locale]/admin/` directory
  - Admin layout with sidebar
  - Protected route middleware
  - Admin dashboard page
  - Routes management pages
  - Bookings management pages

### Booking:
- ❌ **Not found** - Need to create:
  - `src/app/[locale]/routes/` - Route search results
  - `src/app/[locale]/routes/[id]/` - Route details & seat selection
  - `src/app/[locale]/booking/` - Booking form
  - `src/app/[locale]/booking/[id]/` - Booking confirmation
  - `src/app/[locale]/my-bookings/` - User booking history

### Supabase:
- ❌ **Not found** - Need to create:
  - `src/lib/supabase/client.ts` - Supabase client initialization
  - `src/lib/supabase/server.ts` - Server-side Supabase client
  - `src/lib/supabase/middleware.ts` - Auth middleware
  - Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Database schema/migrations (SQL files or Supabase migrations)

### Payments:
- ❌ **Not found** - Need to create:
  - `src/app/api/payments/` - Payment processing endpoints
  - `src/lib/payments/` - Payment gateway integration (Stripe/Netopia)
  - Payment success/failure pages
  - Webhook handlers for payment callbacks

### Shared UI:
- **Component library:** `components/ui/` (50+ shadcn/ui components)
- **Custom components:** `src/components/ui/` (button, card, dialog, input, select, sheet)
- **Utilities:** `src/lib/utils.ts` (cn, formatDate, formatCurrency)
- **Hooks:** `hooks/use-mobile.ts`, `hooks/use-toast.ts`

### Configuration:
- **i18n:** `i18n.ts` - next-intl configuration
- **Translations:** `locales/ro.json`, `locales/en.json`
- **Tailwind:** `src/app/globals.css` - Theme variables and custom styles
- **Next.js:** `next.config.ts` - Image domains, package optimization
- **TypeScript:** `tsconfig.json` - Path aliases, strict mode
- **shadcn/ui:** `components.json` - Component configuration

---

## E) Immediate Next Steps (top 5)

1. **Set up Supabase integration**
   - Install `@supabase/supabase-js` and `@supabase/ssr`
   - Create `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`
   - Add environment variables to `.env.local`
   - Create database schema (routes, buses, seats, bookings, users)
   - Set up Row Level Security (RLS) policies
   - File: `src/lib/supabase/` (new directory)

2. **Create database schema and migrations**
   - Design tables: `routes`, `buses`, `seats`, `bookings`, `users`, `payments`
   - Create migration SQL files or use Supabase dashboard
   - Set up foreign keys and indexes
   - File: `supabase/migrations/` (new directory) or SQL files

3. **Build route search functionality**
   - Create API route or server action: `src/app/api/routes/search/route.ts`
   - Connect search form in landing page to API
   - Create results page: `src/app/[locale]/routes/page.tsx`
   - File: `src/app/[locale]/page.tsx` (modify search form), `src/app/[locale]/routes/page.tsx` (new)

4. **Create seat selection UI component**
   - Build seat map component: `src/components/booking/SeatMap.tsx`
   - Integrate with route details page
   - Handle seat availability in real-time
   - File: `src/components/booking/SeatMap.tsx` (new), `src/app/[locale]/routes/[id]/page.tsx` (new)

5. **Set up authentication and admin dashboard**
   - Install Supabase Auth helpers
   - Create auth middleware: `src/middleware.ts`
   - Build admin layout: `src/app/[locale]/admin/layout.tsx`
   - Create admin dashboard: `src/app/[locale]/admin/page.tsx`
   - Add routes CRUD interface
   - File: `src/middleware.ts` (new), `src/app/[locale]/admin/` (new directory)

---

## Additional Notes

### Environment Variables Expected:
```env
# Supabase (to be added)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Payment Gateway (to be added - choose one)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
# OR
NETOPIA_API_KEY=
NETOPIA_SECRET_KEY=

# App (if needed)
NEXT_PUBLIC_APP_URL=
```

### Current Code Quality:
- ✅ TypeScript strict mode enabled
- ✅ ESLint configured
- ⚠️ Large monolithic component (`src/app/[locale]/page.tsx` - 1042 lines) - consider refactoring into smaller components
- ⚠️ Some unused components (`src/components/layout/Header.tsx`, `Footer.tsx` - not used in main page)
- ✅ Good use of shadcn/ui components
- ✅ Responsive design implemented

### Architecture Recommendations:
1. **Refactor landing page** - Split `src/app/[locale]/page.tsx` into section components in `src/components/sections/`
2. **Create API layer** - Use Next.js App Router API routes or Server Actions for data fetching
3. **Add state management** - Consider Zustand or React Context for booking flow state
4. **Implement real-time updates** - Use Supabase Realtime for seat availability
5. **Add error boundaries** - Implement error handling for API calls and payment processing

---

**Status:** ✅ Audit Complete - Ready for implementation phase

