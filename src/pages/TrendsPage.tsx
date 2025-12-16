import { Layout } from '@/components/layout/Layout';
import { PriceTrendChart } from '@/components/trends/PriceTrendChart';
import { InflationOverview } from '@/components/trends/InflationOverview';

export default function TrendsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Price Trends</h1>
          <p className="text-muted-foreground">
            Track how prices change over time across stores.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <PriceTrendChart />
          <InflationOverview />
        </div>
      </div>
    </Layout>
  );
}
