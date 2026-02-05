# Configurare Resend: SMTP (Supabase) + Email din app

Totul de la Resend: un cont, un API key. SMTP pentru Supabase Auth, API pentru emailurile din aplicație.

---

## Fără domeniu (testing)

Dacă **nu ai încă domeniu** (app în testing):

- **Resend** permite trimitere cu domeniul lor implicit: **`onboarding@resend.dev`**.
- **Poți sări peste Pas 2** (verificare domeniu). Folosești peste tot ca expeditor: **`onboarding@resend.dev`** (sau `Geroxym Travel <onboarding@resend.dev>`).
- Limitare: în mod normal poți trimite doar la adrese pe care le ai verificate în Resend (sau la orice email, conform politicii Resend pentru conturi noi – verifică în dashboard). Pentru confirmări rezervări în testing e suficient.
- Când ai domeniu, revii la Pas 2, verifici domeniul și schimbi expeditorul la `noreply@domeniul-tau.ro`.

---

## Pas 1: Cont Resend și API Key

1. Intră pe **[resend.com](https://resend.com)** și creează cont (sau loghează-te).
2. Mergi la **API Keys** → **Create API Key** → nume (ex. `Geroxym Travel`) → **Create**.
3. **Copiază cheia** (ex. `re_xxxx`) – o vei folosi atât pentru SMTP (parolă), cât și pentru app (`RESEND_API_KEY`). Nu o mai vezi după ce închizi fereastra.

---

## Pas 2: Domeniu în Resend (opțional la început)

*Poți sări acest pas dacă folosești `onboarding@resend.dev` pentru testing.*

1. În Resend: **Domains** → **Add Domain**.
2. Introdu domeniul (ex. `geroxymtravel.ro` sau subdomeniu `noreply.geroxymtravel.ro`).
3. Resend îți afișează **înregistrări DNS** (MX, TXT pentru verificare). Le adaugi la furnizorul de domeniu (unde ai cumpărat domeniul).
4. Aștepți până domeniul apare **Verified** în Resend.

**Sender email:** După verificare, expeditorul va fi ex. `noreply@geroxymtravel.ro` (pe domeniul verificat).

---

## Pas 3: SMTP în Supabase (emailuri Auth: confirmare signup, reset parolă)

1. **Supabase Dashboard** → **Project Settings** (roata din stânga jos) → **Authentication**.
2. Găsești secțiunea **SMTP** → activezi **Enable Custom SMTP**.
3. Completezi:

| Câmp | Valoare |
|------|--------|
| **Sender email** | `onboarding@resend.dev` (testing) sau `noreply@domeniul-tau.ro` (după verificare domeniu) |
| **Sender name** | ex. `Geroxym Travel` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | API key-ul tău Resend (ex. `re_xxxx`) |

4. **Save.** De acum, emailurile trimise de Supabase (confirmare email, reset parolă) pleacă prin Resend.

Sursa: [Resend – Send with Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp).

---

## Înregistrare (sign up) cu email și parolă – fluxul cu Resend

Aplicația are deja **pagina de sign up** (`/signup`) și formularul cu email + parolă. Ca **emailul de confirmare** să fie trimis prin Resend și ca utilizatorul să se poată înregistra corect:

1. **SMTP Resend**  
   Completezi **Pas 3** de mai sus (Custom SMTP în Supabase cu datele Resend). Fără asta, Supabase folosește serverul lor implicit pentru emailuri.

2. **Confirmare email în Supabase**  
   **Supabase Dashboard** → **Authentication** → **Providers** → **Email**:
   - Păstrezi **Email** activat.
   - Activezi **Confirm email** dacă vrei ca utilizatorul să confirme adresa (primește un link pe email; linkul vine prin Resend dacă SMTP e configurat la Pas 3).
   - Dacă lași **Confirm email** dezactivat, utilizatorul e considerat confirmat imediat (fără email).

3. **Redirect URLs** (după click pe linkul din email)  
   **Supabase** → **Authentication** → **URL Configuration** → **Redirect URLs**:
   - Adaugi URL-urile unde vrei să ajungă utilizatorul după ce dă click pe linkul de confirmare, ex.:
     - `https://geroxym-travel.vercel.app/**` (producție)
     - `http://localhost:3000/**` (dev)
   - În app, la sign up este setat deja redirect la `/[locale]/account?tab=bookings` după confirmare.

**Rezumat:** Utilizatorul se înregistrează pe `/signup` cu email + parolă → Supabase trimite emailul de confirmare prin **Resend** (dacă SMTP e la Pas 3) → utilizatorul dă click pe link → este redirecționat în cont. Reset parolă folosește același SMTP Resend.

---

## „Error sending confirmation email” (inclusiv 500 Internal Server Error)

Când Supabase afișează **Error sending confirmation email** (sau răspuns **500** la `POST .../auth/v1/signup`), trimiterea prin SMTP către Resend eșuează. Verifică în ordine:

**Dacă primești 500:** În Supabase, la SMTP, schimbă **Port** de la `465` la **`587`** și dă Save. Multe erori 500 vin din handshake-ul TLS pe portul 465; pe 587 (STARTTLS) Supabase se conectează corect la Resend. Apoi încearcă din nou sign up-ul.

1. **Sender email în Supabase**  
   Trebuie să fie exact **`onboarding@resend.dev`** (fără spații, fără alt domeniu). Câmpul „Sender name” poate fi ex. `Geroxym Travel`. Dacă ai introdus altceva (ex. `noreply@...` fără domeniu verificat), Resend respinge.

2. **API key ca parolă SMTP**  
   În Supabase, la **Password** (SMTP) lipești **doar** API key-ul Resend (ex. `re_xxxx`), fără spații la început/sfârșit. Copiază din nou din Resend → API Keys dacă e nevoie. Creează un key nou dacă nu e sigur că cel vechi are permisiuni de trimitere.

3. **Host, port, username**  
   - **Host:** `smtp.resend.com` (fără `https://`)  
   - **Port:** `465` sau **`587`** – dacă primești 500, folosește **587** (STARTTLS).  
   - **Username:** `resend` (literal, mic)  
   Resend acceptă ambele porturi; Supabase uneori se înțelege mai bine cu 587.

4. **Limită Resend fără domeniu**  
   Cu **`onboarding@resend.dev`**, Resend poate restricționa destinatarii (ex. doar adresa cu care te-ai înregistrat la Resend). Pentru test: înregistrează-te în app cu **același email** ca al contului Resend; dacă primești emailul, limitarea e aceasta. Pentru a trimite la orice adresă, verifică un domeniu în Resend (Pas 2) și folosește expeditor pe acel domeniu.

5. **Logs în Resend**  
   În **Resend Dashboard** → **Emails**: vezi dacă mesajul apare ca trimis sau ca eșuat și ce eroare dă (ex. „domain not verified”, „invalid from”).

6. **Supabase – autorizare email**  
   Dacă **nu** ai Custom SMTP activat sau configurat greșit, Supabase folosește serverul lor și trimite doar la adrese din echipa proiectului. Activează Custom SMTP (Pas 3) și salvează din nou setările.

După orice modificare la SMTP în Supabase, dă **Save** și încearcă din nou sign up-ul.

---

## Pas 4: Variabile de mediu pentru app (emailuri din cod)

În **Vercel** (Environment Variables) sau în **.env.local**:

| Variabilă | Valoare |
|-----------|--------|
| `RESEND_API_KEY` | API key-ul Resend (același ca la SMTP) |
| `EMAIL_FROM` | Opțional. La testing poți să nu o pui – app folosește implicit `onboarding@resend.dev`. Cu domeniu: `noreply@domeniul-tau.ro` |

Aplicația folosește **Resend API** (nu SMTP) pentru trimiterea din cod (confirmare rezervare, factură etc.). SMTP-ul din Pas 3 e doar pentru Supabase Auth.

---

## Pas 5: Trimitere din app (cod)

- Pachetul **resend** e instalat; clientul e în `src/lib/email/client.ts`.
- Pentru a trimite un email din cod: apelezi `sendEmail({ to, subject, html })` sau funcții dedicate (ex. `sendBookingConfirmation(orderId)` când le implementezi).

---

## Rezumat

| Unde | Ce folosești | Valori |
|------|--------------|--------|
| **Supabase Auth (SMTP)** | Custom SMTP | Host: `smtp.resend.com`, Port: `465`, User: `resend`, Password: API key, Sender: `noreply@...` |
| **App (API)** | Resend API | `RESEND_API_KEY` + `EMAIL_FROM` în env, `resend.emails.send()` în cod |

Un singur cont Resend și un API key. Fără domeniu: folosești `onboarding@resend.dev` (testing). Cu domeniu verificat: expeditor pe domeniul tău – SMTP pentru auth, API pentru app.
