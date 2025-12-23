import { Store } from '@/types';
import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Info, ArrowRight } from 'lucide-react';

interface ProductComparisonCardProps {
  productId: string;
  quantity: number;
  getItemPrice: (productId: string, store: Store) => number | undefined;
}

export function ProductComparisonCard({ productId, quantity, getItemPrice }: ProductComparisonCardProps) {
  const product = CANONICAL_PRODUCTS.find((p) => p.id === productId);
  const stores: Store[] = ['billa', 'kaufland', 'lidl'];

  const rows = stores.map((store) => {
    const unitPrice = getItemPrice(productId, store);
    const total = unitPrice !== undefined && Number.isFinite(unitPrice) ? unitPrice * quantity : undefined;
    return { store, unitPrice, total };
  });

  const totals = rows
    .map((r) => r.total)
    .filter((v): v is number => v !== undefined && Number.isFinite(v));

  const minTotal = totals.length ? Math.min(...totals) : undefined;
  const maxTotal = totals.length ? Math.max(...totals) : undefined;

  const cheapestStore = rows.find((r) => r.total !== undefined && r.total === minTotal)?.store;
  const savings =
    minTotal !== undefined && maxTotal !== undefined && Number.isFinite(minTotal) && Number.isFinite(maxTotal)
      ? maxTotal - minTotal
      : 0;

  return (
    <section aria-label="Сравнение на избран продукт" className="space-y-4">
      {/* Product header */}
      <header className="flex items-center gap-3 pb-2 border-b border-border/30">
        <div className="text-3xl">{product?.icon ?? '🧺'}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {product ? product.nameBg : productId}
          </h3>
          <p className="text-sm text-muted-foreground">
            {quantity} × {product?.unit ?? 'бр.'}
          </p>
        </div>
        {totals.length >= 2 && cheapestStore && savings > 0 && (
          <Badge variant="secondary" className="gap-1 text-primary bg-primary/10">
            <ArrowRight className="h-3 w-3" />
            {savings.toFixed(2)} лв спестени
          </Badge>
        )}
      </header>

      {/* Store comparison */}
      {totals.length < 2 ? (
        <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-xl text-muted-foreground">
          <Info className="h-5 w-5" />
          <p className="text-sm">Няма достатъчно цени за сравнение.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(({ store, unitPrice, total }, index) => {
            const storeInfo = STORE_INFO[store];
            const isBest = cheapestStore === store && total !== undefined;

            return (
              <article
                key={store}
                className={cn(
                  "relative p-4 rounded-xl border transition-all duration-200",
                  isBest 
                    ? "bg-primary/5 border-primary/40 shadow-sm" 
                    : "bg-card border-border/40"
                )}
              >
                {/* Rank badge */}
                {index === 0 && total !== undefined && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                      #1
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{storeInfo.logo}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-semibold",
                          isBest ? "text-primary" : "text-foreground"
                        )}>
                          {storeInfo.name}
                        </span>
                        {isBest && (
                          <Badge variant="default" className="text-xs gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Най-евтино
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {unitPrice !== undefined 
                          ? `${unitPrice.toFixed(2)} лв / ${product?.unit ?? 'бр.'}`
                          : 'няма цена'
                        }
                      </p>
                    </div>
                  </div>

                  <p className={cn(
                    "font-display text-2xl font-bold tabular-nums",
                    isBest ? "text-primary" : "text-foreground"
                  )}>
                    {total !== undefined ? `${total.toFixed(2)} лв` : '—'}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
