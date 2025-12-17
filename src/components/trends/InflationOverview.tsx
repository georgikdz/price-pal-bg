import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCategoryPriceChanges } from '@/hooks/usePrices';
import { Skeleton } from '@/components/ui/skeleton';

export function InflationOverview() {
  const { data: inflationData, isLoading } = useCategoryPriceChanges();

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
        <div className="mb-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const hasData = inflationData && inflationData.some(d => d.change !== 0);

  return (
    <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold">Price Changes by Category</h3>
        <p className="text-sm text-muted-foreground">
          {hasData ? 'Based on historical price data' : 'Upload more brochures to see trends'}
        </p>
      </div>

      {!hasData ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <p>Not enough historical data to show price changes yet.</p>
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={inflationData} 
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
                radius={[0, 4, 4, 0]}
              >
                {inflationData?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.change >= 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
