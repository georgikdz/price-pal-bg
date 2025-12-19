-- Allow admins to update prices
CREATE POLICY "Admins can update prices"
ON public.prices
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete prices
CREATE POLICY "Admins can delete prices"
ON public.prices
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));