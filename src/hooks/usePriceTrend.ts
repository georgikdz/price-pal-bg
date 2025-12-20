import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Price } from './usePrices';
import { differenceInDays } from 'date-fns';

export interface PriceTrend {
  productId: string;
  store: string;
  currentPrice: number;
  previousPrice: number | null;
  changePercent: number | null;
  direction: 'up' | 'down' | 'stable' | null;
}

export function usePriceTrends() {
  return useQuery({
    queryKey: ['price-trends'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .gte('extracted_at', sevenDaysAgo.toISOString())
        .order('extracted_at', { ascending: true });
      
      if (error) throw error;
      
      const prices = data as Price[];
      const trendsMap = new Map<string, PriceTrend>();
      
      // Group by product_id + store
      const grouped = new Map<string, Price[]>();
      for (const price of prices) {
        const key = `${price.product_id}-${price.store}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(price);
      }
      
      // Calculate trends
      for (const [key, priceList] of grouped) {
        if (priceList.length < 1) continue;
        
        // Sort by date
        priceList.sort((a, b) => 
          new Date(a.extracted_at).getTime() - new Date(b.extracted_at).getTime()
        );
        
        const current = priceList[priceList.length - 1];
        const currentEffective = current.is_promo && current.promo_price 
          ? current.promo_price 
          : current.price;
        
        // Find price from about a week ago
        let previous: Price | null = null;
        for (let i = priceList.length - 2; i >= 0; i--) {
          const daysDiff = differenceInDays(
            new Date(current.extracted_at),
            new Date(priceList[i].extracted_at)
          );
          if (daysDiff >= 5) {
            previous = priceList[i];
            break;
          }
        }
        
        if (!previous && priceList.length > 1) {
          previous = priceList[0];
        }
        
        const previousEffective = previous 
          ? (previous.is_promo && previous.promo_price ? previous.promo_price : previous.price)
          : null;
        
        let changePercent: number | null = null;
        let direction: 'up' | 'down' | 'stable' | null = null;
        
        if (previousEffective !== null) {
          changePercent = ((currentEffective - previousEffective) / previousEffective) * 100;
          if (Math.abs(changePercent) < 0.5) {
            direction = 'stable';
          } else {
            direction = changePercent > 0 ? 'up' : 'down';
          }
        }
        
        trendsMap.set(key, {
          productId: current.product_id,
          store: current.store,
          currentPrice: currentEffective,
          previousPrice: previousEffective,
          changePercent: changePercent !== null ? Math.round(changePercent * 10) / 10 : null,
          direction,
        });
      }
      
      return trendsMap;
    },
  });
}

export function usePriceTrend(productId: string, store: string) {
  const { data: trendsMap, ...rest } = usePriceTrends();
  
  const key = `${productId}-${store}`;
  const trend = trendsMap?.get(key) || null;
  
  return { data: trend, ...rest };
}
