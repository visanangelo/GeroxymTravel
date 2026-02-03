-- Programează ștergerea automată a comenzilor 'created' expirate (la fiecare oră).
-- Rulează acest SQL DOAR DUPĂ ce ai activat pg_cron în Supabase (vezi pașii mai jos).
-- Cron: '0 * * * *' = la minutul 0 din fiecare oră (ex: 13:00, 14:00, 15:00).

SELECT cron.schedule(
  'delete-expired-created-orders',
  '0 * * * *',
  $$SELECT public.delete_expired_created_orders(24)$$
);
