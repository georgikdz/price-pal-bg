import { useState } from 'react';
import { CANONICAL_PRODUCTS, MOCK_PRICES, STORE_INFO, CATEGORY_LABELS } from '@/data/products';
import { Store, ProductCategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Filter } from 'lucide-react';

type SortField = 'name' | 'billa' | 'kaufland' | 'lidl';
type SortDirection = 'asc' | 'desc';

export function ComparisonTable() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)] as (ProductCategory | 'all')[];
  const stores: Store[] = ['billa', 'kaufland', 'lidl'];

  const filteredProducts = CANONICAL_PRODUCTS.filter(
    product => selectedCategory === 'all' || product.category === selectedCategory
  );

  const getPrice = (productId: string, store: Store) => {
    return MOCK_PRICES.find(p => p.productId === productId && p.store === store);
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.nameBg.localeCompare(b.nameBg)
        : b.nameBg.localeCompare(a.nameBg);
    }
    
    const priceA = getPrice(a.id, sortField)?.price ?? Infinity;
    const priceB = getPrice(b.id, sortField)?.price ?? Infinity;
    
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <div className="space-y-4">
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
            {category === 'all' ? 'All Products' : CATEGORY_LABELS[category]}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card shadow-md border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th 
                  className="text-left p-4 font-medium cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Product
                    <SortIcon field="name" />
                  </div>
                </th>
                {stores.map(store => (
                  <th 
                    key={store}
                    className="text-center p-4 font-medium cursor-pointer hover:bg-secondary/50 transition-colors min-w-[120px]"
                    onClick={() => handleSort(store)}
                  >
                    <div className={cn("flex items-center justify-center gap-2", `store-${store}`)}>
                      {STORE_INFO[store].name}
                      <SortIcon field={store} />
                    </div>
                  </th>
                ))}
                <th className="text-center p-4 font-medium min-w-[100px]">Best Deal</th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {sortedProducts.map(product => {
                const prices = stores.map(store => ({
                  store,
                  price: getPrice(product.id, store),
                }));
                
                const validPrices = prices.filter(p => p.price);
                const minPrice = validPrices.length > 0 
                  ? Math.min(...validPrices.map(p => p.price!.price))
                  : null;
                const bestStore = validPrices.find(p => p.price?.price === minPrice)?.store;
                
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
                          <p className="text-xs text-muted-foreground">per {product.unit}</p>
                        </div>
                      </div>
                    </td>
                    {stores.map(store => {
                      const priceData = getPrice(product.id, store);
                      const isLowest = priceData?.price === minPrice;
                      
                      return (
                        <td key={store} className="p-4 text-center">
                          {priceData ? (
                            <div className={cn(
                              "inline-flex flex-col items-center p-2 rounded-lg",
                              isLowest && "bg-primary/10"
                            )}>
                              <span className={cn(
                                "font-display font-bold text-lg",
                                isLowest ? "text-primary" : "text-foreground"
                              )}>
                                {priceData.price.toFixed(2)}
                              </span>
                              <span className="text-xs text-muted-foreground">лв.</span>
                              {priceData.isPromo && (
                                <Badge variant="promo" className="mt-1 text-xs">
                                  Promo
                                </Badge>
                              )}
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
    </div>
  );
}
