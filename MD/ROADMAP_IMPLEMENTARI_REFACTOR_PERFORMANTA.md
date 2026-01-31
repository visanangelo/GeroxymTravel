# Roadmap: implementări, refactorizări, performanță

**Data:** 2025-01-31

---

## 1. Implementări de făcut

### Prioritate mare
- **Stripe / plată online** – fluxul de checkout există; integrare Stripe (sessions, webhook) pentru plăți reale.
- **Notificări email** – confirmare rezervare, anulare, reminder (ex. Resend, SendGrid, Supabase Edge Functions).
- **Export rapoarte** – admin: export CSV/PDF pentru orders, rute, venituri (conform NEXT_STEPS.md).

### Prioritate medie
- **SEO / meta** – `generateMetadata` pe paginile publice (routes, route/[id], account) cu title/description dinamic.
- **Erori și loading** – `error.tsx` și `loading.tsx` pe rute critice (checkout, account, admin).
- **Tests** – unit tests pentru actions (createOrder, allocate_tickets), E2E pentru flux booking.

### Prioritate mică
- **Internaționalizare completă** – toate stringurile din admin și checkout în `ro.json`/`en.json`.
- **PWA / offline** – service worker pentru cache (opțional).

---

## 2. Refactorizări necesare

### De ce există două structuri admin: `(admin)/admin` vs `[locale]/admin`

- **Folosiți doar** `localhost/admin` → zona reală este **`(admin)/admin`** (URL-uri `/admin`, `/admin/routes`, `/admin/orders`, etc., **fără** locale în path).
- **`[locale]/admin`** (ex. `/ro/admin`) este **legacy**: toate paginile din `[locale]/admin` fac **redirect** la `/admin/...`. Există pentru:
  - orice link vechi sau bookmark către `/ro/admin`;
  - eventual redirect din middleware de la `/[locale]/admin` → `/admin`.
- **Concluzie:** Nu sunt două zone admin active; e una singură (`/admin`). A doua structură e doar un set de pagini de redirect. Actions/components partajate sunt deja în `lib/admin/` (orders, routes, tickets); entry-urile din `(admin)/admin` și `[locale]/admin` le folosesc sau redirecționează.
- **Important:** Toate linkurile din zona admin trebuie să pointeze la **`/admin`** (nu `/${locale}/admin`), ca să nu existe redirect inutil la fiecare click.

- **Făcut:** Structura **`[locale]/admin`** a fost **ștearsă complet**. Nu există nicio rută `/[locale]/admin`; butonul „Open Dashboard” din header duce direct la **`/admin`**. Accesul la `/ro/admin` etc. va returna 404.

### Actions și tipuri partajate
- `(admin)/admin/orders/actions.ts` și `[locale]/admin/orders/actions.ts` sunt aproape identice (doar `revalidatePath` cu/sans locale).
- La fel pentru routes și tickets.
- **Refactor:** un singur fișier de actions (ex. `lib/admin/orders-actions.ts`) care primește `locale?: string` și apelează `revalidatePath(locale ? `/${locale}/admin/orders` : '/admin/orders')`.

### Copy-to-clipboard
- Logica din `BookingDetailSheet` (toPlainCopyableText, copyToClipboardCrossBrowser, isIOS) poate fi mutată într-un hook `useCopyToClipboard()` sau util `lib/copyToClipboard.ts` dacă se folosește și în alte locuri.

---

## 3. Performanță și eficiență

### Deja în place
- `unstable_cache` pe homepage routes, admin routes, dashboard.
- `cache()` (React) pe orders și tickets pentru navigare în admin.
- `revalidate = 30` pe unele pagini admin.
- `optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']` în next.config.
- Imagini: lazy loading, `sizes`, priority pe hero.
- Migrații cu indexuri pe routes, orders, tickets, customers.

### De adăugat

1. **Lazy load componente grele**
   - `SeatMap` – încărcat doar pe pagina de detaliu rută admin: `dynamic(() => import('@/components/admin/SeatMap'), { ssr: false })` dacă e dependent de canvas/DOM.
   - `RichTextEditor` (TipTap) – `dynamic(..., { ssr: false })` în RouteForm/RouteEditForm.
   - `BookingDetailSheet` – `dynamic(..., { loading: () => null })` în AccountClient ca Sheet-ul să nu mărească bundle-ul inițial al paginii Account.

2. **Prefetch / revalidare**
   - După finalizare checkout, pe lângă `revalidatePath('/account')` și `/routes`, poți folosi `revalidateTag('account-orders')` dacă pui tag pe query-ul de orders din account.
   - Link-uri către `/account` și `/routes` pot rămâne cu prefetch implicit (Next.js); pentru admin, prefetch la hover pe sidebar (opțional).

3. **Bundle**
   - Verificare cu `ANALYZE=true next build`; dacă `framer-motion` sau `@tiptap/*` sunt mari, limitare la paginile care le folosesc (lazy + dynamic).

4. **Imagini**
   - Dacă folosiți Supabase Storage pentru imagini rute, adăugare în `next.config` la `images.remotePatterns` (nu doar `domains`).

5. **Database**
   - Asigurare că migrațiile cu indexuri sunt aplicate în producție.
   - Pentru liste mari (orders, tickets), păstrare paginare (ex. 20 per page) și evitare `select('*')` fără limit.

---

## 4. Ordine sugerată

1. **Refactor admin** – un singur set de actions/components, două entry-uri (route groups) care le folosesc.
2. **Lazy load** – SeatMap, RichTextEditor, eventual BookingDetailSheet.
3. **Erori / loading** – error.tsx și loading.tsx pe checkout și account.
4. **Stripe + email** – conform priorității business.
5. **SEO** – generateMetadata pe paginile publice.
6. **Tests** – acoperire minimă pe actions și flux critic.

Dacă vrei, următorul pas poate fi concretizat pe un singur punct (ex. refactor admin sau lazy load SeatMap + RichTextEditor).
