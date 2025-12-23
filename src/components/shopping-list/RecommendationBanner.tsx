import { Store } from '@/types';
import { STORE_INFO } from '@/data/products';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationBannerProps {
  recommendation: {
    bestStore: Store;
    savings: number;
    savingsPercent: number;
    totalItems: number;
    coveredItems: number;
    bestTotal?: number;
  } | null;
}

export function RecommendationBanner({ recommendation }: RecommendationBannerProps) {
  if (!recommendation) {
    return null;
  }

  const storeInfo = STORE_INFO[recommendation.bestStore];
  const bestTotal = recommendation.bestTotal;

  return (
    <section
      aria-label="Препоръка за пазаруване"
      className={cn(
        "p-4 rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-accent/10",
        "border border-primary/20"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-2xl">{storeInfo.logo}</span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">
              Най-изгодно в {storeInfo.name}
            </h3>
          </div>

          {bestTotal !== undefined && bestTotal > 0 ? (
            <p className="text-sm text-muted-foreground">
              Обща сума:{' '}
              <span className="font-bold text-primary text-base">{bestTotal.toFixed(2)} лв</span>
              {recommendation.savings > 0.5 && (
                <span className="ml-2 text-xs">
                  ({recommendation.savings.toFixed(2)} лв по-евтино от другите)
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Най-добрата обща цена за твоя списък
            </p>
          )}

          {recommendation.coveredItems < recommendation.totalItems && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              * {recommendation.coveredItems} от {recommendation.totalItems} продукта с налични цени
            </p>
          )}
        </div>

        <ArrowRight className="h-5 w-5 text-primary/50 shrink-0" />
      </div>
    </section>
  );
}
