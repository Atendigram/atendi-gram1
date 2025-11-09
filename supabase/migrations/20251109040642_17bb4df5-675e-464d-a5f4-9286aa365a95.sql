-- Create videos storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  209715200, -- 200MB in bytes
  ARRAY['video/mp4', 'video/quicktime', 'video/webm']
);

-- Create RLS policies for videos bucket
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Videos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');

CREATE POLICY "Users can update their own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'videos');

CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'videos');