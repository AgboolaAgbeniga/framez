-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own message files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in their buckets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Avatar uploads (path starts with user ID)
CREATE POLICY "Users can upload their own avatars" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Post uploads (path starts with user ID)
CREATE POLICY "Users can upload their own posts" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Message file uploads (path contains user ID)
CREATE POLICY "Users can upload their own message files" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'messages' 
  AND auth.role() = 'authenticated'
  AND SPLIT_PART(name, '_', 2) = auth.uid()::text
);

-- Allow viewing files (public read access for now)
CREATE POLICY "Users can view files in their buckets" ON storage.objects 
FOR SELECT USING (
  bucket_id IN ('avatars', 'posts', 'messages')
);

-- Allow deleting own files
CREATE POLICY "Users can delete their own files" ON storage.objects 
FOR DELETE USING (
  auth.role() = 'authenticated'
  AND (
    (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text) OR
    (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text) OR
    (bucket_id = 'messages' AND SPLIT_PART(name, '_', 2) = auth.uid()::text)
  )
);