-- Expiră comenzile 'created' care nu au fost plătite (utilizatorul a plecat fără să plătească).
-- Nu blochează locuri (biletele se alocă doar la status 'paid'), dar curăță DB-ul.
-- Poți rula manual: SELECT expire_abandoned_orders(24);
-- Sau programează cu pg_cron (Supabase): SELECT cron.schedule('expire-orders', '0 * * * *', $$SELECT expire_abandoned_orders(24)$$);

CREATE OR REPLACE FUNCTION public.expire_abandoned_orders(hours_old integer DEFAULT 24)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  WITH expired AS (
    UPDATE public.orders
    SET status = 'cancelled', updated_at = now()
    WHERE status = 'created'
      AND source = 'online'
      AND created_at < (now() - (hours_old || ' hours')::interval)
    RETURNING id
  )
  SELECT count(*)::integer INTO updated_count FROM expired;

  RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION public.expire_abandoned_orders(integer) IS
  'Sets status to cancelled for online orders with status created older than hours_old. Run periodically (e.g. daily) to clean abandoned carts.';
