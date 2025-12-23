import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, Package, LayoutGrid } from 'lucide-react';
import { useShoppingList } from '@/hooks/useShoppingList';
import { ProductSearch } from '@/components/shopping-list/ProductSearch';
import { ShoppingListItems } from '@/components/shopping-list/ShoppingListItems';
import { StoreTotalsCard } from '@/components/shopping-list/StoreTotalsCard';
import { RecommendationBanner } from '@/components/shopping-list/RecommendationBanner';
import { ProductComparisonCard } from '@/components/shopping-list/ProductComparisonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type CompareView = 'total' | 'product';

export default function ShoppingListPage() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearList,
    storeTotals,
    recommendation,
    getItemPrice,
    isLoading,
  } = useShoppingList();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [compareView, setCompareView] = useState<CompareView>('total');

  const selectedItem = useMemo(() => {
    if (!selectedProductId) return null;
    return items.find((i) => i.productId === selectedProductId) ?? null;
  }, [items, selectedProductId]);

  // Auto-select the last added product
  useEffect(() => {
    if (items.length > 0 && !selectedProductId) {
      const lastItem = items[items.length - 1];
      setSelectedProductId(lastItem.productId);
      setCompareView('product');
    }
  }, [items.length]);

  // If selected product was removed, fall back
  useEffect(() => {
    if (selectedProductId && !selectedItem) {
      if (items.length > 0) {
        setSelectedProductId(items[items.length - 1].productId);
      } else {
        setSelectedProductId(null);
        setCompareView('total');
      }
    }
  }, [selectedItem, selectedProductId, items]);

  const handleSelectProduct = (productId: string) => {
    if (selectedProductId === productId) {
      // Toggle off - show total view
      setSelectedProductId(null);
      setCompareView('total');
    } else {
      setSelectedProductId(productId);
      setCompareView('product');
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Списък за пазаруване | ЦениБГ</title>
        <meta
          name="description"
          content="Създай списък за пазаруване и виж кой магазин предлага най-добрата обща цена."
        />
      </Helmet>

      <main className="container py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Списък за пазаруване
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Добави продукти и виж къде да пазаруваш най-изгодно
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearList} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Изчисти
            </Button>
          )}
        </header>

        {recommendation && <RecommendationBanner recommendation={recommendation} />}

        <section className="grid lg:grid-cols-2 gap-6" aria-label="Списък и сравнение">
          {/* Products column */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Продукти</h2>
                {items.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? 'продукт' : 'продукта'}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductSearch onAddProduct={addItem} addedProductIds={items.map(i => i.productId)} />
              <ShoppingListItems
                items={items}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                getItemPrice={getItemPrice}
                selectedProductId={selectedProductId}
                onSelectProduct={handleSelectProduct}
              />
            </CardContent>
          </Card>

          {/* Comparison column */}
          <Card>
            <CardHeader className="pb-3">
              {/* Tab switcher */}
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                <button
                  onClick={() => setCompareView('total')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    compareView === 'total'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Общо
                </button>
                <button
                  onClick={() => {
                    if (selectedProductId) {
                      setCompareView('product');
                    } else if (items.length > 0) {
                      setSelectedProductId(items[0].productId);
                      setCompareView('product');
                    }
                  }}
                  disabled={items.length === 0}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    compareView === 'product'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    items.length === 0 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Package className="h-4 w-4" />
                  Продукт
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="font-medium">Добави продукти</p>
                  <p className="text-sm">за да видиш сравнение на цените</p>
                </div>
              ) : compareView === 'product' && selectedProductId && selectedItem ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                  <ProductComparisonCard
                    productId={selectedProductId}
                    quantity={selectedItem.quantity}
                    getItemPrice={getItemPrice}
                  />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-200">
                  <StoreTotalsCard totals={storeTotals} bestStore={recommendation?.bestStore || null} />
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </Layout>
  );
}
