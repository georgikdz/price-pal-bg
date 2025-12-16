import { useState } from 'react';
import { Search, Link2, Unlink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';
import { Store } from '@/types';
import { cn } from '@/lib/utils';

interface ExtractedProduct {
  id: string;
  name: string;
  store: Store;
  price: number;
  mappedTo?: string;
}

const MOCK_EXTRACTED: ExtractedProduct[] = [
  { id: 'e1', name: 'Краве сирене Olimpus 400g', store: 'billa', price: 5.99, mappedTo: 'sirene' },
  { id: 'e2', name: 'Кашкавал Vitosha 400g', store: 'billa', price: 7.49, mappedTo: 'kashkaval' },
  { id: 'e3', name: 'Прясно мляко Верея 3.6% 1L', store: 'kaufland', price: 2.39, mappedTo: 'milk' },
  { id: 'e4', name: 'Пилешки бутчета охладени', store: 'lidl', price: 8.99 },
  { id: 'e5', name: 'Слънчогледово олио Благо 1L', store: 'kaufland', price: 3.49, mappedTo: 'sunflower-oil' },
  { id: 'e6', name: 'Бисквити Закуска 330g', store: 'lidl', price: 2.29 },
];

export function ProductMapping() {
  const [search, setSearch] = useState('');
  const [extracted, setExtracted] = useState(MOCK_EXTRACTED);
  const [selectedExtracted, setSelectedExtracted] = useState<string | null>(null);

  const unmapped = extracted.filter(e => !e.mappedTo);
  const mapped = extracted.filter(e => e.mappedTo);

  const filteredCanonical = CANONICAL_PRODUCTS.filter(p =>
    p.nameBg.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMap = (extractedId: string, canonicalId: string) => {
    setExtracted(prev => prev.map(e =>
      e.id === extractedId ? { ...e, mappedTo: canonicalId } : e
    ));
    setSelectedExtracted(null);
  };

  const handleUnmap = (extractedId: string) => {
    setExtracted(prev => prev.map(e =>
      e.id === extractedId ? { ...e, mappedTo: undefined } : e
    ));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Unmapped Products */}
      <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Unmapped Products</h3>
          <Badge variant="warning">{unmapped.length} pending</Badge>
        </div>

        <div className="space-y-2">
          {unmapped.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              All products are mapped! 🎉
            </p>
          ) : (
            unmapped.map(product => (
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.price.toFixed(2)} лв.</p>
                  </div>
                  <Badge variant={product.store}>{STORE_INFO[product.store].name}</Badge>
                </div>
              </div>
            ))
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

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
                >
                  <Link2 className="h-4 w-4 mr-1" />
                  Map
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mapped Products */}
      <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-md border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Mapped Products</h3>
          <Badge variant="success">{mapped.length} mapped</Badge>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mapped.map(product => {
            const canonical = CANONICAL_PRODUCTS.find(c => c.id === product.mappedTo)!;
            return (
              <div
                key={product.id}
                className="p-4 rounded-xl bg-secondary/30 border border-success/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{canonical.icon}</span>
                    <Badge variant={product.store} className="text-xs">
                      {STORE_INFO[product.store].name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnmap(product.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  → {canonical.nameBg}
                </p>
                <p className="text-sm font-bold text-primary mt-2">
                  {product.price.toFixed(2)} лв.
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
