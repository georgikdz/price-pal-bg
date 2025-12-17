-- Create prices table to store extracted product prices
CREATE TABLE public.prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  store TEXT NOT NULL,
  brand TEXT,
  price NUMERIC NOT NULL,
  promo_price NUMERIC,
  is_promo BOOLEAN DEFAULT false,
  unit TEXT,
  brochure_id UUID REFERENCES public.brochure_uploads(id),
  extracted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read on prices"
ON public.prices
FOR SELECT
USING (true);

-- Allow public insert (from edge function)
CREATE POLICY "Allow public insert on prices"
ON public.prices
FOR INSERT
WITH CHECK (true);

-- Create index for efficient queries
CREATE INDEX idx_prices_product_store ON public.prices(product_id, store);
CREATE INDEX idx_prices_extracted_at ON public.prices(extracted_at DESC);