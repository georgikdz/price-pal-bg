import { Store } from '@/types';
import { STORE_INFO } from '@/data/products';
import { StoreTotals } from '@/hooks/useShoppingList';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

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

  return (
    <div className="space-y-3">
      {sortedTotals.map(({ store, total, itemCount, missingItems }) => {
        const storeInfo = STORE_INFO[store];
        const isBest = store === bestStore && total > 0;
        const hasMissing = missingItems.length > 0;

        return (
          <div
            key={store}
            className={cn(
              "p-4 rounded-xl border transition-all",
              isBest
                ? "bg-primary/5 border-primary/30 ring-2 ring-primary/20"
                : "bg-card border-border/50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{storeInfo.logo}</span>
                <span className={cn("font-semibold", `text-store-${store}`)}>
                  {storeInfo.name}
                </span>
                {isBest && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Най-евтино
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-display text-2xl font-bold",
                  isBest ? "text-primary" : "text-foreground"
                )}>
                  {total > 0 ? `${total.toFixed(2)} лв` : '-'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {itemCount} от {itemCount + missingItems.length} продукта
                </p>
              </div>
            </div>

            {hasMissing && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Липсват: {missingItems.join(', ')}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
