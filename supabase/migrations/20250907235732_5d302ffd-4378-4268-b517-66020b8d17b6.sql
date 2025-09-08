-- Check existing disparo_items structure and add required columns if missing
DO $$
BEGIN
  -- Add type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'disparo_items' 
                 AND column_name = 'type') THEN
    ALTER TABLE public.disparo_items ADD COLUMN type text DEFAULT 'text';
  END IF;

  -- Add message column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'disparo_items' 
                 AND column_name = 'message') THEN
    ALTER TABLE public.disparo_items ADD COLUMN message text;
  END IF;

  -- Add media_url column if it doesn't exist (it seems to already exist from the schema)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'disparo_items' 
                 AND column_name = 'media_url') THEN
    ALTER TABLE public.disparo_items ADD COLUMN media_url text;
  END IF;
END $$;

-- Create storage bucket for photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for photos bucket
DO $$
BEGIN
  -- Delete existing policies if they exist to avoid conflicts
  DROP POLICY IF EXISTS "Users can view photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete photos" ON storage.objects;
  
  -- Create new policies for photos bucket
  CREATE POLICY "Users can view photos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'photos');

  CREATE POLICY "Users can upload photos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

  CREATE POLICY "Users can update photos" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

  CREATE POLICY "Users can delete photos" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);
END $$;