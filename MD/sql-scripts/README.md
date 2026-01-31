# SQL scripts (one-off / inspection)

Scripturi SQL pentru inspecție RLS și fix-uri one-off. **Nu** sunt migrații – migrațiile versionate sunt în `supabase/migrations/`.

- `check_tickets_rls.sql` – verificare politici RLS pe tabela `tickets`
- `inspect_rls_status.sql` – status RLS pe tabele
- `FIX_DEPART_ERROR.sql` – fix one-off (depart)
- `FIX_TICKETS_RLS_FINAL.sql` – fix one-off RLS tickets

Rulează manual în Supabase SQL Editor când e nevoie.
