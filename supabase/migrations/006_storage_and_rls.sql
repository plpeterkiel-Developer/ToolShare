-- Storage bucket for tool images
-- Run this in Supabase Dashboard SQL editor OR via supabase CLI
-- The bucket must also be created in the Storage UI (or via API) with:
--   name: 'tool-images', public: true, file_size_limit: 5242880 (5MB)
--   allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']

-- Storage RLS policies
-- Images are stored at path: tool-images/{user_id}/{uuid}.{ext}
-- This allows the delete policy to verify ownership by checking the first path segment

create policy "tool_images_public_read"
  on storage.objects for select
  using (bucket_id = 'tool-images');

create policy "tool_images_authenticated_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'tool-images'
    and auth.role() = 'authenticated'
  );

create policy "tool_images_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'tool-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "tool_images_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'tool-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
