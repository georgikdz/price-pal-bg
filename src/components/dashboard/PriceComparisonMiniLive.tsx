import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';
import { Store } from '@/types';
import { cn } from '@/lib/utils';
import { usePricesByProduct } from '@/hooks/usePrices';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceComparisonMiniLiveProps {
  productId: string;
}

export function PriceComparisonMiniLive({ productId }: PriceComparisonMiniLiveProps) {
  const product = CANONICAL_PRODUCTS.find(p => p.id === productId)!;
  const { data: prices, isLoading } = usePricesByProduct(productId);
  
  const stores: Store[] = ['billa', 'kaufland', 'lidl'];
  const minPrice = prices && prices.length > 0 
    ? Math.min(...prices.map(p => Number(p.price))) 
    : null;

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-4 shadow-sm border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{product.icon}</span>
          <div>
            <p className="font-medium text-sm">{product.nameBg}</p>
            <p className="text-xs text-muted-foreground">per {product.unit}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stores.map(store => (
            <Skeleton key={store} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-4 shadow-sm border border-border/50">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{product.icon}</span>
        <div>
          <p className="font-medium text-sm">{product.nameBg}</p>
          <p className="text-xs text-muted-foreground">per {product.unit}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {stores.map(store => {
          const price = prices?.find(p => p.store === store);
          const isLowest = price && Number(price.price) === minPrice;
          const storeInfo = STORE_INFO[store];
          
          return (
            <div
              key={store}
              className={cn(
                "text-center p-2 rounded-lg transition-all",
                isLowest 
                  ? "bg-primary/10 ring-2 ring-primary/20" 
                  : "bg-secondary/50"
              )}
            >
              <p className={cn(
                "text-xs font-medium mb-1",
                `store-${store}`
              )}>
                {storeInfo.name}
              </p>
              <p className={cn(
                "font-display font-bold",
                isLowest ? "text-primary" : "text-foreground"
              )}>
                {price ? `${Number(price.price).toFixed(2)}` : '-'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
