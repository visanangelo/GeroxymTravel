-- Add cover image and rich text description to routes (product-like)
-- Run this migration first. Then create Storage bucket "route-images" in Supabase Dashboard:
-- Storage > New bucket > Name: route-images, Public: ON, File size limit: 5MB, Allowed MIME: image/jpeg, image/png, image/webp

ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS description text;

COMMENT ON COLUMN public.routes.image_url IS 'Public URL of route cover image (Supabase Storage)';
COMMENT ON COLUMN public.routes.description IS 'Rich text description (HTML from editor)';
