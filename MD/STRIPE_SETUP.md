# Stripe – configurare pas cu pas (mod TEST)

Toate pașii de mai jos folosesc **modul Test** – nu se iau bani reali.

**Dacă testezi doar pe site-ul deployat pe Vercel:** nu ai nevoie de Stripe CLI. Folosești direct adresa **https://geroxym-travel.vercel.app** ca URL pentru webhook în Stripe Dashboard. Sari la secțiunea **[Test Stripe pe Vercel](#test-stripe-pe-vercel-după-deploy)** – acolo pui variabilele pe Vercel și webhook-ul.

**Stripe CLI** e necesar doar când testezi pe **localhost** (Stripe nu poate trimite webhook-uri direct la `localhost`, de aceea CLI-ul face „tunel”).

---

## Pas 1: Cont Stripe

1. Mergi la **[dashboard.stripe.com](https://dashboard.stripe.com)** și creează un cont (sau autentifică-te).
2. Asigură-te că ești în **mod Test**: în stânga jos trebuie să vezi **„Test mode”** (toggle-ul e activ). Dacă scrie „Live”, apasă pe el ca să treci în Test.

---

## Pas 2: Cheile API (test)

1. În Stripe Dashboard: **Developers** → **API keys**.
2. În secțiunea **Standard keys** (Test mode) vezi:
   - **Publishable key** – începe cu `pk_test_...`
   - **Secret key** – apasă **Reveal** și copiază cheia care începe cu `sk_test_...`
3. Copiază **Secret key** – o vei pune în `.env.local` la `STRIPE_SECRET_KEY`.

*(Publishable key nu e obligatoriu pentru fluxul actual – redirect la Stripe Checkout.)*

---

## Pas 3: Variabile în `.env.local`

Deschide fișierul **`.env.local`** din rădăcina proiectului și completează:

```env
# Deja existente (Supabase) – nu le șterge
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe – mod TEST
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# URL-ul unde rulează app-ul
# Development local:
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Sau dacă folosești alt port: http://localhost:3001
```

- **STRIPE_SECRET_KEY**: lipsește `sk_test_...` copiat la Pas 2.
- **STRIPE_WEBHOOK_SECRET**: îl completezi la **Pas 4** (webhook).
- **NEXT_PUBLIC_APP_URL**: pentru development e `http://localhost:3000`.

Salvează fișierul și repornește serverul de dev (`npm run dev`) după ce adaugi cheile.

---

## Pas 4: Webhook pentru development LOCAL (opțional – doar dacă testezi pe localhost)

**Poți să sari peste acest pas** dacă testezi doar pe Vercel (vezi secțiunea „Test Stripe pe Vercel” mai jos).

Stripe trebuie să trimită evenimentul „plată finalizată” către aplicația ta. Pe **localhost** Stripe nu poate accesa direct calculatorul tău, de aceea folosim **Stripe CLI** ca „tunel”. Pe **Vercel** nu e nevoie – pui direct URL-ul site-ului în Stripe Dashboard.

### 4.1 Instalare Stripe CLI

- **macOS (Homebrew):**
  ```bash
  brew install stripe/stripe-cli/stripe
  ```
- **Windows:** descarcă din [github.com/stripe/stripe-cli/releases](https://github.com/stripe/stripe-cli/releases).
- Sau urmărește: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli).

### 4.2 Login (o singură dată)

```bash
stripe login
```

Se deschide browserul; autorizezi CLI-ul cu contul Stripe.

### 4.3 Pornește tunelul webhook

Într-un terminal (lasă-l deschis cât testezi):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

În output vei vedea ceva de genul:

```text
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

Copiază acel **signing secret** (`whsec_...`) și pune-l în `.env.local` la **STRIPE_WEBHOOK_SECRET**:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

Repornește `npm run dev` după ce salvezi.

---

## Pas 5: Carduri de test Stripe

În mod **Test**, Stripe acceptă doar carduri de test. Poți folosi oricare din:

| Scop              | Număr card        | Dată  | CVC   |
|-------------------|-------------------|-------|-------|
| Scop              | Număr card        | Ce se întâmplă |
|-------------------|-------------------|----------------|
| Plată reușită     | `4242 4242 4242 4242` | Tranzacția merge, bilete alocate. |
| **Plată refuzată** („fonduri insuficiente” / card declinat) | `4000 0000 0000 0002` | Stripe afișează eroare, comanda rămâne neplătită. |
| Card expirat       | `4000 0000 0000 0069` | Stripe refuză – card expirat. |
| CVC greșit         | `4000 0000 0000 0127` | Stripe refuză – CVC invalid. |

- **Dată / CVC**: orice valide (ex. 12/34, 123). **Email** și **țara**: orice.

Listă completă: [stripe.com/docs/testing#cards](https://stripe.com/docs/testing#cards).

---

## Pas 6: Testare fluxul

1. Pornește aplicația:
   ```bash
   npm run dev
   ```
2. Pornește webhook-ul (în alt terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. În browser: alege o rută → Completează datele → **Continue to Payment** → **Pay with Card (Stripe)**.
4. Pe pagina Stripe introdu cardul de test **4242 4242 4242 4242** (și restul cu orice valide).
5. După plată ești redirecționat la pagina de success; biletele sunt alocate și comanda apare ca plătită.

În terminalul unde rulează `stripe listen` vei vedea evenimentul `checkout.session.completed` primit.

---

## Rezumat variabile `.env.local` (mod test)

| Variabilă                | Exemplu / Unde o găsești |
|--------------------------|---------------------------|
| `STRIPE_SECRET_KEY`      | `sk_test_...` din Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET`  | `whsec_...` din output-ul comenzii `stripe listen` |
| `NEXT_PUBLIC_APP_URL`    | `http://localhost:3000` (development) |

După ce treci în **producție**, înlocuiești cu chei **Live** (`sk_live_...`, `pk_live_...`) și pui webhook real către domeniul tău în Stripe Dashboard.

---

## Test Stripe pe Vercel (după deploy)

După ce ai dat deploy pe Vercel, urmează pașii de mai jos ca să testezi că plățile merg end-to-end. **Nu instalezi Stripe CLI** – Stripe trimite webhook-uri direct la **https://geroxym-travel.vercel.app/api/webhooks/stripe**.

### 1. Variabile de mediu pe Vercel

În **Vercel** → proiectul tău → **Settings** → **Environment Variables** adaugă (sau completează):

| Name | Value | Environment |
|------|--------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` (din Stripe Dashboard → Developers → API keys) | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | îl obții la pasul 2 | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://geroxym-travel.vercel.app` | Production, Preview |

Salvezi și faci **Redeploy** (sau un nou deploy) ca variabilele să se aplice.

### 2. Webhook în Stripe către Vercel

1. Mergi la **[dashboard.stripe.com](https://dashboard.stripe.com)** (mod **Test** – stânga jos).
2. **Developers** → **Webhooks** → **Add endpoint**.
3. **Endpoint URL**: `https://geroxym-travel.vercel.app/api/webhooks/stripe`
4. **Events to send**: alege **Select events** → caută și bifează **checkout.session.completed** → **Add endpoint**.
5. După ce se creează endpoint-ul, apasă pe el → **Reveal** la **Signing secret**.
6. Copiază valoarea (`whsec_...`) și o pui în Vercel la variabila **STRIPE_WEBHOOK_SECRET** (pasul 1).
7. Faci din nou **Redeploy** pe Vercel ca să ia noua valoare.

### 3. Testare fluxul pe site-ul live

1. Deschide **https://geroxym-travel.vercel.app**.
2. Mergi la rute (ex. `/ro/routes` sau `/routes`), alege o rută activă.
3. Completează cantitatea și datele (nume, email, telefon) → **Continue to Payment**.
4. Pe pagina de confirmare apasă **Pay with Card (Stripe)**.
5. Ești dus pe Stripe Checkout. Introdu:
   - **Card**: `4242 4242 4242 4242`
   - **Dată**: orice viitoare (ex. 12/34)
   - **CVC**: orice 3 cifre (ex. 123)
   - **Email**: orice
6. Apasă **Pay** (sau **Plătește**).
7. Ar trebui să fii redirecționat la pagina de success cu „Booking Confirmed!” și numerele de loc.
8. Verifică în **Stripe Dashboard** → **Payments**: apare plata de test.
9. Verifică în **admin** → **Orders**: comanda apare cu status plătit; în **Tickets** vezi biletele alocate.

Dacă la pasul 7 vezi „Processing your payment...” mai mult de ~10 secunde, verifică în Stripe → **Developers** → **Webhooks** → endpoint-ul tău → **Recent deliveries**: dacă sunt erori (4xx/5xx), deschide request-ul și vezi răspunsul. De obicei problema e la **STRIPE_WEBHOOK_SECRET** (valoare greșită sau lipsește după redeploy).

---

## Verificări după o plată de test

După ce faci o plată cu cardul de test, poți verifica că totul e în regulă:

| Unde | Ce verifici |
|------|-------------|
| **Site** → pagina de success | Mesaj „Booking Confirmed!”, numere de loc, email client. |
| **Site** → **Cont** (dacă e logat) / **My Bookings** | Rezervarea apare în listă cu status plătit. |
| **Admin** → **Orders** | Comanda apare cu status `paid` sau `paid_offline`, source `online`. |
| **Admin** → **Tickets** | Bilete create pentru acea comandă, cu numere de loc. |
| **Stripe Dashboard** → **Payments** | Plata apare cu suma corectă, status „Succeeded”. |
| **Stripe Dashboard** → **Webhooks** → endpoint-ul tău → **Recent deliveries** | Ultimul eveniment `checkout.session.completed` cu răspuns 200. |

**Plată refuzată (test):** folosești cardul `4000 0000 0000 0002` – Stripe afișează eroare, comanda rămâne în status `created`, nu se alocă bilete. Poți reîncerca cu un alt card sau anula.

---

## Modificarea detaliilor afișate la plată (Stripe Checkout)

Textul care apare pe pagina Stripe (nume produs, descriere) se setează în cod:

**Fișier:** `src/lib/stripe/server.ts`

Caută liniile cu `productName` și `productDescription` (în funcția `createCheckoutSessionForOrder`). Poți schimba, de exemplu:

```ts
const productName = 'Bilet autocar - Geroxym Travel'
const productDescription =
  order.quantity === 1
    ? '1 bilet'
    : `${order.quantity} bilete`
```

Exemple de modificări:
- **Nume:** „Bilet autocar”, „Geroxym Travel - Bilet”, „Călătorie București – Brașov” etc.
- **Descriere:** poți pune rută, dată plecare etc. dacă le trimiți în obiectul `order` și le folosești aici.

După modificare, salvezi și faci deploy; la următoarea plată pe Stripe se va afișa noul text.
