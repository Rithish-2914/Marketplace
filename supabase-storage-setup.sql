-- SwapHands Supabase Storage Setup
-- Run this in your Supabase SQL Editor to set up storage buckets and policies

-- First, create the storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('items', 'items', true),
  ('claims', 'claims', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for 'items' bucket (profile pictures and item listings)
-- Allow anyone to read from the items bucket
CREATE POLICY "Public Access for items bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'items');

-- Allow authenticated users to upload to items bucket
CREATE POLICY "Authenticated users can upload items"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'items' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update their own items"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'items' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own items"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'items' 
  AND auth.role() = 'authenticated'
);

-- Storage policies for 'claims' bucket (claim proof images)
-- Allow anyone to read from the claims bucket
CREATE POLICY "Public Access for claims bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'claims');

-- Allow authenticated users to upload to claims bucket
CREATE POLICY "Authenticated users can upload claims"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'claims' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update their own claims"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'claims' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own claims"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'claims' 
  AND auth.role() = 'authenticated'
);
