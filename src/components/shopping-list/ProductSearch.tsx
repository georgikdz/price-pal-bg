import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CANONICAL_PRODUCTS, CATEGORY_LABELS } from '@/data/products';
import { cn } from '@/lib/utils';

interface ProductSearchProps {
  onAddProduct: (productId: string) => void;
  addedProductIds: string[];
}

export function ProductSearch({ onAddProduct, addedProductIds }: ProductSearchProps) {
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    
    const query = search.toLowerCase();
    return CANONICAL_PRODUCTS.filter(p => 
      p.nameBg.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [search]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, typeof CANONICAL_PRODUCTS> = {};
    
    filteredProducts.forEach(product => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
    });

    return groups;
  }, [filteredProducts]);

  const handleAdd = (productId: string) => {
    onAddProduct(productId);
    setSearch('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Търси продукт за добавяне..."
          className="pl-10"
        />
      </div>

      {filteredProducts.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {Object.entries(groupedProducts).map(([category, products]) => (
            <div key={category}>
              <div className="px-3 py-1.5 bg-secondary/50 text-xs font-medium text-muted-foreground">
                {CATEGORY_LABELS[category] || category}
              </div>
              {products.map(product => {
                const isAdded = addedProductIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => !isAdded && handleAdd(product.id)}
                    disabled={isAdded}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary/50 transition-colors",
                      isAdded && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{product.icon}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium">{product.nameBg}</p>
                        <p className="text-xs text-muted-foreground">per {product.unit}</p>
                      </div>
                    </div>
                    {isAdded ? (
                      <span className="text-xs text-muted-foreground">Добавено</span>
                    ) : (
                      <Plus className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
