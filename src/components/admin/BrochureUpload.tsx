import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Loader2, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store } from '@/types';
import { STORE_INFO } from '@/data/products';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { pdfToImages, estimateImagesSize, type PDFConversionProgress } from '@/lib/pdfToImages';
import { Progress } from '@/components/ui/progress';
import { pricesToCsv, downloadCsv } from '@/lib/csvUtils';
import { Price } from '@/hooks/usePrices';

interface UploadedFile {
  id: string;
  store: Store;
  fileName: string;
  filePath: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'failed';
  productsFound?: number;
}

export function BrochureUpload() {
  const [selectedStore, setSelectedStore] = useState<Store>('billa');
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [pdfProgress, setPdfProgress] = useState<PDFConversionProgress | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const stores: Store[] = ['billa', 'kaufland', 'lidl'];

  // Fetch existing uploads on mount
  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    const { data, error } = await supabase
      .from('brochure_uploads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching uploads:', error);
      return;
    }

    if (data) {
      setUploads(data.map(u => ({
        id: u.id,
        store: u.store as Store,
        fileName: u.file_name,
        filePath: u.file_path,
        uploadedAt: new Date(u.created_at),
        status: u.status as 'processing' | 'completed' | 'failed',
        productsFound: u.products_found || undefined,
      })));
    }
  };

  const handleRetry = async (upload: UploadedFile) => {
    setRetryingId(upload.id);

    try {
      // Update status to processing
      await supabase
        .from('brochure_uploads')
        .update({ status: 'processing', products_found: 0 })
        .eq('id', upload.id);

      // Update local state
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'processing' as const, productsFound: undefined } : u
      ));

      toast({
        title: 'Изтегляне на брошура',
        description: 'Подготовка за повторна обработка...',
      });

      // Download the stored PDF and convert to images
      const { data: signed, error: signError } = await supabase.storage
        .from('brochures')
        .createSignedUrl(upload.filePath, 60 * 5);

      if (signError || !signed?.signedUrl) {
        throw new Error('Неуспешен достъп до съхранената брошура');
      }

      // Fetch the PDF and convert to File object
      const pdfResponse = await fetch(signed.signedUrl);
      if (!pdfResponse.ok) {
        throw new Error('Неуспешно изтегляне на брошура');
      }
      const pdfBlob = await pdfResponse.blob();
      const pdfFile = new File([pdfBlob], upload.fileName, { type: 'application/pdf' });

      setPdfProgress({ currentPage: 0, totalPages: 0 });

      // Max 50 pages to match server limit
      const MAX_PAGES = 50;
      const images = await pdfToImages(pdfFile, MAX_PAGES, 1.5, 0.7, setPdfProgress);
      
      if (images.length === 0) {
        throw new Error('Неуспешно извличане на страници от PDF');
      }

      toast({
        title: 'Анализиране на брошура',
        description: `Извличане на продукти от ${images.length} страница(и)...`,
      });

      // Trigger PDF parsing with images
      const { error: fnError } = await supabase.functions.invoke('parse-brochure', {
        body: {
          brochureId: upload.id,
          store: upload.store,
          images: images.map(img => ({ dataUrl: img.dataUrl })),
        },
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'failed' as const } : u
        ));
        toast({
          title: 'Неуспешна обработка',
          description: 'Неуспешно извличане на продукти от брошурата',
          variant: 'destructive',
        });
      } else {
        setTimeout(fetchUploads, 2000);
        toast({
          title: 'Обработката завърши',
          description: 'Продуктите бяха извлечени и съпоставени',
        });
      }
    } catch (error) {
      console.error('Retry error:', error);
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'failed' as const } : u
      ));
      toast({
        title: 'Неуспешен повторен опит',
        description: error instanceof Error ? error.message : 'Неуспешна повторна обработка',
        variant: 'destructive',
      });
    } finally {
      setRetryingId(null);
      setPdfProgress(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Невалиден тип файл',
        description: 'Моля, качете PDF файл',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setPdfProgress({ currentPage: 0, totalPages: 0 });

    try {
      // Convert PDF pages to images client-side (max 50 pages to match server limit)
      const MAX_PAGES = 50;
      const images = await pdfToImages(file, MAX_PAGES, 1.5, 0.7, setPdfProgress);
      
      if (images.length === 0) {
        throw new Error('Неуспешно извличане на страници от PDF');
      }

      const totalSize = estimateImagesSize(images);
      console.log(`Converted ${images.length} pages, total size: ${Math.round(totalSize / 1024)}KB`);

      // Upload original file to storage (for reference/retry)
      const fileName = `${selectedStore}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('brochures')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create database record
      const { data: brochureRecord, error: dbError } = await supabase
        .from('brochure_uploads')
        .insert({
          store: selectedStore,
          file_name: file.name,
          file_path: fileName,
          status: 'processing',
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Add to local state immediately
      const newUpload: UploadedFile = {
        id: brochureRecord.id,
        store: selectedStore,
        fileName: file.name,
        filePath: fileName,
        uploadedAt: new Date(),
        status: 'processing',
      };
      setUploads(prev => [newUpload, ...prev]);

      toast({
        title: 'Анализиране на брошура',
        description: `Извличане на продукти от ${images.length} страница(и)...`,
      });

      // Trigger PDF parsing backend function with images
      const { error: fnError } = await supabase.functions.invoke('parse-brochure', {
        body: {
          brochureId: brochureRecord.id,
          store: selectedStore,
          images: images.map(img => ({ dataUrl: img.dataUrl })),
        },
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        // Update local state to show failure
        setUploads(prev => prev.map(u => 
          u.id === brochureRecord.id 
            ? { ...u, status: 'failed' as const }
            : u
        ));
        toast({
          title: 'Неуспешна обработка',
          description: 'Неуспешно извличане на продукти от брошурата',
          variant: 'destructive',
        });
      } else {
        // Refresh uploads to get the updated status
        setTimeout(fetchUploads, 2000);
        toast({
          title: 'Обработката завърши',
          description: 'Продуктите бяха извлечени и съпоставени',
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Неуспешно качване',
        description: error instanceof Error ? error.message : 'Неуспешно качване на файл',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setPdfProgress(null);
      e.target.value = '';
    }
  };

  const handleExportBrochure = async (upload: UploadedFile) => {
    try {
      // Fetch prices for this brochure
      const { data: prices, error } = await supabase
        .from('prices')
        .select('*')
        .eq('brochure_id', upload.id);

      if (error) throw error;

      if (!prices || prices.length === 0) {
        toast({
          title: 'Няма намерени цени',
          description: 'Няма извлечени цени от тази брошура.',
          variant: 'destructive',
        });
        return;
      }

      const csv = pricesToCsv(prices as Price[]);
      const filename = `${upload.store}_${upload.fileName.replace('.pdf', '')}_${upload.uploadedAt.toISOString().split('T')[0]}.csv`;
      downloadCsv(csv, filename);

      toast({
        title: 'Успешен експорт',
        description: `Експортирани ${prices.length} цени в ${filename}`,
      });
    } catch (error) {
      toast({
        title: 'Неуспешен експорт',
        description: error instanceof Error ? error.message : 'Неуспешен експорт на цени',
        variant: 'destructive',
      });
    }
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
        <h3 className="font-display text-lg font-semibold mb-4">Качване на брошура</h3>
        
        {/* Store Selection */}
        <div className="flex gap-2 mb-6">
          {stores.map(store => (
            <Button
              key={store}
              variant={selectedStore === store ? 'default' : 'outline'}
              onClick={() => setSelectedStore(store)}
              disabled={isUploading}
              className={cn(
                selectedStore === store && `bg-store-${store} hover:bg-store-${store}/90`
              )}
            >
              {STORE_INFO[store].name}
            </Button>
          ))}
        </div>

        {/* Upload Area */}
        <div className={cn("block", isUploading && "pointer-events-none opacity-50")}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer group"
            aria-label="Качване на PDF брошура"
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 mx-auto mb-4 text-primary animate-spin" />
            ) : (
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
            <p className="font-medium mb-1">
              {isUploading 
                ? pdfProgress && pdfProgress.totalPages > 0
                  ? `Конвертиране на страница ${pdfProgress.currentPage} от ${pdfProgress.totalPages}...`
                  : 'Обработка...'
                : 'Пуснете PDF тук или кликнете за качване'}
            </p>
            {isUploading && pdfProgress && pdfProgress.totalPages > 0 && (
              <div className="w-48 mx-auto mt-2">
                <Progress value={(pdfProgress.currentPage / pdfProgress.totalPages) * 100} className="h-2" />
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Качете седмичната брошура за {STORE_INFO[selectedStore].name}
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
              aria-label="Избор на PDF брошура"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Избор на PDF
            </Button>
          </div>

          {/* Note: do NOT use `display: none` for file inputs; some browsers won't open the picker. */}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileUpload}
            className="sr-only"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
        <h3 className="font-display text-lg font-semibold mb-4">Последни качвания</h3>
        
        {uploads.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Все още няма качени брошури. Качете първата си брошура по-горе.
          </p>
        ) : (
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
                    <FileText className={cn("h-5 w-5", `text-store-${upload.store}`)} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{upload.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={upload.store} className="text-xs">
                        {STORE_INFO[upload.store].name}
                      </Badge>
                      <span>•</span>
                      <span>{upload.uploadedAt.toLocaleDateString('bg-BG')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {upload.productsFound !== undefined && upload.status === 'completed' && (
                    <span className="text-sm text-muted-foreground">
                      {upload.productsFound} продукта
                    </span>
                  )}
                  {upload.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExportBrochure(upload)}
                      className="gap-1.5 text-xs h-7 px-2"
                    >
                      <Download className="h-3 w-3" />
                      CSV
                    </Button>
                  )}
                  {upload.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetry(upload)}
                      disabled={retryingId === upload.id}
                      className="gap-1.5 text-xs h-7 px-2"
                    >
                      {retryingId === upload.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      Повтори
                    </Button>
                  )}
                  {getStatusIcon(upload.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
