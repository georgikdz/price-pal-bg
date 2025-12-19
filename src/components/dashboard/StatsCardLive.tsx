import { StatsCard } from './StatsCard';
import { usePriceStats, useLatestPrices } from '@/hooks/usePrices';
import { CANONICAL_PRODUCTS } from '@/data/products';
import { TrendingDown, Package, Store, Percent } from 'lucide-react';

export function StatsCardsLive() {
  const { data: prices } = useLatestPrices();
  const stats = usePriceStats();
  
  // Count products that have prices
  const trackedProducts = prices 
    ? new Set(prices.map(p => p.product_id)).size 
    : 0;
  
  // Count unique stores
  const storesCompared = prices 
    ? new Set(prices.map(p => p.store)).size 
    : 0;
  
  // Count promos
  const priceDrops = prices 
    ? prices.filter(p => p.is_promo).length 
    : 0;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Проследени продукти"
        value={trackedProducts > 0 ? String(trackedProducts) : String(CANONICAL_PRODUCTS.length)}
        subtitle={trackedProducts > 0 ? "С реални цени" : "Основни продукти"}
        icon={<Package className="h-6 w-6" />}
      />
      <StatsCard
        title="Сравнени магазини"
        value={storesCompared > 0 ? String(storesCompared) : "3"}
        subtitle="Billa • Kaufland • Lidl"
        icon={<Store className="h-6 w-6" />}
      />
      <StatsCard
        title="Средни спестявания"
        value={stats.avgSavings > 0 ? `${stats.avgSavings}%` : "—"}
        subtitle="От промоции"
        icon={<Percent className="h-6 w-6" />}
      />
      <StatsCard
        title="Намалени цени"
        value={String(priceDrops)}
        subtitle="Тази седмица"
        icon={<TrendingDown className="h-6 w-6" />}
      />
    </div>
  );
}
