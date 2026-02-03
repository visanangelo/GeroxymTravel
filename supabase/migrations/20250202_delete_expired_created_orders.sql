-- Șterge comenzile 'created' (online) mai vechi de 24h. Nu au bilete alocate, deci DELETE e sigur.
-- Rulezi manual: SELECT delete_expired_created_orders(24);
-- Sau cu pg_cron (Supabase): SELECT cron.schedule('delete-expired-orders', '0 * * * *', $$SELECT delete_expired_created_orders(24)$$);

CREATE OR REPLACE FUNCTION public.delete_expired_created_orders(hours_old integer DEFAULT 24)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.orders
    WHERE status = 'created'
      AND source = 'online'
      AND created_at < (now() - (hours_old || ' hours')::interval)
    RETURNING id
  )
  SELECT count(*)::integer INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.delete_expired_created_orders(integer) IS
  'Deletes online orders with status created older than hours_old. Run periodically (e.g. hourly). No tickets exist for these orders.';
