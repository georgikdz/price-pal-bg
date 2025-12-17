import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CANONICAL_PRODUCTS } from '@/data/products';
import { Button } from '@/components/ui/button';
import { usePriceHistory } from '@/hooks/usePrices';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export function PriceTrendChart() {
  const [selectedProduct, setSelectedProduct] = useState('milk');
  const product = CANONICAL_PRODUCTS.find(p => p.id === selectedProduct)!;
  const { data: priceHistory, isLoading } = usePriceHistory(selectedProduct);

  const popularProducts = ['milk', 'bread', 'eggs', 'sunflower-oil', 'chicken', 'kashkaval'];

  // Transform price history into chart data grouped by date
  const chartData = priceHistory?.reduce((acc, price) => {
    const dateKey = format(new Date(price.extracted_at), 'dd/MM');
    const existing = acc.find(item => item.date === dateKey);
    const effectivePrice = price.is_promo && price.promo_price ? price.promo_price : price.price;
    
    if (existing) {
      existing[price.store] = effectivePrice;
    } else {
      acc.push({
        date: dateKey,
        [price.store]: effectivePrice,
      });
    }
    return acc;
  }, [] as Array<{ date: string; [key: string]: string | number }>) || [];

  return (
    <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{product.icon}</span>
          <div>
            <h3 className="font-display text-lg font-semibold">{product.nameBg}</h3>
            <p className="text-sm text-muted-foreground">Price History</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {popularProducts.map(id => {
          const p = CANONICAL_PRODUCTS.find(prod => prod.id === id)!;
          return (
            <Button
              key={id}
              variant={selectedProduct === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProduct(id)}
              className="shrink-0"
            >
              <span className="mr-1">{p.icon}</span>
              {p.nameBg}
            </Button>
          );
        })}
      </div>

      <div className="h-[300px] w-full">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No price data available for this product yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value} лв.`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  boxShadow: 'var(--shadow-lg)',
                }}
                formatter={(value: number) => [`${value?.toFixed(2)} лв.`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="billa" 
                stroke="hsl(var(--billa))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--billa))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
                name="Billa"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="kaufland" 
                stroke="hsl(var(--kaufland))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--kaufland))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
                name="Kaufland"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="lidl" 
                stroke="hsl(var(--lidl))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--lidl))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
                name="Lidl"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
