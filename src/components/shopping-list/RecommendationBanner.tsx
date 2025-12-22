import { Store } from '@/types';
import { STORE_INFO } from '@/data/products';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationBannerProps {
  recommendation: {
    bestStore: Store;
    savings: number;
    savingsPercent: number;
    totalItems: number;
    coveredItems: number;
  } | null;
}

export function RecommendationBanner({ recommendation }: RecommendationBannerProps) {
  if (!recommendation) {
    return null;
  }

  const storeInfo = STORE_INFO[recommendation.bestStore];
  const hasSavings = recommendation.savings > 0;

  return (
    <section
      aria-label="Препоръка за пазаруване"
      className={cn(
        "p-4 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20",
        "border border-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">
            {hasSavings
              ? <>Препоръка: Пазарувай в {storeInfo.name}!</>
              : <>Няма разлика в общата цена тази седмица</>}
          </h3>

          {hasSavings ? (
            <p className="text-sm text-muted-foreground">
              Ще спестиш <span className="font-bold text-primary">{recommendation.savings.toFixed(2)} лв</span>
              {' '}({recommendation.savingsPercent.toFixed(0)}% по-евтино) спрямо най-скъпата опция.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Най-ниската обща сума в момента е в <span className="font-semibold text-foreground">{storeInfo.name}</span>.
            </p>
          )}

          {recommendation.coveredItems < recommendation.totalItems && (
            <p className="text-xs text-muted-foreground mt-1">
              * Базирано на {recommendation.coveredItems} от {recommendation.totalItems} продукта с налични цени
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
