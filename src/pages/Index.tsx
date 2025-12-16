import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BestDealsCard } from '@/components/dashboard/BestDealsCard';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { PriceComparisonMini } from '@/components/dashboard/PriceComparisonMini';
import { TrendingDown, Package, Store, Percent } from 'lucide-react';

export default function Index() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="text-center py-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            <span className="text-gradient">ЦениБГ</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Compare grocery prices across Billa, Kaufland, and Lidl. 
            Track trends, find the best deals, save money.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Products Tracked"
            value="30"
            subtitle="Essential items"
            icon={<Package className="h-6 w-6" />}
          />
          <StatsCard
            title="Stores Compared"
            value="3"
            subtitle="Billa • Kaufland • Lidl"
            icon={<Store className="h-6 w-6" />}
          />
          <StatsCard
            title="Avg. Savings"
            value="15%"
            subtitle="By choosing wisely"
            icon={<Percent className="h-6 w-6" />}
            trend={{ value: 2.3, isPositive: true }}
          />
          <StatsCard
            title="Price Drops"
            value="12"
            subtitle="This week"
            icon={<TrendingDown className="h-6 w-6" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CategoryBreakdown />
            
            {/* Quick Compare */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Quick Compare</h3>
              <div className="grid sm:grid-cols-2 gap-4 stagger-children">
                <PriceComparisonMini productId="milk" />
                <PriceComparisonMini productId="bread" />
                <PriceComparisonMini productId="eggs" />
                <PriceComparisonMini productId="sunflower-oil" />
              </div>
            </div>
          </div>
          
          <div>
            <BestDealsCard />
          </div>
        </div>
      </div>
    </Layout>
  );
}
