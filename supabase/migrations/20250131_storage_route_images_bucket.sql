-- Create Storage bucket for route cover images (public read, authenticated upload)
-- If this fails (e.g. storage schema not in same DB), create the bucket manually in Supabase Dashboard:
-- Storage > New bucket > Name: route-images, Public: ON, File size limit: 5MB, Allowed MIME: image/jpeg, image/png, image/webp

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'route-images',
  'route-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: allow public read; upload/update/delete use service role in Server Action (bypasses RLS)
DROP POLICY IF EXISTS "Public read route images" ON storage.objects;
CREATE POLICY "Public read route images"
ON storage.objects FOR SELECT
USING (bucket_id = 'route-images');
