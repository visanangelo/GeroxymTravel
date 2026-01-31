# Stripe – plăți online

## Variabile de mediu (.env.local)

- **STRIPE_SECRET_KEY** – cheia secretă din Stripe Dashboard → Developers → API keys. Folosită pe server pentru Checkout Session și webhook.
- **STRIPE_WEBHOOK_SECRET** – signing secret al endpoint-ului webhook (vezi mai jos).
- **NEXT_PUBLIC_APP_URL** – URL-ul public al aplicației (ex. `https://geroxym-travel.vercel.app`). Folosit pentru `success_url` și `cancel_url` la Stripe Checkout.

## Configurare Stripe

1. **Cont Stripe** – [dashboard.stripe.com](https://dashboard.stripe.com). În test folosești chei de test (prefix `pk_test_` / `sk_test_`).

2. **Webhook** – în Dashboard → Developers → Webhooks → Add endpoint:
   - **URL**: `https://<domeniul-tau>/api/webhooks/stripe`
   - **Events**: `checkout.session.completed`
   - După creare, copiază **Signing secret** și pune-l în `STRIPE_WEBHOOK_SECRET`.

3. **Test local webhook** – cu Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Folosești signing secret-ul afișat de CLI în `.env.local` pentru development.

## Flux

1. Utilizatorul creează o comandă (guest sau auth) → order cu `status: 'created'`.
2. Pe pagina de confirmare / checkout apasă **Pay with Card (Stripe)** → se apelează `createCheckoutSession` → redirect la Stripe Checkout.
3. După plată, Stripe redirecționează la `/{locale}/checkout/success?orderId=...&session_id=...`.
4. Stripe trimite evenimentul `checkout.session.completed` la webhook → `finalizeOrderLogic(order_id)` → alocare bilete și `order.status = 'paid'`.
5. Pagina de success afișează detaliile comenzii. Dacă webhook-ul întârzie, se afișează „Processing your payment...”.

## Fără Stripe configurat

Dacă `STRIPE_SECRET_KEY` lipsește, butonul de plată încearcă mai întâi Stripe; la eroare „Missing STRIPE_SECRET_KEY” se folosește **simularea** (finalizeOrder direct, fără plată reală). Util pentru development fără cont Stripe.
