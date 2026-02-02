-- Create or replace function that creates route_seats when a route is inserted.
-- Layout autocar FIX: 51 locuri, primul rând (4 locuri) = offline, HARDCODAT.

CREATE OR REPLACE FUNCTION public.create_route_seats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i integer;
BEGIN
  -- Întotdeauna 51 locuri, primele 4 offline
  FOR i IN 1 .. 51 LOOP
    INSERT INTO public.route_seats (route_id, seat_no, pool)
    VALUES (
      NEW.id,
      i,
      CASE WHEN i <= 4 THEN 'offline'::text ELSE 'online'::text END
    );
  END LOOP;

  -- Aliniază ruta la 51 / 4 (capacity_online devine 47 prin coloana generată)
  UPDATE public.routes
  SET capacity_total = 51, reserve_offline = 4
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Trigger on routes: create seats after insert
DROP TRIGGER IF EXISTS trg_create_route_seats ON public.routes;
CREATE TRIGGER trg_create_route_seats
  AFTER INSERT ON public.routes
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_route_seats();
