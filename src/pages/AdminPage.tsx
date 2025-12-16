import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BrochureUpload } from '@/components/admin/BrochureUpload';
import { ProductMapping } from '@/components/admin/ProductMapping';
import { Button } from '@/components/ui/button';
import { Upload, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'upload' | 'mapping';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  const tabs: { id: Tab; label: string; icon: typeof Upload }[] = [
    { id: 'upload', label: 'Upload Brochures', icon: Upload },
    { id: 'mapping', label: 'Product Mapping', icon: Link2 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Upload brochures and manage product mappings.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(id)}
              className={cn(
                "gap-2",
                activeTab === id && "shadow-md"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'upload' && <BrochureUpload />}
        {activeTab === 'mapping' && <ProductMapping />}
      </div>
    </Layout>
  );
}
