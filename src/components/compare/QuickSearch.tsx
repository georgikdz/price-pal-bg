import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CANONICAL_PRODUCTS } from '@/data/products';
import { cn } from '@/lib/utils';

interface QuickSearchProps {
  selectedProducts: string[];
  onProductToggle: (productId: string) => void;
}

export interface QuickSearchRef {
  focus: () => void;
}

export const QuickSearch = forwardRef<QuickSearchRef, QuickSearchProps>(
  function QuickSearch({ selectedProducts, onProductToggle }, ref) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        setIsOpen(true);
      },
    }));

    // Filter products based on query
    const filteredProducts = query.trim()
      ? CANONICAL_PRODUCTS.filter(
          (p) =>
            p.nameBg.toLowerCase().includes(query.toLowerCase()) ||
            p.name.toLowerCase().includes(query.toLowerCase())
        )
      : CANONICAL_PRODUCTS;

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div ref={containerRef} className="relative">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Търси продукти за сравнение..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Selected Products Tags */}
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedProducts.map((productId) => {
              const product = CANONICAL_PRODUCTS.find((p) => p.id === productId);
              if (!product) return null;
              return (
                <button
                  key={productId}
                  onClick={() => onProductToggle(productId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                >
                  <span>{product.icon}</span>
                  <span>{product.nameBg}</span>
                  <X className="h-3 w-3" />
                </button>
              );
            })}
            <button
              onClick={() => selectedProducts.forEach(onProductToggle)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Изчисти всички
            </button>
          </div>
        )}

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Няма намерени продукти
              </div>
            ) : (
              <div className="p-2">
                {filteredProducts.slice(0, 20).map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => {
                        onProductToggle(product.id);
                        setQuery('');
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-secondary/50"
                      )}
                    >
                      <span className="text-xl">{product.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{product.nameBg}</p>
                        <p className="text-xs text-muted-foreground">{product.name}</p>
                      </div>
                      {isSelected && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          Избран
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
