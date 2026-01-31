-- Replace featured (boolean) with homepage_position (1-6). If position is set, route appears on homepage at that slot.
-- One route per position; null = not on homepage.

-- Add new column
ALTER TABLE public.routes
ADD COLUMN IF NOT EXISTS homepage_position smallint NULL;

ALTER TABLE public.routes
ADD CONSTRAINT routes_homepage_position_range
CHECK (homepage_position IS NULL OR (homepage_position >= 1 AND homepage_position <= 6));

COMMENT ON COLUMN public.routes.homepage_position IS 'Position 1-6 on homepage "Rute Populare". Null = not shown. One route per position.';

-- Migrate existing featured=true to positions 1-6 (only if featured column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'routes' AND column_name = 'featured') THEN
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY depart_at ASC NULLS LAST) AS rn
      FROM public.routes
      WHERE featured = true
    )
    UPDATE public.routes r
    SET homepage_position = ranked.rn::smallint
    FROM ranked
    WHERE r.id = ranked.id AND ranked.rn <= 6;
    ALTER TABLE public.routes DROP COLUMN featured;
  END IF;
END $$;
