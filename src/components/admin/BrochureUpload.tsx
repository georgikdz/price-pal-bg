import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store } from '@/types';
import { STORE_INFO } from '@/data/products';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  store: Store;
  fileName: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'failed';
  productsFound?: number;
}

export function BrochureUpload() {
  const [selectedStore, setSelectedStore] = useState<Store>('billa');
  const [uploads, setUploads] = useState<UploadedFile[]>([
    {
      id: '1',
      store: 'billa',
      fileName: 'billa_week49_2024.pdf',
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'completed',
      productsFound: 45,
    },
    {
      id: '2',
      store: 'lidl',
      fileName: 'lidl_promo_dec.pdf',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'completed',
      productsFound: 38,
    },
    {
      id: '3',
      store: 'kaufland',
      fileName: 'kaufland_weekly.pdf',
      uploadedAt: new Date(),
      status: 'processing',
    },
  ]);
  const { toast } = useToast();

  const stores: Store[] = ['billa', 'kaufland', 'lidl'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    const newUpload: UploadedFile = {
      id: Date.now().toString(),
      store: selectedStore,
      fileName: file.name,
      uploadedAt: new Date(),
      status: 'processing',
    };

    setUploads(prev => [newUpload, ...prev]);

    toast({
      title: 'Upload started',
      description: `Processing ${file.name} for ${STORE_INFO[selectedStore].name}`,
    });

    // Simulate processing
    setTimeout(() => {
      setUploads(prev => prev.map(u => 
        u.id === newUpload.id 
          ? { ...u, status: 'completed', productsFound: Math.floor(Math.random() * 30) + 20 }
          : u
      ));
      toast({
        title: 'Processing complete',
        description: 'Products have been extracted and matched',
      });
    }, 3000);

    e.target.value = '';
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-warning animate-pulse" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
        <h3 className="font-display text-lg font-semibold mb-4">Upload Brochure</h3>
        
        {/* Store Selection */}
        <div className="flex gap-2 mb-6">
          {stores.map(store => (
            <Button
              key={store}
              variant={selectedStore === store ? 'default' : 'outline'}
              onClick={() => setSelectedStore(store)}
              className={cn(
                selectedStore === store && `bg-store-${store} hover:bg-store-${store}/90`
              )}
            >
              {STORE_INFO[store].name}
            </Button>
          ))}
        </div>

        {/* Upload Area */}
        <label className="block">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer group">
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="font-medium mb-1">Drop PDF here or click to upload</p>
            <p className="text-sm text-muted-foreground">
              Upload the weekly brochure for {STORE_INFO[selectedStore].name}
            </p>
          </div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Recent Uploads */}
      <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
        <h3 className="font-display text-lg font-semibold mb-4">Recent Uploads</h3>
        
        <div className="space-y-3">
          {uploads.map(upload => (
            <div
              key={upload.id}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  `bg-store-${upload.store}/10`
                )}>
                  <FileText className={cn("h-5 w-5", `store-${upload.store}`)} />
                </div>
                <div>
                  <p className="font-medium text-sm">{upload.fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={upload.store} className="text-xs">
                      {STORE_INFO[upload.store].name}
                    </Badge>
                    <span>•</span>
                    <span>{upload.uploadedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {upload.productsFound && (
                  <span className="text-sm text-muted-foreground">
                    {upload.productsFound} products
                  </span>
                )}
                {getStatusIcon(upload.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
