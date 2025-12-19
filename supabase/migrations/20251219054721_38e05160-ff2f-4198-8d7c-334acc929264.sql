-- Fix STORAGE_EXPOSURE: Make brochures bucket private and restrict access to admins
UPDATE storage.buckets SET public = false WHERE id = 'brochures';

-- Drop existing overly permissive storage policies
DROP POLICY IF EXISTS "Allow public upload to brochures" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from brochures" ON storage.objects;

-- Create restricted storage policies - only admins can upload
CREATE POLICY "Admins can upload to brochures" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'brochures' AND 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Authenticated users can read brochures (needed for edge function with service role)
CREATE POLICY "Authenticated users can read brochures" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'brochures' AND auth.role() = 'authenticated');

-- Fix CLIENT_SIDE_AUTH: Update RLS policies on brochure_uploads to require admin role

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public insert on brochure_uploads" ON brochure_uploads;
DROP POLICY IF EXISTS "Allow public update on brochure_uploads" ON brochure_uploads;

-- Create admin-only insert policy
CREATE POLICY "Admins can insert brochure_uploads"
  ON brochure_uploads FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only update policy  
CREATE POLICY "Admins can update brochure_uploads"
  ON brochure_uploads FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policies on extracted_products to require admin role for writes

DROP POLICY IF EXISTS "Allow public insert on extracted_products" ON extracted_products;
DROP POLICY IF EXISTS "Allow public update on extracted_products" ON extracted_products;

-- Service role (used by edge function) will bypass RLS, but direct client access needs admin check
CREATE POLICY "Admins can insert extracted_products"
  ON extracted_products FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update extracted_products"
  ON extracted_products FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policies on prices to require admin role for writes

DROP POLICY IF EXISTS "Allow public insert on prices" ON prices;

CREATE POLICY "Admins can insert prices"
  ON prices FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));