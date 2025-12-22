import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useShoppingList } from '@/hooks/useShoppingList';
import { ProductSearch } from '@/components/shopping-list/ProductSearch';
import { ShoppingListItems } from '@/components/shopping-list/ShoppingListItems';
import { StoreTotalsCard } from '@/components/shopping-list/StoreTotalsCard';
import { RecommendationBanner } from '@/components/shopping-list/RecommendationBanner';
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
    isLoading,
  } = useShoppingList();

  return (
    <Layout>
      <Helmet>
        <title>Списък за пазаруване | ЦениБГ</title>
        <meta name="description" content="Създай списък за пазаруване и виж кой магазин предлага най-добрата обща цена." />
      </Helmet>

      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
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
        </div>

        {recommendation && <RecommendationBanner recommendation={recommendation} />}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Продукти</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductSearch
                onAddProduct={addItem}
                addedProductIds={items.map(i => i.productId)}
              />
              <ShoppingListItems
                items={items}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Сравнение по магазини</CardTitle>
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
              ) : (
                <StoreTotalsCard
                  totals={storeTotals}
                  bestStore={recommendation?.bestStore || null}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
