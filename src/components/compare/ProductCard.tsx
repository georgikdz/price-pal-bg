import { CanonicalProduct, Store } from '@/types';
import { STORE_INFO } from '@/data/products';
import { Price } from '@/hooks/usePrices';
import { PriceTrend } from '@/hooks/usePriceTrend';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface ProductCardProps {
  product: CanonicalProduct;
  prices: { store: Store; priceData: Price | undefined }[];
  trends?: Map<string, PriceTrend>;
  bestStore: Store | null;
  minPrice: number | null;
  getEffectivePrice: (price: Price | undefined) => number | undefined;
}

export function ProductCard({
  product,
  prices,
  trends,
  bestStore,
  minPrice,
  getEffectivePrice,
}: ProductCardProps) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
      {/* Product Header */}
      <div className="p-4 border-b border-border/30 bg-secondary/20">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{product.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{product.nameBg}</h3>
            <p className="text-sm text-muted-foreground">за {product.unit}</p>
          </div>
          {bestStore && (
            <Badge variant={bestStore} className="font-semibold">
              Най-добра: {STORE_INFO[bestStore].name}
            </Badge>
          )}
        </div>
      </div>

      {/* Store Prices Grid */}
      <div className="grid grid-cols-3 divide-x divide-border/30">
        {prices.map(({ store, priceData }) => {
          const effectivePrice = getEffectivePrice(priceData);
          const isLowest = effectivePrice === minPrice && minPrice !== null;
          const trend = trends?.get(`${product.id}-${store}`);

          return (
            <div
              key={store}
              className={cn(
                "p-4 text-center transition-colors",
                isLowest && "bg-emerald-500/10"
              )}
            >
              {/* Store Name */}
              <p className={cn("text-sm font-medium mb-2", `store-${store}`)}>
                {STORE_INFO[store].name}
              </p>

              {priceData ? (
                <div className="space-y-1">
                  {/* Price */}
                  {priceData.is_promo && priceData.promo_price ? (
                    <>
                      <span className="text-xs text-muted-foreground line-through block">
                        {priceData.price.toFixed(2)} лв.
                      </span>
                      <span
                        className={cn(
                          "font-display font-bold text-xl block",
                          isLowest ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                        )}
                      >
                        {priceData.promo_price.toFixed(2)} лв.
                      </span>
                    </>
                  ) : (
                    <span
                      className={cn(
                        "font-display font-bold text-xl block",
                        isLowest ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                      )}
                    >
                      {priceData.price.toFixed(2)} лв.
                    </span>
                  )}

                  {/* Promo Badge */}
                  {priceData.is_promo && (
                    <Badge variant="promo" className="text-xs">
                      Промо
                    </Badge>
                  )}

                  {/* Trend Indicator */}
                  {trend && trend.direction && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {trend.direction === 'down' && (
                        <>
                          <TrendingDown className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            {Math.abs(trend.changePercent!)}% по-евтино
                          </span>
                        </>
                      )}
                      {trend.direction === 'up' && (
                        <>
                          <TrendingUp className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-600 dark:text-red-400">
                            +{Math.abs(trend.changePercent!)}%
                          </span>
                        </>
                      )}
                      {trend.direction === 'stable' && (
                        <>
                          <Minus className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">стабилна</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Няма данни</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
