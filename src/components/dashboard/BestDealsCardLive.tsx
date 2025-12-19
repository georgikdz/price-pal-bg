import { Badge } from '@/components/ui/badge';
import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';
import { Store } from '@/types';
import { usePromoPrices } from '@/hooks/usePrices';
import { Skeleton } from '@/components/ui/skeleton';

export function BestDealsCardLive() {
  const { data: promoItems, isLoading } = usePromoPrices();

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">🔥 Най-добри оферти</h3>
          <Badge variant="promo">Промо</Badge>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!promoItems || promoItems.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">🔥 Най-добри оферти</h3>
          <Badge variant="promo">Промо</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Няма намерени промоции. Качете брошури, за да видите актуалните оферти.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">🔥 Най-добри оферти</h3>
        <Badge variant="promo">Промо</Badge>
      </div>
      
      <div className="space-y-3 stagger-children">
        {promoItems.slice(0, 5).map((price) => {
          const product = CANONICAL_PRODUCTS.find(p => p.id === price.product_id);
          const store = STORE_INFO[price.store as Store];
          
          if (!product || !store) return null;
          
          return (
            <div
              key={price.id}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{product.icon}</span>
                <div>
                  <p className="font-medium text-sm">{product.nameBg}</p>
                  <p className="text-xs text-muted-foreground">{price.brand || price.store}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-lg">{Number(price.price).toFixed(2)} лв.</p>
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
