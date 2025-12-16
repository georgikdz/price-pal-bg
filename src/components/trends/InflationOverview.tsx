import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_LABELS } from '@/data/products';
import { ProductCategory } from '@/types';

const mockInflationData = Object.keys(CATEGORY_LABELS).map(category => ({
  category: CATEGORY_LABELS[category as ProductCategory],
  change: Math.round((Math.random() - 0.3) * 20 * 10) / 10,
}));

export function InflationOverview() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold">Price Changes by Category</h3>
        <p className="text-sm text-muted-foreground">Month-over-month comparison</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={mockInflationData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis 
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category"
              dataKey="category"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={80}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                boxShadow: 'var(--shadow-lg)',
              }}
              formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}%`, 'Change']}
            />
            <Bar 
              dataKey="change" 
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
