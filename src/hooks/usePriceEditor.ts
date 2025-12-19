import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UpdatePriceParams {
  id: string;
  price: number;
  promo_price: number | null;
  unit: string | null;
}

export function useUpdatePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, price, promo_price, unit }: UpdatePriceParams) => {
      const { data, error } = await supabase
        .from('prices')
        .update({ 
          price, 
          promo_price,
          unit,
          is_promo: promo_price !== null && promo_price < price
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prices'] });
      queryClient.invalidateQueries({ queryKey: ['latest-prices'] });
      queryClient.invalidateQueries({ queryKey: ['promo-prices'] });
    },
  });
}

export function useDeletePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prices'] });
      queryClient.invalidateQueries({ queryKey: ['latest-prices'] });
      queryClient.invalidateQueries({ queryKey: ['promo-prices'] });
    },
  });
}
