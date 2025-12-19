import { Layout } from '@/components/layout/Layout';
import { BrochureUpload } from '@/components/admin/BrochureUpload';
import { RecentUploadsCard } from '@/components/dashboard/RecentUploadsCard';
import { PriceEditor } from '@/components/admin/PriceEditor';
import { CsvPriceImport } from '@/components/admin/CsvPriceImport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Pencil, FileSpreadsheet } from 'lucide-react';

export default function AdminPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Upload brochures, import CSV, and manage extracted prices.
          </p>
        </header>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload PDF
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Import CSV
            </TabsTrigger>
            <TabsTrigger value="prices" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Prices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <section className="grid lg:grid-cols-3 gap-6">
              <main className="lg:col-span-2">
                <BrochureUpload />
              </main>
              <aside>
                <RecentUploadsCard />
              </aside>
            </section>
          </TabsContent>

          <TabsContent value="import">
            <CsvPriceImport />
          </TabsContent>

          <TabsContent value="prices">
            <PriceEditor />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
