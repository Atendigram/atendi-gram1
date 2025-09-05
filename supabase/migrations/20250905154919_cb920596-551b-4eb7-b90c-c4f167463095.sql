-- Enable RLS on welcome flow tables
ALTER TABLE welcome_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE welcome_flow_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for welcome_flows table
CREATE POLICY "Allow all operations on welcome_flows"
ON welcome_flows
FOR ALL
USING (true)
WITH CHECK (true);

-- Create policies for welcome_flow_steps table  
CREATE POLICY "Allow all operations on welcome_flow_steps"
ON welcome_flow_steps
FOR ALL
USING (true)
WITH CHECK (true);

-- Ensure welcome-media storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('welcome-media', 'welcome-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for welcome-media bucket
CREATE POLICY "Allow public read access to welcome-media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'welcome-media');

CREATE POLICY "Allow public insert to welcome-media" 
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'welcome-media');

CREATE POLICY "Allow public update to welcome-media"
ON storage.objects  
FOR UPDATE
USING (bucket_id = 'welcome-media')
WITH CHECK (bucket_id = 'welcome-media');

CREATE POLICY "Allow public delete from welcome-media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'welcome-media');