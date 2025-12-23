import { Trash2, Minus, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';
import { ShoppingListItem } from '@/hooks/useShoppingList';
import { Store } from '@/types';
import { cn } from '@/lib/utils';

interface ShoppingListItemsProps {
  items: ShoppingListItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  getItemPrice?: (productId: string, store: Store) => number | undefined;
  selectedProductId?: string | null;
  onSelectProduct?: (productId: string) => void;
}

export function ShoppingListItems({
  items,
  onUpdateQuantity,
  onRemove,
  getItemPrice,
  selectedProductId,
  onSelectProduct,
}: ShoppingListItemsProps) {
  const stores: Store[] = ['billa', 'kaufland', 'lidl'];

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-3">🛒</div>
        <p className="font-medium">Списъкът е празен</p>
        <p className="text-sm">Търси продукти горе, за да ги добавиш</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(item => {
        const product = CANONICAL_PRODUCTS.find(p => p.id === item.productId);
        if (!product) return null;

        const isSelected = selectedProductId === item.productId;

        // Find cheapest store for this product
        const storePrices = getItemPrice
          ? stores.map(store => ({
              store,
              price: getItemPrice(item.productId, store),
            }))
          : [];

        const validPrices = storePrices.filter(sp => sp.price !== undefined && Number.isFinite(sp.price));
        const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map(sp => sp.price!)) : undefined;
        const cheapestStore = validPrices.find(sp => sp.price === minPrice)?.store;
        const cheapestTotal = minPrice !== undefined ? minPrice * item.quantity : undefined;

        return (
          <div
            key={item.productId}
            role={onSelectProduct ? 'button' : undefined}
            tabIndex={onSelectProduct ? 0 : undefined}
            onClick={() => onSelectProduct?.(item.productId)}
            onKeyDown={(e) => {
              if (!onSelectProduct) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectProduct(item.productId);
              }
            }}
            className={cn(
              "group relative p-3 rounded-xl transition-all duration-200",
              "border bg-card",
              onSelectProduct && "cursor-pointer",
              isSelected 
                ? "border-primary/50 bg-primary/5 shadow-sm" 
                : "border-border/40 hover:border-border hover:bg-accent/30"
            )}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute -left-px top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
            )}

            <div className="flex items-center gap-3">
              {/* Product icon */}
              <div className={cn(
                "text-2xl transition-transform duration-200",
                isSelected && "scale-110"
              )}>
                {product.icon}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm truncate transition-colors",
                  isSelected && "text-primary"
                )}>
                  {product.nameBg}
                </p>
                
                {/* Cheapest store hint - only shown when not selected */}
                {cheapestStore && !isSelected && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-[10px]">{STORE_INFO[cheapestStore].logo}</span>
                    <span className="text-primary font-medium">
                      {cheapestTotal?.toFixed(2)} лв
                    </span>
                  </p>
                )}
                
                {isSelected && (
                  <p className="text-xs text-primary/70 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Виж сравнение →
                  </p>
                )}
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1">
                <div className="flex items-center bg-secondary/50 rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-l-lg rounded-r-none hover:bg-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateQuantity(item.productId, item.quantity - 1);
                    }}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-r-lg rounded-l-none hover:bg-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateQuantity(item.productId, item.quantity + 1);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.productId);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
