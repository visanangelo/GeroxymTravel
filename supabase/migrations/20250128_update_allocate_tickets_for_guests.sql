-- Update allocate_tickets function to work with guest orders (customer_id)
-- This allows both authenticated users and guests to finalize orders

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
  current_user_id uuid;
BEGIN
  -- Get current user (if authenticated)
  current_user_id := auth.uid();

  -- Get order details
  SELECT o.id, o.route_id, o.quantity, o.status, o.user_id, o.customer_id
  INTO order_record
  FROM public.orders o
  WHERE o.id = order_id_param;

  -- Check if order exists
  IF order_record IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Check if order status is 'created'
  IF order_record.status != 'created' THEN
    RAISE EXCEPTION 'Order status must be created. Current status: %', order_record.status;
  END IF;

  -- For authenticated orders, verify ownership
  -- For guest orders (user_id is NULL), allow if customer_id exists
  IF order_record.user_id IS NOT NULL THEN
    IF order_record.user_id IS DISTINCT FROM current_user_id THEN
      RAISE EXCEPTION 'Order does not belong to current user';
    END IF;
  ELSE
    -- Guest order: verify customer_id exists
    IF order_record.customer_id IS NULL THEN
      RAISE EXCEPTION 'Order must have either user_id or customer_id';
    END IF;
  END IF;

  -- Get route details
  SELECT r.id, r.capacity_online, r.capacity_total
  INTO route_record
  FROM public.routes r
  WHERE r.id = order_record.route_id;

  IF route_record IS NULL THEN
    RAISE EXCEPTION 'Route not found';
  END IF;

  quantity_needed := order_record.quantity;

  -- Get available online seats (seat_no from 1 to capacity_online)
  -- Exclude seats that already have tickets with status 'paid'
  -- Order by random() for random allocation
  -- Use FOR UPDATE SKIP LOCKED to prevent concurrent allocations
  WITH available_seats AS (
    SELECT rs.seat_no
    FROM public.route_seats rs
    WHERE rs.route_id = order_record.route_id
      AND rs.pool = 'online'
      AND rs.seat_no <= route_record.capacity_online
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

  -- Check if we have enough seats
  IF allocated_seats IS NULL OR array_length(allocated_seats, 1) < quantity_needed THEN
    RAISE EXCEPTION 'Not enough seats available. Requested: %, Available: %',
      quantity_needed,
      COALESCE(array_length(allocated_seats, 1), 0);
  END IF;

  -- Insert tickets
  INSERT INTO public.tickets (route_id, order_id, seat_no, status)
  SELECT
    order_record.route_id,
    order_id_param,
    s.seat_no,
    'paid'
  FROM unnest(allocated_seats) AS s(seat_no);

  -- Update order status to 'paid'
  UPDATE public.orders
  SET status = 'paid'
  WHERE id = order_id_param;

  -- Return allocated seat numbers (using subquery to avoid ambiguity)
  RETURN QUERY
  SELECT s.seat_no::integer
  FROM unnest(allocated_seats) AS s(seat_no)
  ORDER BY s.seat_no;
END;
$$;

-- Grant execute permission to authenticated users and anon (for guests)
GRANT EXECUTE ON FUNCTION public.allocate_tickets(uuid) TO authenticated, anon;

