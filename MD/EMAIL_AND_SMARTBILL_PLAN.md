# Plan production-ready: Email (Resend) + Facturare (SmartBill)

Document de planificare pentru implementarea mâine. Arhitectură, fluxuri, idempotență, erori și pași concreți.

---

## 1. Email (Resend)

### 1.1 Scop
- **Transactional only**: confirmare rezervare, anulare, reminder etc. (lista completă mai jos).
- **Nu** marketing / newsletter (poate fi separat mai târziu).

### 1.2 Lista completă de emailuri (tipuri)

| Tip | Când se trimite | Conținut | Atașament |
|-----|------------------|----------|-----------|
| **Confirmare rezervare** | După plată reușită (order → paid) | Salut, nume; rută, dată/ora; nr bilete, locuri alocate; sumă plătită; link „Vezi rezervările” / Cont | **Da: PDF factură** (dacă factura a fost emisă) |
| **Anulare bilet** | După ce admin/client anulează un bilet | Confirmare anulare: rută, dată, loc anulat; sumă rambursată (dacă e cazul); link cont | Nu (sau PDF factură stornare, dacă există) |
| **Reminder înainte de cursă** | X zile/ore înainte de data plecării (cron) | Reamintire: rută, dată, ora, locuri; link „Detalii rezervare”; eventual instrucțiuni (loc întâlnire etc.) | Nu (sau da: PDF factură, dacă vrei) |
| **Confirmare anulare rută** | După ce admin anulează o rută | Rută anulată, dată; biletele tale vor fi rambursate / reprogramate conform politicii; link cont | Nu |
| (Opțional) **Recuperare rezervare** | Comandă `created` neplătită, după Y ore | „Ai lăsat bilete în coș”; link direct la checkout; expiră în Z ore | Nu |

**Prioritate implementare:**  
1. **Confirmare rezervare** (cu PDF factură atașat).  
2. **Anulare bilet.**  
3. **Reminder** (cron).  
4. Restul la cerere.

### 1.3 Factură atașată la emailul de confirmare
- **Obligatoriu:** Emailul de confirmare rezervare trebuie să conțină **atașament PDF factură** (dacă factura a fost emisă cu succes).
- **Ordine în flux:** 1) allocate_tickets, 2) createSmartBillInvoice (obținem PDF sau link), 3) sendBookingConfirmationEmail cu PDF atașat (Resend acceptă attachments).
- Dacă SmartBill returnează **link** la PDF: putem fie să atașăm PDF-ul (fetch link → buffer → attach), fie să punem doar link în email. **Recomandat:** atașament PDF în email ca utilizatorul să aibă factura și offline.
- Dacă factura eșuează temporar: trimitem emailul de confirmare **fără** atașament, cu text „Factura ți se va trimite separat după emitere.” + retry factură în background; la retry, putem trimite un al doilea email „Factura ta” cu PDF atașat (sau un singur email „Factură emisă” cu PDF).

### 1.4 Arhitectură production-ready
- **Unde apelăm trimiterea:** După `finalizeOrderLogic` (success) – același punct folosit de webhook Stripe și de fallback pe success page. Un singur loc: „order marcat paid → trimite email + eventual SmartBill”.
- **Idempotență:** Verificăm dacă emailul pentru această comandă a fost deja trimis (ex. câmp `order.metadata` sau tabel `email_log(order_id, type, sent_at)`) ca să nu trimitem duplicate la retry/webhook + fallback.
- **Erori:** Dacă Resend dă eroare, **nu** dăm rollback la `allocate_tickets`. Logăm eroarea, eventual queue retry. Utilizatorul e deja plătit; emailul poate fi retrimis manual sau prin retry.
- **Env:** `RESEND_API_KEY`, `EMAIL_FROM` (ex. `noreply@domeniul-tau.ro`). Resend cere domeniu verificat în producție.
- **Template:** Un template simplu (HTML) cu variabile: customer name, route, date, seats, amount. Putem folosi React Email sau HTML simplu.

### 1.5 Structură fișiere (sugestie)
```
src/lib/
  email/
    client.ts       # Resend client, sendEmail(order, type)
    templates/
      booking-confirmation.tsx  # sau .html
  checkout/
    finalize-order-logic.ts    # după allocate_tickets: sendBookingConfirmationEmail(orderId)
```
- Tabel opțional: `email_log (id, order_id, type, provider_message_id, sent_at)` pentru idempotență și debugging.

### 1.6 Flux (confirmare rezervare, cu factură atașată)
1. Stripe webhook sau success-page fallback → `finalizeOrderLogic(orderId)`.
2. `allocate_tickets` reușește → order devine `paid`.
3. **Factură:** createSmartBillInvoiceIfNeeded(orderId) → PDF (buffer) sau null.
4. Citim order + route + customer + tickets (seat numbers).
5. Verificăm idempotență email (order_id + tip `booking-confirmation` deja trimis? → skip).
6. Generăm conținut (template) și apelăm Resend **cu attachment** PDF factură (dacă avem).
7. Logăm succes (email_log etc.); la eroare: log, fără throw.

---

## 2. SmartBill (factura electronica)

### 2.1 Scop
- Emitere factură (PDF + ANAF) pentru comenzi plătite (`paid` / `paid_offline`).
- Conformitate Romania: factură electronică cu seria, număr, XML ANAF (SmartBill se ocupă de semnare/trimitere).

### 2.2 Ce avem nevoie de la SmartBill.ro
- **API SmartBill.ro** (nu Smartbills.io): REST sau SOAP, documentație pe site-ul SmartBill.ro.
- **Credențiale:** utilizator + token (sau parolă) din contul SmartBill.
- **Date firmă:** CIF, sediu, cont bancar – deja în SmartBill; aplicația trimite doar datele facturii (client, produse, sumă).

### 2.3 Date pentru factură
- **Emitent:** din cont SmartBill (compania ta).
- **Client:** `customers`: nume, CIF/CNP (opțional), adresă, email, telefon. Dacă nu avem CIF, factură pentru persoană fizică (CNP opțional).
- **Produs/serviciu:** un singur „linie” – ex. „Bilet autocar: [Origin] – [Destination], [data]” sau produs generic în SmartBill legat de servicii transport.
- **Cantitate:** `order.quantity`, **Preț unitar:** `order.amount_cents / 100 / order.quantity`, **Total:** `order.amount_cents / 100`.
- **Număr factură:** generat de SmartBill (sau trimis de noi dacă API-ul permite).

### 2.4 Arhitectură production-ready
- **Moment emitere:** După ce order devine `paid` (același punct ca emailul). Un singur flux: „order paid → email + factură”.
- **Idempotență:** Stocăm `order.smartbill_invoice_id` sau `invoice_series` + `invoice_number` (în `orders` sau tabel `invoices`). Înainte de a apela SmartBill, verificăm dacă pentru `order_id` există deja factură → skip.
- **Erori:** Dacă SmartBill dă eroare (rețea, validare CIF, etc.), **nu** dăm rollback la plată. Logăm, notificăm admin (ex. email sau dashboard). Posibilitate „Retry emitere factură” din admin pentru comanda respectivă.
- **Env:** `SMARTBILL_USER`, `SMARTBILL_TOKEN` (sau parolă, conform doc SmartBill). Posibil `SMARTBILL_BASE_URL` pentru sandbox vs producție.
- **Produs în SmartBill:** Fie ai deja un „serviciu”/produs în SmartBill (ex. „Transport persoane”), fie trimitem denumire dinamică conform API (dacă e permis).

### 2.5 Structură fișiere (sugestie)
```
src/lib/
  smartbill/
    client.ts       # auth, createInvoice(payload)
    types.ts        # payload factură (client, linii, total)
    map-order-to-invoice.ts   # order + route + customer → payload SmartBill
  checkout/
    finalize-order-logic.ts   # după allocate_tickets: sendEmail + createInvoice (ambele cu idempotență)
```
- DB: fie coloană pe `orders`: `invoice_series`, `invoice_number`, `invoice_pdf_url` (dacă SmartBill returnează link), fie tabel `invoices (id, order_id, smartbill_id, series, number, pdf_url, created_at)`.

### 2.6 Flux (și return PDF pentru email)
1. După `allocate_tickets` reușit.
2. Verificăm idempotență factură pentru `order_id` (ex. `order.invoice_number` sau `invoices.order_id`) → dacă există, returnăm PDF existent (download din SmartBill dacă e link) sau skip.
3. Construim payload: client (customer), linie (descriere, cantitate, preț, TVA dacă e cazul).
4. Apelăm SmartBill API (creare factură).
5. Salvăm seria + număr + **link PDF** (sau download PDF imediat) pe order / `invoices`.
6. **Returnăm PDF** (buffer) către caller: folosit ca **atașament în emailul de confirmare** (Resend acceptă attachments).
7. La eroare: log, stocare „failed” pentru retry; return null – emailul se trimite fără atașament.

---

## 3. Integrarea în finalizarea comenzii

### 3.1 Un singur punct de „post-payment”
Toate acțiunile după plată (în afară de `allocate_tickets`) să fie într-un modul clar:

```
finalizeOrderLogic(orderId):
  1. allocate_tickets(orderId)              → obligatoriu, throw la eroare
  2. createSmartBillInvoiceIfNeeded(...)    → idempotent, returnează PDF (sau null la eșec)
  3. sendBookingConfirmationEmail(..., pdf) → idempotent, cu PDF factură atașat (dacă avem)
  return { success, seatNumbers }
```

Astfel, atât webhook-ul Stripe cât și fallback-ul de pe success page parcurg același flux; nu duplicăm logica.

### 3.2 Ordinea (factură înainte de email)
1. **allocate_tickets** – trebuie să reușească ca order să fie paid.
2. **SmartBill** – emitem factura și obținem PDF (sau link → download → buffer). La eșec: log, retry ulterior; nu blocăm emailul.
3. **Email confirmare** – cu PDF factură **atașat** dacă factura a fost emisă; altfel email fără atașament + text „Factura ți se va trimite separat.” (și retry factură în background).

### 3.3 Idempotență la nivel de order
- **Email:** `email_log` cu `(order_id, type)` unique sau verificare în `orders.metadata`.
- **Factură:** `orders.invoice_number` sau `invoices.order_id` – o singură factură per order.

---

## 4. Ce facem mâine (checklist)

### 4.1 Pregătire
- [ ] Cont Resend: verificare domeniu, API key.
- [ ] Cont SmartBill.ro: utilizator + token, citit doc API (creare factură).
- [ ] Env: `RESEND_API_KEY`, `EMAIL_FROM`; `SMARTBILL_USER`, `SMARTBILL_TOKEN` (sau ce folosește SmartBill).

### 4.2 Email
- [ ] `src/lib/email/client.ts` – wrapper Resend, `sendBookingConfirmation(orderId, pdfBuffer?)` (cu atașament opțional).
- [ ] Template confirmare (HTML sau React Email): nume, rută, dată, nr locuri, sumă, link cont; text „Atașat: factura în PDF.” când există PDF.
- [ ] Apel din `finalizeOrderLogic` după factură, cu PDF atașat (buffer de la SmartBill).
- [ ] Idempotență: email_log sau metadata; la eroare: log, fără throw.
- [ ] (Mai târziu) Template anulare bilet, reminder, anulare rută – conform listei de tipuri.

### 4.3 SmartBill
- [ ] `src/lib/smartbill/client.ts` – autentificare + creare factură + **obținere PDF** (download dacă API returnează link).
- [ ] Mapare order + route + customer → payload SmartBill (client, linie, total).
- [ ] Salvare serie + număr + pdf_url (sau stocare locală PDF) în `orders` sau tabel `invoices`.
- [ ] **Return PDF** (Buffer) din `createSmartBillInvoiceIfNeeded` pentru atașare la email.
- [ ] Apel din `finalizeOrderLogic` **înainte** de email; la eșec return null – email fără atașament.
- [ ] Retry: pagină admin „Comenzi fără factură / Retry” + opțional email „Factura ta” cu PDF la retry.

### 4.4 DB (dacă e nevoie)
- [ ] Migrare: `email_log (id, order_id, type, sent_at)`; `orders.invoice_series`, `orders.invoice_number`, `orders.invoice_pdf_url` (sau tabel `invoices`).

### 4.5 Obligatoriu
- [ ] **Atașare PDF factură** la emailul de confirmare rezervare (dacă factura a fost emisă cu succes).

---

## 5. Rezumat

| Componentă | Trigger | Idempotență | La eroare | Ieșire pentru următorul pas |
|------------|---------|-------------|-----------|-----------------------------|
| allocate_tickets | Webhook / success page | Da (order status) | Throw | - |
| SmartBill | După allocate_tickets | Da (invoice per order) | Log, retry | **PDF (buffer)** sau null |
| Email (Resend) | După SmartBill | Da (email_log) | Log | - |

**Ordine:** allocate_tickets → SmartBill (obținem PDF) → Email confirmare **cu PDF factură atașat**.

**Lista emailuri:** Confirmare rezervare (cu factură atașată), Anulare bilet, Reminder înainte de cursă, Anulare rută, (opțional) Recuperare rezervare. Prioritate: confirmare + factură atașată, apoi anulare bilet, apoi restul.

Dacă mâine ai documentația SmartBill.ro (creare factură + download PDF), putem implementa fluxul complet; altfel primul pas e să obții doc-ul API.
