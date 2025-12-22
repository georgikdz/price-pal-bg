import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, X } from 'lucide-react';
import { useShoppingList } from '@/hooks/useShoppingList';
import { ProductSearch } from '@/components/shopping-list/ProductSearch';
import { ShoppingListItems } from '@/components/shopping-list/ShoppingListItems';
import { StoreTotalsCard } from '@/components/shopping-list/StoreTotalsCard';
import { RecommendationBanner } from '@/components/shopping-list/RecommendationBanner';
import { ProductComparisonCard } from '@/components/shopping-list/ProductComparisonCard';
import { Skeleton } from '@/components/ui/skeleton';

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

  const selectedItem = useMemo(() => {
    if (!selectedProductId) return null;
    return items.find((i) => i.productId === selectedProductId) ?? null;
  }, [items, selectedProductId]);

  useEffect(() => {
    // if the selected product was removed, reset selection
    if (selectedProductId && !selectedItem) {
      setSelectedProductId(null);
    }
  }, [selectedItem, selectedProductId]);

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
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Продукти</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductSearch onAddProduct={addItem} addedProductIds={items.map(i => i.productId)} />
              <ShoppingListItems
                items={items}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                getItemPrice={getItemPrice}
                selectedProductId={selectedProductId}
                onSelectProduct={(productId) =>
                  setSelectedProductId((prev) => (prev === productId ? null : productId))
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">
                  {selectedProductId ? 'Сравнение (избран продукт)' : 'Сравнение по магазини'}
                </CardTitle>
                {selectedProductId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setSelectedProductId(null)}
                  >
                    <X className="h-4 w-4" />
                    Общо
                  </Button>
                )}
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
                  <p className="text-sm">Добави продукти, за да видиш сравнение</p>
                </div>
              ) : selectedProductId && selectedItem ? (
                <ProductComparisonCard
                  productId={selectedProductId}
                  quantity={selectedItem.quantity}
                  getItemPrice={getItemPrice}
                />
              ) : (
                <StoreTotalsCard totals={storeTotals} bestStore={recommendation?.bestStore || null} />
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </Layout>
  );
}
