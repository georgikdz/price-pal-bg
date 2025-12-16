-- Create table for storing brochure uploads
CREATE TABLE public.brochure_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store TEXT NOT NULL CHECK (store IN ('billa', 'kaufland', 'lidl')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  products_found INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for extracted products from brochures
CREATE TABLE public.extracted_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brochure_id UUID NOT NULL REFERENCES public.brochure_uploads(id) ON DELETE CASCADE,
  raw_name TEXT NOT NULL,
  raw_price DECIMAL(10,2),
  raw_unit TEXT,
  promo_price DECIMAL(10,2),
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  mapped_product_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brochure_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_products ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (admin functionality - will add auth later)
CREATE POLICY "Allow public read on brochure_uploads" ON public.brochure_uploads FOR SELECT USING (true);
CREATE POLICY "Allow public insert on brochure_uploads" ON public.brochure_uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on brochure_uploads" ON public.brochure_uploads FOR UPDATE USING (true);

CREATE POLICY "Allow public read on extracted_products" ON public.extracted_products FOR SELECT USING (true);
CREATE POLICY "Allow public insert on extracted_products" ON public.extracted_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on extracted_products" ON public.extracted_products FOR UPDATE USING (true);

-- Create storage bucket for brochure PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('brochures', 'brochures', true);

-- Storage policies
CREATE POLICY "Allow public upload to brochures" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brochures');
CREATE POLICY "Allow public read from brochures" ON storage.objects FOR SELECT USING (bucket_id = 'brochures');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brochure_uploads_updated_at
BEFORE UPDATE ON public.brochure_uploads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();