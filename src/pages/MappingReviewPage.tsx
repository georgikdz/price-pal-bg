import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Search, Link2, Unlink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';
import { useExtractedProducts, useUpdateProductMapping } from '@/hooks/useExtractedProducts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MappingReviewPage() {
  const [search, setSearch] = useState('');
  const [selectedExtracted, setSelectedExtracted] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const { data: products, isLoading } = useExtractedProducts({ lowConfidenceOnly: !showAll });
  const updateMapping = useUpdateProductMapping();

  const unmapped = products?.filter(p => !p.mapped_product_id) || [];
  const lowConfidence = products?.filter(p => p.mapped_product_id && (p.confidence_score || 0) < 0.8) || [];
  const mapped = products?.filter(p => p.mapped_product_id && (p.confidence_score || 0) >= 0.8) || [];

  const filteredCanonical = CANONICAL_PRODUCTS.filter(p =>
    p.nameBg.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMap = async (extractedId: string, canonicalId: string) => {
    try {
      await updateMapping.mutateAsync({
        extractedProductId: extractedId,
        mappedProductId: canonicalId,
        confidenceScore: 1.0, // Manual mapping = 100% confidence
      });
      toast.success('Product mapped successfully');
      setSelectedExtracted(null);
    } catch (error) {
      toast.error('Failed to map product');
    }
  };

  const handleUnmap = async (extractedId: string) => {
    try {
      await updateMapping.mutateAsync({
        extractedProductId: extractedId,
        mappedProductId: null,
        confidenceScore: 0,
      });
      toast.success('Product unmapped');
    } catch (error) {
      toast.error('Failed to unmap product');
    }
  };

  const getConfidenceBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">Unknown</Badge>;
    if (score >= 0.8) return <Badge variant="success">{Math.round(score * 100)}%</Badge>;
    if (score >= 0.5) return <Badge variant="warning">{Math.round(score * 100)}%</Badge>;
    return <Badge variant="destructive">{Math.round(score * 100)}%</Badge>;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Product Mapping Review</h1>
            <p className="text-muted-foreground">
              Review and correct AI product mappings for accuracy.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Needs Review' : 'Show All'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-card p-4 border border-border/50">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Unmapped</span>
            </div>
            <p className="text-2xl font-bold">{unmapped.length}</p>
          </div>
          <div className="rounded-xl bg-card p-4 border border-border/50">
            <div className="flex items-center gap-2 text-warning mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Low Confidence</span>
            </div>
            <p className="text-2xl font-bold">{lowConfidence.length}</p>
          </div>
          <div className="rounded-xl bg-card p-4 border border-border/50">
            <div className="flex items-center gap-2 text-primary mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Mapped</span>
            </div>
            <p className="text-2xl font-bold">{mapped.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Products Needing Review */}
          <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Needs Review</h3>
              <Badge variant="warning">{unmapped.length + lowConfidence.length} items</Badge>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {unmapped.length === 0 && lowConfidence.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  All products are properly mapped! 🎉
                </p>
              ) : (
                [...unmapped, ...lowConfidence].map(product => {
                  const storeInfo = STORE_INFO[product.store as keyof typeof STORE_INFO];
                  const canonical = product.mapped_product_id 
                    ? CANONICAL_PRODUCTS.find(c => c.id === product.mapped_product_id)
                    : null;
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedExtracted(product.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        selectedExtracted === product.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-secondary/30 hover:bg-secondary/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.raw_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {product.raw_price?.toFixed(2) || '?'} лв.
                            </p>
                            {canonical && (
                              <span className="text-xs text-muted-foreground">
                                → {canonical.icon} {canonical.nameBg}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {storeInfo && (
                            <Badge variant={product.store as any}>{storeInfo.name}</Badge>
                          )}
                          {getConfidenceBadge(product.confidence_score)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Canonical Products */}
          <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
            <h3 className="font-display text-lg font-semibold mb-4">Map to Product</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[440px] overflow-y-auto">
              {filteredCanonical.map(product => (
                <div
                  key={product.id}
                  className={cn(
                    "p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center justify-between",
                    !selectedExtracted && "opacity-50 pointer-events-none"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{product.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{product.nameBg}</p>
                      <p className="text-xs text-muted-foreground">{product.name}</p>
                    </div>
                  </div>
                  {selectedExtracted && (
                    <Button
                      size="sm"
                      onClick={() => handleMap(selectedExtracted, product.id)}
                      disabled={updateMapping.isPending}
                    >
                      <Link2 className="h-4 w-4 mr-1" />
                      Map
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recently Mapped (High Confidence) */}
        {showAll && mapped.length > 0 && (
          <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Mapped Products</h3>
              <Badge variant="success">{mapped.length} mapped</Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mapped.slice(0, 12).map(product => {
                const canonical = CANONICAL_PRODUCTS.find(c => c.id === product.mapped_product_id);
                const storeInfo = STORE_INFO[product.store as keyof typeof STORE_INFO];
                
                if (!canonical) return null;
                
                return (
                  <div
                    key={product.id}
                    className="p-4 rounded-xl bg-secondary/30 border border-primary/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{canonical.icon}</span>
                        {storeInfo && (
                          <Badge variant={product.store as any} className="text-xs">
                            {storeInfo.name}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnmap(product.id)}
                        disabled={updateMapping.isPending}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium truncate">{product.raw_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      → {canonical.nameBg}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold text-primary">
                        {product.raw_price?.toFixed(2) || '?'} лв.
                      </p>
                      {getConfidenceBadge(product.confidence_score)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
