-- Fix: allow buying all remaining online seats (e.g. last 6).
-- Previously allocate_tickets used seat_no <= capacity_online (47), but route_seats
-- has pool='online' for seat_no 5..51. So seats 48,49,50,51 were never allocated.
-- Now we only filter by pool = 'online'; the number of online seats matches capacity_online.

CREATE OR REPLACE FUNCTION public.allocate_tickets(order_id_param uuid)
RETURNS TABLE(seat_no integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_record RECORD;
  route_record RECORD;
  quantity_needed integer;
  allocated_seats integer[];
BEGIN
  SELECT o.id, o.route_id, o.quantity, o.status, o.user_id, o.customer_id
  INTO order_record
  FROM public.orders o
  WHERE o.id = order_id_param;

  IF order_record IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF order_record.status != 'created' THEN
    RAISE EXCEPTION 'Order status must be created. Current status: %', order_record.status;
  END IF;

  IF order_record.user_id IS NULL AND order_record.customer_id IS NULL THEN
    RAISE EXCEPTION 'Order must have either user_id or customer_id';
  END IF;

  SELECT r.id, r.capacity_online, r.capacity_total
  INTO route_record
  FROM public.routes r
  WHERE r.id = order_record.route_id;

  IF route_record IS NULL THEN
    RAISE EXCEPTION 'Route not found';
  END IF;

  quantity_needed := order_record.quantity;

  -- Available online seats: all route_seats with pool = 'online' not yet paid.
  -- (create_route_seats uses seat_no 5..51 for online = 47 seats = capacity_online)
  WITH available_seats AS (
    SELECT rs.seat_no
    FROM public.route_seats rs
    WHERE rs.route_id = order_record.route_id
      AND rs.pool = 'online'
      AND NOT EXISTS (
        SELECT 1
        FROM public.tickets t
        WHERE t.route_id = rs.route_id
          AND t.seat_no = rs.seat_no
          AND t.status = 'paid'
      )
    ORDER BY random()
    LIMIT quantity_needed
    FOR UPDATE SKIP LOCKED
  )
  SELECT array_agg(available_seats.seat_no ORDER BY available_seats.seat_no)
  INTO allocated_seats
  FROM available_seats;

  IF allocated_seats IS NULL OR array_length(allocated_seats, 1) < quantity_needed THEN
    RAISE EXCEPTION 'Not enough seats available. Requested: %, Available: %',
      quantity_needed,
      COALESCE(array_length(allocated_seats, 1), 0);
  END IF;

  INSERT INTO public.tickets (route_id, order_id, seat_no, status)
  SELECT
    order_record.route_id,
    order_id_param,
    s.seat_no,
    'paid'
  FROM unnest(allocated_seats) AS s(seat_no);

  UPDATE public.orders
  SET status = 'paid'
  WHERE id = order_id_param;

  RETURN QUERY
  SELECT s.seat_no::integer
  FROM unnest(allocated_seats) AS s(seat_no)
  ORDER BY s.seat_no;
END;
$$;

GRANT EXECUTE ON FUNCTION public.allocate_tickets(uuid) TO authenticated, anon;
