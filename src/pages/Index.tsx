import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StatsCardsLive } from '@/components/dashboard/StatsCardLive';
import { BestDealsCardLive } from '@/components/dashboard/BestDealsCardLive';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { PriceComparisonMiniLive } from '@/components/dashboard/PriceComparisonMiniLive';
import { Button } from '@/components/ui/button';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';

export default function Index() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);


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
          {isAdmin && (
            <Button asChild className="mt-4 gap-2">
              <Link to="/admin" aria-label="Upload brochures">
                <Upload className="h-4 w-4" />
                Upload Brochures
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Grid - Now using live data */}
        <StatsCardsLive />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CategoryBreakdown />

            {/* Quick Compare - Now using live data */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Quick Compare</h3>
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
