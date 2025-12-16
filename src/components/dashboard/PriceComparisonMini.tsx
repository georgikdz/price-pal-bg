import { CANONICAL_PRODUCTS, MOCK_PRICES, STORE_INFO } from '@/data/products';
import { Store } from '@/types';
import { cn } from '@/lib/utils';

interface PriceComparisonMiniProps {
  productId: string;
}

export function PriceComparisonMini({ productId }: PriceComparisonMiniProps) {
  const product = CANONICAL_PRODUCTS.find(p => p.id === productId)!;
  const prices = MOCK_PRICES.filter(p => p.productId === productId);
  
  const minPrice = Math.min(...prices.map(p => p.price));
  const stores: Store[] = ['billa', 'kaufland', 'lidl'];

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
          const price = prices.find(p => p.store === store);
          const isLowest = price?.price === minPrice;
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
                {price ? `${price.price.toFixed(2)}` : '-'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
