import { Layout } from '@/components/layout/Layout';
import { BrochureUpload } from '@/components/admin/BrochureUpload';
import { RecentUploadsCard } from '@/components/dashboard/RecentUploadsCard';

export default function AdminPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold mb-2">Upload Brochures</h1>
          <p className="text-muted-foreground">
            Upload store brochures for extraction and pricing updates.
          </p>
        </header>

        <section className="grid lg:grid-cols-3 gap-6">
          <main className="lg:col-span-2">
            <BrochureUpload />
          </main>
          <aside>
            <RecentUploadsCard />
          </aside>
        </section>
      </div>
    </Layout>
  );
}
