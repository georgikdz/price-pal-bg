import { Layout } from '@/components/layout/Layout';
import { ComparisonTable } from '@/components/compare/ComparisonTable';

export default function ComparePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Сравнение на цени</h1>
          <p className="text-muted-foreground">
            Сравнете цените във всички магазини. Кликнете върху заглавията за сортиране.
          </p>
        </div>
        
        <ComparisonTable />
      </div>
    </Layout>
  );
}
