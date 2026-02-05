# Email și SMTP – ce trebuie să faci

Există două surse de email în proiect. Fiecare are pașii ei.

---

## 1. Emailuri din aplicație (confirmare rezervare, factură etc.) – Resend

**Nu folosești SMTP** pentru acestea. Folosești **Resend** prin **API** (un API key).

### Pași

1. **Cont Resend**  
   - Intră pe [resend.com](https://resend.com) și creează cont.
   - **API Keys** → **Create API Key** → copiezi cheia (ex. `re_xxxx`).

2. **Domeniu în Resend**  
   - **Domains** → **Add Domain** → pui domeniul (ex. `geroxymtravel.ro` sau subdomeniu `noreply.geroxymtravel.ro`).
   - Resend îți dă niște **înregistrări DNS** (MX, TXT etc.). Le adaugi la domeniul tău (la furnizorul de domeniu / hosting) până când domeniul apare „Verified”.
   - Fără domeniu verificat, în producție poți trimite doar pe adrese verificate (limitat); pentru producție serioasă verifici domeniul.

3. **Variabile de mediu în proiect (Vercel / .env.local)**  
   - `RESEND_API_KEY` = cheia de la Resend (ex. `re_xxxx`).
   - `EMAIL_FROM` = adresa expeditor (ex. `noreply@geroxymtravel.ro` sau `booking@geroxymtravel.ro`). Trebuie să fie pe domeniul verificat în Resend.

4. **În cod**  
   - Trimiterea se face prin Resend API (vezi planul din `EMAIL_AND_SMARTBILL_PLAN.md`), nu prin SMTP. Nu ai nevoie de server SMTP pentru Resend.

**Rezumat:** Pentru emailurile din app (confirmare, factură) folosești Resend (API key + domeniu). Poți folosi și Resend prin SMTP dacă vrei (vezi mai jos), dar API e mai simplu în cod.

---

## 2. Emailuri Supabase Auth (confirmare email la signup, reset parolă) – SMTP opțional

Acestea le trimite **Supabase**, nu aplicația ta. Implicit Supabase folosește expeditorul lor. Dacă vrei să parvină de la **domeniul tău** (ex. `noreply@geroxymtravel.ro`) ca să arate mai bine și să ajungă mai bine în inbox, configurezi **SMTP custom** în Supabase.

### Pași (opțional)

1. **Supabase Dashboard** → **Authentication** → **Notifications** (sau **Email**) → secțiunea **SMTP** / **Custom SMTP**.

2. **Activezi „Custom SMTP”** și completezi:
   - **Sender email:** ex. `noreply@geroxymtravel.ro` (trebuie să fie o adresă reală pe domeniul tău).
   - **Sender name:** ex. `Geroxym Travel`.
   - **Host:** serverul SMTP al furnizorului (ex. pentru Gmail: `smtp.gmail.com`, pentru un hostinger/one.com: adresa SMTP din panoul lor).
   - **Port:** de obicei `587` (TLS) sau `465` (SSL).
   - **Username / Password:** user și parolă pentru SMTP (uneori parolă de aplicație, nu parola de email).

3. **Unde iei datele SMTP**  
   - De la furnizorul de email/hosting (ex. **Hostinger**, **One.com**, **Google Workspace**, **Microsoft 365**). În panoul de control la domeniu există secțiune „Email” sau „SMTP” cu Host, Port, User, Password.
   - Dacă folosești doar Resend pentru app și nu ai încă email pe domeniu, poți lăsa Supabase pe setările implicite până adaugi SMTP.

4. **Salvezi** setările. De acum, emailurile de confirmare și reset parolă trimise de Supabase vor pleca prin SMTP-ul tău, de la adresa ta.

**Rezumat:** SMTP în Supabase = doar pentru emailurile trimise de Supabase (auth). Nu se amestecă cu trimiterea din aplicație.

---

## E ok să ai SMTP în Resend ȘI în Notificări?

**Da.** Nu e nicio problemă să ai ambele:

| Unde | La ce folosești | Exemplu |
|------|------------------|----------|
| **Resend** (API sau SMTP) | Emailuri trimise din **codul tău** (confirmare rezervare, factură, reminder) | `sendBookingConfirmation()`, etc. |
| **Supabase → Notifications → Custom SMTP** | Emailuri trimise **de Supabase** (confirmare signup, reset parolă) | Nu le controlezi din app; le trimite Auth. |

Sunt **două canale separate**: unul pentru app, unul pentru auth. Poți folosi:
- **Resend API** în app (fără SMTP în app) + **Custom SMTP** în Supabase pentru auth → două surse, fiecare cu rolul ei.
- Sau **Resend SMTP** în app (dacă Resend îți dă host/parolă SMTP și vrei să trimiți prin SMTP din cod) + **același SMTP** sau alt SMTP în Supabase pentru auth.

Singura regulă: **Supabase SMTP** e doar pentru ce trimite Supabase (auth). Pentru ce trimite aplicația ta, folosești Resend (API sau SMTP). Nu e greșit să ai SMTP configurat în ambele locuri, atât timp cât știi că Supabase = auth, Resend = emailuri din app.

| Ce vrei | Unde | Ce faci |
|--------|------|--------|
| Emailuri app (confirmare rezervare, factură) | Resend | Cont Resend, domeniu, API key (sau SMTP Resend). `RESEND_API_KEY` + `EMAIL_FROM` în env. |
| Emailuri auth (confirmare signup, reset parolă) de la domeniul tău | Supabase | Auth → Notifications → Custom SMTP: host, port, user, parolă, sender email. |

**Concluzie:** E în regulă să ai și Resend (pentru app) și SMTP în Notificări (pentru auth). Nu se exclud; fiecare își are rolul.
