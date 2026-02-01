-- Add category and subcategory to routes for Circuite (Interne, Externe, Pelerinaje, Sejur la mare)
-- Efficient: indexed for fast filtering; nullable so existing routes stay visible in "all"

ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS route_category text,
  ADD COLUMN IF NOT EXISTS route_subcategory text;

COMMENT ON COLUMN public.routes.route_category IS 'intern | extern | pelerinaj | sejur_mare';
COMMENT ON COLUMN public.routes.route_subcategory IS 'For sejur_mare: grecia | turcia | albania | bulgaria';

CREATE INDEX IF NOT EXISTS idx_routes_category_subcategory
  ON public.routes (route_category, route_subcategory)
  WHERE status = 'active';
