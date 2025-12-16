import { Badge } from '@/components/ui/badge';
import { CANONICAL_PRODUCTS, MOCK_PRICES, STORE_INFO } from '@/data/products';
import { Store } from '@/types';
import { cn } from '@/lib/utils';

export function BestDealsCard() {
  // Get promo items
  const promoItems = MOCK_PRICES.filter(p => p.isPromo).slice(0, 5);

  return (
    <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">🔥 Best Deals This Week</h3>
        <Badge variant="promo">Promo</Badge>
      </div>
      
      <div className="space-y-3 stagger-children">
        {promoItems.map((price) => {
          const product = CANONICAL_PRODUCTS.find(p => p.id === price.productId)!;
          const store = STORE_INFO[price.store];
          
          return (
            <div
              key={price.id}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{product.icon}</span>
                <div>
                  <p className="font-medium text-sm">{product.nameBg}</p>
                  <p className="text-xs text-muted-foreground">{price.brand}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-lg">{price.price.toFixed(2)} лв.</p>
                <Badge variant={price.store as Store} className="text-xs">
                  {store.name}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
