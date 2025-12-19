import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ParsedPriceRow } from '@/lib/csvUtils';

interface ImportResult {
  successCount: number;
  failedCount: number;
  errors: string[];
}

export function useCsvImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: ParsedPriceRow[]): Promise<ImportResult> => {
      const validRows = rows.filter(r => r.errors.length === 0);
      
      if (validRows.length === 0) {
        return { successCount: 0, failedCount: 0, errors: ['No valid rows to import'] };
      }

      const pricesToInsert = validRows.map(row => ({
        product_id: row.product_id,
        store: row.store,
        price: row.price,
        promo_price: row.promo_price,
        unit: row.unit,
        brand: row.brand,
        is_promo: row.is_promo,
        extracted_at: new Date().toISOString(),
      }));

      // Insert in batches of 50 to avoid potential issues
      const batchSize = 50;
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < pricesToInsert.length; i += batchSize) {
        const batch = pricesToInsert.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('prices')
          .insert(batch);

        if (error) {
          failedCount += batch.length;
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          successCount += batch.length;
        }
      }

      return { successCount, failedCount, errors };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prices'] });
      queryClient.invalidateQueries({ queryKey: ['latest-prices'] });
      queryClient.invalidateQueries({ queryKey: ['promo-prices'] });
    },
  });
}
