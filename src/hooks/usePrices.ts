import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Store } from '@/types';

export interface Price {
  id: string;
  product_id: string;
  store: string;
  brand: string | null;
  price: number;
  promo_price: number | null;
  is_promo: boolean;
  unit: string | null;
  extracted_at: string;
}

export function usePrices() {
  return useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .order('extracted_at', { ascending: false });
      
      if (error) throw error;
      return data as Price[];
    },
  });
}

export function useLatestPrices() {
  return useQuery({
    queryKey: ['latest-prices'],
    queryFn: async () => {
      // Get the most recent price for each product/store combination
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .order('extracted_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by product_id + store and take the latest
      const latestMap = new Map<string, Price>();
      for (const price of (data as Price[])) {
        const key = `${price.product_id}-${price.store}`;
        if (!latestMap.has(key)) {
          latestMap.set(key, price);
        }
      }
      
      return Array.from(latestMap.values());
    },
  });
}

export function usePricesByProduct(productId: string) {
  const { data: allPrices, ...rest } = useLatestPrices();
  
  const prices = allPrices?.filter(p => p.product_id === productId) || [];
  
  return { data: prices, ...rest };
}

export function usePromoPrices() {
  return useQuery({
    queryKey: ['promo-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .eq('is_promo', true)
        .order('extracted_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Price[];
    },
  });
}

export function usePriceStats() {
  const { data: prices } = useLatestPrices();
  
  if (!prices || prices.length === 0) {
    return {
      totalProducts: 0,
      totalStores: 0,
      promoCount: 0,
      avgSavings: 0,
    };
  }
  
  const uniqueProducts = new Set(prices.map(p => p.product_id)).size;
  const uniqueStores = new Set(prices.map(p => p.store)).size;
  const promoCount = prices.filter(p => p.is_promo).length;
  
  // Calculate average savings from promos
  const promoPrices = prices.filter(p => p.is_promo && p.promo_price);
  let avgSavings = 0;
  if (promoPrices.length > 0) {
    const savings = promoPrices.map(p => {
      const original = p.price;
      const promo = p.promo_price!;
      return ((original - promo) / original) * 100;
    });
    avgSavings = savings.reduce((a, b) => a + b, 0) / savings.length;
  }
  
  return {
    totalProducts: uniqueProducts,
    totalStores: uniqueStores,
    promoCount,
    avgSavings: Math.round(avgSavings),
  };
}

export function usePriceHistory(productId: string) {
  return useQuery({
    queryKey: ['price-history', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .eq('product_id', productId)
        .order('extracted_at', { ascending: true });
      
      if (error) throw error;
      return data as Price[];
    },
    enabled: !!productId,
  });
}
