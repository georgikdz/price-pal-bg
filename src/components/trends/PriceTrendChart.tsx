import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CANONICAL_PRODUCTS } from '@/data/products';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Generate mock historical data
const generateHistoricalData = (productId: string) => {
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  const basePrice = Math.random() * 10 + 5;
  
  return weeks.map(week => ({
    week,
    billa: Math.round((basePrice + (Math.random() - 0.5) * 3) * 100) / 100,
    kaufland: Math.round((basePrice + (Math.random() - 0.5) * 3) * 100) / 100,
    lidl: Math.round((basePrice + (Math.random() - 0.5) * 3) * 100) / 100,
  }));
};

export function PriceTrendChart() {
  const [selectedProduct, setSelectedProduct] = useState('milk');
  const product = CANONICAL_PRODUCTS.find(p => p.id === selectedProduct)!;
  const data = generateHistoricalData(selectedProduct);

  const popularProducts = ['milk', 'bread', 'eggs', 'sunflower-oil', 'chicken', 'kashkaval'];

  return (
    <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{product.icon}</span>
          <div>
            <h3 className="font-display text-lg font-semibold">{product.nameBg}</h3>
            <p className="text-sm text-muted-foreground">8 Week Price Trend</p>
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="week" 
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
              formatter={(value: number) => [`${value.toFixed(2)} лв.`, '']}
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
            />
            <Line 
              type="monotone" 
              dataKey="kaufland" 
              stroke="hsl(var(--kaufland))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--kaufland))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
              name="Kaufland"
            />
            <Line 
              type="monotone" 
              dataKey="lidl" 
              stroke="hsl(var(--lidl))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--lidl))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
              name="Lidl"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
