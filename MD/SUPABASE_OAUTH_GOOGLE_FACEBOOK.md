# Supabase: Enable și înregistrare prin Google și Facebook

## 1. În Supabase Dashboard

1. Deschide **Supabase Dashboard** → proiectul tău.
2. Meniu stânga: **Authentication** → **Providers**.
3. Găsești **Google** și **Facebook**; pentru fiecare:
   - **Enable** (pornit).
   - Completezi **Client ID** și **Client Secret** (le obții din Google Cloud / Facebook Developers, vezi mai jos).
4. **Redirect URLs:** Mergi la **Authentication** → **URL Configuration**.
   - În **Redirect URLs** adaugi exact URL-ul unde aplicația ta primește callback-ul după OAuth:
     - Producție: `https://domeniul-tau.com/auth/callback`
     - Local: `http://localhost:3000/auth/callback` (sau `http://127.0.0.1:3000/auth/callback`).
   - **Site URL:** pune URL-ul principal (ex. `https://domeniul-tau.com` sau `http://localhost:3000`).
   - Fără aceste URL-uri, Google/Facebook vor refuza redirect-ul după login.

---

## 2. Google OAuth (Google Cloud)

1. Intră pe [Google Cloud Console](https://console.cloud.google.com/).
2. Creează un proiect (sau alege unul existent).
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
4. Dacă îți cere **Configure consent screen**:
   - Tip: **External** (sau Internal dacă e doar pentru organizație).
   - Completezi App name, User support email, Developer contact.
   - **Scopes:** adaugi `openid`, `email`, `profile` (sau folosești ecranul de consent și adaugi scope-urile pentru email/profile).
5. La **Create OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins:**
     - `https://domeniul-tau.com`
     - `http://localhost:3000` (pentru dev).
   - **Authorized redirect URIs:**
     - **Callback-ul Supabase:** `https://<PROJECT_REF>.supabase.co/auth/v1/callback`.
     - PROJECT_REF îl găsești în Supabase Dashboard → Settings → General → Reference ID.
6. După creare, copiezi **Client ID** și **Client Secret** și le pui în Supabase → Authentication → Providers → **Google** (Enable, Client ID, Client Secret).

---

## 3. Facebook OAuth (Meta for Developers)

1. Intră pe [developers.facebook.com](https://developers.facebook.com/) → **My Apps** → **Create App** (sau alege una existentă).
2. Tip app: **Consumer** (sau Business dacă e cazul).
3. În app: **Facebook Login** → **Settings** (sau **Use cases** → Authentication).
4. **Valid OAuth Redirect URIs:** adaugi exact:
   - `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
   - (același PROJECT_REF din Supabase).
5. **Client OAuth Login:** On. **Web OAuth Login:** On.
6. La **Use cases** → **Authentication and account creation** activezi **Email** și **public_profile** (să fie „Ready for production” sau cel puțin pentru test).
7. **Settings** → **Basic:** copiezi **App ID** și **App Secret**.
8. În Supabase → Authentication → Providers → **Facebook**:
   - Enable.
   - **Client ID (App ID):** App ID de la Facebook.
   - **Client Secret:** App Secret de la Facebook.

---

## 4. În aplicație (Next.js)

- **Callback route:** `app/auth/callback/route.ts` – schimbă codul din URL cu sesiune (vezi fișierul din proiect).
- **Login:** butoane „Continue with Google” și „Continue with Facebook” care apelează `supabase.auth.signInWithOAuth({ provider: 'google' | 'facebook', options: { redirectTo: `${origin}/auth/callback?next=...` } })`.
- **Redirect URLs** din Supabase trebuie să conțină `https://domeniul-tau.com/auth/callback` (și localhost pentru dev).

După ce utilizatorul se loghează cu Google/Facebook, Supabase îl redirecționează la `/auth/callback?code=...`; ruta face `exchangeCodeForSession(code)` și apoi redirect la `next` (ex. `/ro/account`).

---

## 5. Rezumat

| Pas | Unde | Ce faci |
|-----|------|--------|
| 1 | Supabase → Auth → Providers | Pornești Google și Facebook, pui Client ID + Secret |
| 2 | Supabase → Auth → URL Configuration | Redirect URLs: `.../auth/callback`, Site URL |
| 3 | Google Cloud Console | OAuth client (Web), redirect URI = `...supabase.co/auth/v1/callback` |
| 4 | Facebook Developers | Facebook Login, redirect URI = `...supabase.co/auth/v1/callback`, App ID + Secret |
| 5 | App | Ruta `/auth/callback` + butoane OAuth pe login |
