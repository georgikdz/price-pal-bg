import { Search, TrendingDown, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePromoPrices } from '@/hooks/usePrices';
import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';

interface EmptyCompareStateProps {
  onSearchFocus: () => void;
}

export function EmptyCompareState({ onSearchFocus }: EmptyCompareStateProps) {
  const { data: promos, isLoading } = usePromoPrices();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <ShoppingCart className="h-16 w-16 text-primary/60" />
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
          <TrendingDown className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      {/* Text */}
      <h2 className="font-display text-2xl font-bold text-center mb-2">
        Намери най-добрите цени
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Търси продукти и сравни цените между магазините. Открий къде е най-изгодно!
      </p>

      {/* CTA Button */}
      <Button 
        size="lg" 
        className="gap-2 mb-10"
        onClick={onSearchFocus}
      >
        <Search className="h-4 w-4" />
        Започни търсене
      </Button>

      {/* Top Promos */}
      {!isLoading && promos && promos.length > 0 && (
        <div className="w-full max-w-2xl">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">🔥</span>
            Топ промоции за деня
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {promos.slice(0, 6).map((promo) => {
              const product = CANONICAL_PRODUCTS.find(p => p.id === promo.product_id);
              const store = promo.store as keyof typeof STORE_INFO;
              const storeInfo = STORE_INFO[store];
              
              if (!product || !storeInfo) return null;
              
              const savings = promo.promo_price 
                ? Math.round(((promo.price - promo.promo_price) / promo.price) * 100)
                : 0;
              
              return (
                <div
                  key={promo.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <span className="text-2xl">{product.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.nameBg}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant={store} className="text-xs">
                        {storeInfo.name}
                      </Badge>
                      {promo.promo_price && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {promo.promo_price.toFixed(2)} лв.
                        </span>
                      )}
                    </div>
                  </div>
                  {savings > 0 && (
                    <Badge variant="promo" className="shrink-0">
                      -{savings}%
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
