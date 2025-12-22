import { Store } from '@/types';
import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Info } from 'lucide-react';

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
    <section aria-label="Сравнение на избран продукт" className="space-y-3">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            {product?.icon ?? '🧺'}
          </span>
          <h3 className="text-sm font-semibold text-foreground">
            {product ? product.nameBg : productId}
            <span className="text-muted-foreground font-normal"> × {quantity}</span>
          </h3>
        </div>

        {totals.length >= 2 && cheapestStore ? (
          <p className="text-sm text-muted-foreground">
            Най-евтино: <span className="font-semibold text-foreground">{STORE_INFO[cheapestStore].name}</span>
            {savings > 0 && (
              <>
                {' '}• спестяваш <span className="font-semibold text-primary">{savings.toFixed(2)} лв</span>
              </>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4" /> Няма достатъчно цени за сравнение на този продукт.
          </p>
        )}
      </header>

      <div className="space-y-3">
        {rows.map(({ store, unitPrice, total }) => {
          const storeInfo = STORE_INFO[store];
          const isBest = cheapestStore === store && total !== undefined;

          return (
            <article
              key={store}
              className={cn(
                "p-4 rounded-xl border transition-all",
                isBest ? "bg-primary/5 border-primary/30 ring-2 ring-primary/20" : "bg-card border-border/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden>
                    {storeInfo.logo}
                  </span>
                  <span className={cn("font-semibold", `text-store-${store}`)}>{storeInfo.name}</span>
                  {isBest && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" /> Най-евтино
                    </Badge>
                  )}
                </div>

                <div className="text-right">
                  <p className={cn("font-display text-2xl font-bold", isBest ? "text-primary" : "text-foreground")}>
                    {total !== undefined ? `${total.toFixed(2)} лв` : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {unitPrice !== undefined ? `${unitPrice.toFixed(2)} лв / ${product?.unit ?? 'бр.'}` : 'няма цена'}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
