# Stripe – configurare pas cu pas (mod TEST)

Toate pașii de mai jos folosesc **modul Test** – nu se iau bani reali.

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

## Pas 4: Webhook pentru development (test local)

Stripe trebuie să trimită evenimentul „plată finalizată” către aplicația ta. Pe calculatorul tău local Stripe nu poate accesa direct `localhost`, de aceea folosim **Stripe CLI** ca „tunel”.

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
| Plată reușită     | `4242 4242 4242 4242` | Orice dată viitoare (ex. 12/34) | Orice 3 cifre (ex. 123) |
| Plată refuzată    | `4000 0000 0000 0002` | Orice viitoare | Orice |
| Autentificare 3D  | `4000 0025 0000 3155` | Orice viitoare | Orice |

- **Email**: orice (ex. `test@example.com`).
- **Țara**: orice (ex. România).

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
