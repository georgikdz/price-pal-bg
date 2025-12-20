import { Layout } from '@/components/layout/Layout';
import { ComparisonTable } from '@/components/compare/ComparisonTable';
import { Helmet } from 'react-helmet-async';

export default function ComparePage() {
  return (
    <Layout>
      <Helmet>
        <title>Сравнение на цени | ЦениБГ - Най-добрите оферти в Billa, Kaufland, Lidl</title>
        <meta name="description" content="Сравнете цените на хранителни продукти в Billa, Kaufland и Lidl. Открийте най-добрите оферти и спестете пари." />
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Сравнение на цени</h1>
          <p className="text-muted-foreground">
            Сравнете цените и открийте най-добрите оферти.
          </p>
        </div>
        
        <ComparisonTable />
      </div>
    </Layout>
  );
}
