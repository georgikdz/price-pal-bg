import { useState, useRef } from 'react';
import { CANONICAL_PRODUCTS, STORE_INFO, CATEGORY_LABELS } from '@/data/products';
import { Store, ProductCategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Filter, Loader2, Share2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useLatestPrices, Price } from '@/hooks/usePrices';
import { usePriceTrends, PriceTrend } from '@/hooks/usePriceTrend';
import { QuickSearch, QuickSearchRef } from './QuickSearch';
import { ProductCard } from './ProductCard';
import { EmptyCompareState } from './EmptyCompareState';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

type SortField = 'name' | 'billa' | 'kaufland' | 'lidl';
type SortDirection = 'asc' | 'desc';

export function ComparisonTable() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const searchRef = useRef<QuickSearchRef>(null);
  const isMobile = useIsMobile();
  
  const { data: prices, isLoading: pricesLoading } = useLatestPrices();
  const { data: trends, isLoading: trendsLoading } = usePriceTrends();

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)] as (ProductCategory | 'all')[];
  const stores: Store[] = ['billa', 'kaufland', 'lidl'];

  // Filter products
  const filteredProducts = CANONICAL_PRODUCTS.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const selectionMatch = selectedProducts.length === 0 || selectedProducts.includes(product.id);
    return categoryMatch && selectionMatch;
  });

  const getPrice = (productId: string, store: Store): Price | undefined => {
    return prices?.find(p => p.product_id === productId && p.store === store);
  };

  const getEffectivePrice = (price: Price | undefined): number | undefined => {
    if (!price) return undefined;
    return price.is_promo && price.promo_price ? price.promo_price : price.price;
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.nameBg.localeCompare(b.nameBg)
        : b.nameBg.localeCompare(a.nameBg);
    }
    
    const priceA = getEffectivePrice(getPrice(a.id, sortField)) ?? Infinity;
    const priceB = getEffectivePrice(getPrice(b.id, sortField)) ?? Infinity;
    
    return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleShare = async () => {
    const productNames = selectedProducts.length > 0
      ? selectedProducts.map(id => CANONICAL_PRODUCTS.find(p => p.id === id)?.nameBg).filter(Boolean).join(', ')
      : 'Всички продукти';
    
    const shareData = {
      title: 'Сравнение на цени - ЦениБГ',
      text: `Виж сравнение на цените за: ${productNames}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Линкът е копиран!');
      }
    } catch (err) {
      // User cancelled or error
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  const TrendIndicator = ({ productId, store }: { productId: string; store: string }) => {
    const trend = trends?.get(`${productId}-${store}`);
    if (!trend || !trend.direction) return null;

    return (
      <div className="flex items-center justify-center gap-1 mt-1">
        {trend.direction === 'down' && (
          <>
            <TrendingDown className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              {Math.abs(trend.changePercent!)}% по-евтино
            </span>
          </>
        )}
        {trend.direction === 'up' && (
          <>
            <TrendingUp className="h-3 w-3 text-red-500" />
            <span className="text-[10px] text-red-600 dark:text-red-400">
              +{Math.abs(trend.changePercent!)}%
            </span>
          </>
        )}
        {trend.direction === 'stable' && (
          <>
            <Minus className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">стабилна</span>
          </>
        )}
      </div>
    );
  };

  const isLoading = pricesLoading || trendsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show empty state if no products selected and search is active
  const showEmptyState = selectedProducts.length === 0 && sortedProducts.length === 0;

  return (
    <div className="space-y-6">
      {/* Quick Search */}
      <div className="rounded-2xl bg-card shadow-sm border border-border/50 p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-semibold text-lg">Търсене на продукти</h2>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Сподели
          </Button>
        </div>
        <QuickSearch
          ref={searchRef}
          selectedProducts={selectedProducts}
          onProductToggle={handleProductToggle}
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="shrink-0"
          >
            {category === 'all' ? 'Всички' : CATEGORY_LABELS[category]}
          </Button>
        ))}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 ? (
        <EmptyCompareState onSearchFocus={() => searchRef.current?.focus()} />
      ) : (
        <>
          {/* Mobile: Cards Layout */}
          {isMobile ? (
            <div className="space-y-4">
              {sortedProducts.map(product => {
                const storePrices = stores.map(store => ({
                  store,
                  priceData: getPrice(product.id, store),
                }));
                
                const validPrices = storePrices.filter(p => p.priceData);
                const effectivePrices = validPrices.map(p => ({
                  store: p.store,
                  effectivePrice: getEffectivePrice(p.priceData)!,
                }));
                
                const minPrice = effectivePrices.length > 0 
                  ? Math.min(...effectivePrices.map(p => p.effectivePrice))
                  : null;
                const bestStore = effectivePrices.find(p => p.effectivePrice === minPrice)?.store || null;

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    prices={storePrices}
                    trends={trends}
                    bestStore={bestStore}
                    minPrice={minPrice}
                    getEffectivePrice={getEffectivePrice}
                  />
                );
              })}
            </div>
          ) : (
            /* Desktop: Table Layout */
            <div className="rounded-2xl bg-card shadow-md border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-border bg-secondary/50 backdrop-blur-sm">
                      <th 
                        className="text-left p-4 font-medium cursor-pointer hover:bg-secondary/70 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-2">
                          Продукт
                          <SortIcon field="name" />
                        </div>
                      </th>
                      {stores.map(store => (
                        <th 
                          key={store}
                          className="text-center p-4 font-medium cursor-pointer hover:bg-secondary/70 transition-colors min-w-[140px]"
                          onClick={() => handleSort(store)}
                        >
                          <div className={cn("flex items-center justify-center gap-2", `store-${store}`)}>
                            {STORE_INFO[store].name}
                            <SortIcon field={store} />
                          </div>
                        </th>
                      ))}
                      <th className="text-center p-4 font-medium min-w-[120px]">Най-добра оферта</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map(product => {
                      const storePrices = stores.map(store => ({
                        store,
                        priceData: getPrice(product.id, store),
                      }));
                      
                      const validPrices = storePrices.filter(p => p.priceData);
                      const effectivePrices = validPrices.map(p => ({
                        store: p.store,
                        effectivePrice: getEffectivePrice(p.priceData)!,
                      }));
                      
                      const minPrice = effectivePrices.length > 0 
                        ? Math.min(...effectivePrices.map(p => p.effectivePrice))
                        : null;
                      const bestStore = effectivePrices.find(p => p.effectivePrice === minPrice)?.store;
                      
                      return (
                        <tr 
                          key={product.id}
                          className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{product.icon}</span>
                              <div>
                                <p className="font-medium">{product.nameBg}</p>
                                <p className="text-xs text-muted-foreground">за {product.unit}</p>
                              </div>
                            </div>
                          </td>
                          {stores.map(store => {
                            const priceData = getPrice(product.id, store);
                            const effectivePrice = getEffectivePrice(priceData);
                            const isLowest = effectivePrice === minPrice && minPrice !== null;
                            
                            return (
                              <td key={store} className="p-4 text-center">
                                {priceData ? (
                                  <div className={cn(
                                    "inline-flex flex-col items-center p-2 rounded-lg transition-colors",
                                    isLowest && "bg-emerald-500/10"
                                  )}>
                                    {priceData.is_promo && priceData.promo_price ? (
                                      <>
                                        <span className="text-xs text-muted-foreground line-through">
                                          {priceData.price.toFixed(2)} лв.
                                        </span>
                                        <span className={cn(
                                          "font-display font-bold text-lg",
                                          isLowest ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                                        )}>
                                          {priceData.promo_price.toFixed(2)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className={cn(
                                        "font-display font-bold text-lg",
                                        isLowest ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                                      )}>
                                        {priceData.price.toFixed(2)}
                                      </span>
                                    )}
                                    <span className="text-xs text-muted-foreground">лв.</span>
                                    {priceData.is_promo && (
                                      <Badge variant="promo" className="mt-1 text-xs">
                                        Промо
                                      </Badge>
                                    )}
                                    <TrendIndicator productId={product.id} store={store} />
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-4 text-center">
                            {bestStore && (
                              <Badge variant={bestStore} className="font-semibold">
                                {STORE_INFO[bestStore].name}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
