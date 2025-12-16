import { Layout } from '@/components/layout/Layout';
import { ComparisonTable } from '@/components/compare/ComparisonTable';

export default function ComparePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Price Comparison</h1>
          <p className="text-muted-foreground">
            Compare prices across all stores. Click headers to sort.
          </p>
        </div>
        
        <ComparisonTable />
      </div>
    </Layout>
  );
}
