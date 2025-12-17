import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExtractedProduct {
  id: string;
  brochure_id: string;
  raw_name: string;
  raw_price: number | null;
  raw_unit: string | null;
  promo_price: number | null;
  mapped_product_id: string | null;
  confidence_score: number | null;
  created_at: string;
  store?: string;
}

export interface ExtractedProductWithStore extends ExtractedProduct {
  store: string;
}

export function useExtractedProducts(options?: { lowConfidenceOnly?: boolean }) {
  return useQuery({
    queryKey: ['extracted-products', options?.lowConfidenceOnly],
    queryFn: async () => {
      // First get extracted products with brochure info for store
      const { data: products, error: productsError } = await supabase
        .from('extracted_products')
        .select(`
          *,
          brochure_uploads!inner(store)
        `)
        .order('confidence_score', { ascending: true });
      
      if (productsError) throw productsError;
      
      // Transform to include store directly
      let result: ExtractedProductWithStore[] = products.map((p: any) => ({
        ...p,
        store: p.brochure_uploads?.store || 'unknown',
      }));
      
      // Filter by confidence if requested
      if (options?.lowConfidenceOnly) {
        result = result.filter(p => 
          p.confidence_score === null || 
          p.confidence_score < 0.8 ||
          !p.mapped_product_id
        );
      }
      
      return result;
    },
  });
}

export function useUpdateProductMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      extractedProductId, 
      mappedProductId,
      confidenceScore = 1.0 
    }: { 
      extractedProductId: string; 
      mappedProductId: string | null;
      confidenceScore?: number;
    }) => {
      const { error } = await supabase
        .from('extracted_products')
        .update({ 
          mapped_product_id: mappedProductId,
          confidence_score: confidenceScore
        })
        .eq('id', extractedProductId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extracted-products'] });
    },
  });
}

export function useUnmappedCount() {
  const { data: products } = useExtractedProducts({ lowConfidenceOnly: true });
  return products?.length || 0;
}
