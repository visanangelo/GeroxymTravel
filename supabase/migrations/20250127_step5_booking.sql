-- Step 5: Booking Flow - SQL Function for Safe Ticket Allocation
-- This function safely allocates seats for an order, preventing double booking

-- Create function to allocate tickets for an order
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
  seat_record RECORD;
BEGIN
  -- Get order details and verify ownership
  SELECT o.id, o.route_id, o.quantity, o.status, o.user_id
  INTO order_record
  FROM public.orders o
  WHERE o.id = order_id_param;

  -- Check if order exists
  IF order_record IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Check if order belongs to current user (enforced by RLS or explicit check)
  -- Note: SECURITY DEFINER runs with function creator's privileges, but we check user_id
  IF order_record.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Order does not belong to current user';
  END IF;

  -- Check if order status is 'created'
  IF order_record.status != 'created' THEN
    RAISE EXCEPTION 'Order status must be created. Current status: %', order_record.status;
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.allocate_tickets(uuid) TO authenticated;

-- Update RLS policies to allow users to create orders for themselves
-- (These might already exist, but let's ensure they're correct)

-- Allow authenticated users to insert their own orders
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own orders (should already exist, but ensure it does)
-- This is handled by the existing policy "Users can view their own orders"

-- Allow users to update their own orders (only status changes)
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to view tickets for their own orders
-- (This should already exist from previous migrations)

-- Note: Tickets are inserted by the allocate_tickets function (SECURITY DEFINER)
-- which runs with elevated privileges, so it can bypass RLS for inserts

