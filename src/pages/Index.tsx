import { Layout } from '@/components/layout/Layout';
import { StatsCardsLive } from '@/components/dashboard/StatsCardLive';
import { BestDealsCardLive } from '@/components/dashboard/BestDealsCardLive';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { PriceComparisonMiniLive } from '@/components/dashboard/PriceComparisonMiniLive';

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
            Сравнявайте цените в Billa, Kaufland и Lidl.
            Следете тенденциите, намирайте най-добрите оферти, спестявайте пари.
          </p>
        </div>

        {/* Stats Grid - Now using live data */}
        <StatsCardsLive />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CategoryBreakdown />

            {/* Quick Compare - Now using live data */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Бързо сравнение</h3>
              <div className="grid sm:grid-cols-2 gap-4 stagger-children">
                <PriceComparisonMiniLive productId="milk" />
                <PriceComparisonMiniLive productId="bread" />
                <PriceComparisonMiniLive productId="eggs" />
                <PriceComparisonMiniLive productId="sunflower-oil" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <BestDealsCardLive />
          </div>
        </div>
      </div>
    </Layout>
  );
}
