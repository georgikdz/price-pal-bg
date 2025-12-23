import { Store } from '@/types';
import { STORE_INFO } from '@/data/products';
import { StoreTotals } from '@/hooks/useShoppingList';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, TrendingDown } from 'lucide-react';

interface StoreTotalsCardProps {
  totals: StoreTotals[];
  bestStore: Store | null;
}

export function StoreTotalsCard({ totals, bestStore }: StoreTotalsCardProps) {
  const sortedTotals = [...totals].sort((a, b) => {
    if (a.total === 0 && b.total === 0) return 0;
    if (a.total === 0) return 1;
    if (b.total === 0) return -1;
    return a.total - b.total;
  });

  const maxTotal = Math.max(...totals.filter(t => t.total > 0).map(t => t.total));

  return (
    <section aria-label="Сравнение по магазини" className="space-y-3">
      <header className="flex items-center gap-2 text-sm text-muted-foreground pb-1">
        <TrendingDown className="h-4 w-4" />
        <span>Обща сума за всички продукти:</span>
      </header>

      <div className="space-y-2">
        {sortedTotals.map(({ store, total, itemCount, missingItems }, index) => {
          const storeInfo = STORE_INFO[store];
          const isBest = store === bestStore && total > 0;
          const hasMissing = missingItems.length > 0;
          const savings = isBest && maxTotal > 0 ? maxTotal - total : 0;

          return (
            <article
              key={store}
              className={cn(
                "relative p-4 rounded-xl border transition-all duration-200",
                isBest
                  ? "bg-primary/5 border-primary/40 shadow-sm"
                  : "bg-card border-border/40 hover:border-border"
              )}
            >
              {/* Rank indicator for top store */}
              {index === 0 && total > 0 && (
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
                          Най-изгодно
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {itemCount} от {itemCount + missingItems.length} продукта
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "font-display text-2xl font-bold tabular-nums",
                    isBest ? "text-primary" : "text-foreground"
                  )}>
                    {total > 0 ? `${total.toFixed(2)} лв` : '—'}
                  </p>
                  {savings > 0 && (
                    <p className="text-xs text-primary font-medium">
                      спестяваш {savings.toFixed(2)} лв
                    </p>
                  )}
                </div>
              </div>

              {hasMissing && (
                <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border/30">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Липсват: {missingItems.slice(0, 3).join(', ')}
                    {missingItems.length > 3 && ` +${missingItems.length - 3} още`}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
