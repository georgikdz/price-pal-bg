import { Trash2, Minus, Plus } from 'lucide-react';
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
}

export function ShoppingListItems({ items, onUpdateQuantity, onRemove, getItemPrice }: ShoppingListItemsProps) {
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
    <div className="space-y-3">
      {items.map(item => {
        const product = CANONICAL_PRODUCTS.find(p => p.id === item.productId);
        if (!product) return null;

        // Get prices for each store
        const storePrices = getItemPrice 
          ? stores.map(store => ({
              store,
              price: getItemPrice(item.productId, store)
            }))
          : [];
        
        const validPrices = storePrices.filter(sp => sp.price !== undefined);
        const minPrice = validPrices.length > 0 
          ? Math.min(...validPrices.map(sp => sp.price!))
          : undefined;

        return (
          <div
            key={item.productId}
            className="p-3 bg-secondary/30 rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{product.icon}</span>
                <div>
                  <p className="font-medium text-sm">{product.nameBg}</p>
                  <p className="text-xs text-muted-foreground">{product.unit}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onRemove(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Show prices per store */}
            {getItemPrice && (
              <div className="flex gap-2 pt-1">
                {stores.map(store => {
                  const price = getItemPrice(item.productId, store);
                  const isCheapest = price !== undefined && price === minPrice;
                  const storeInfo = STORE_INFO[store];
                  
                  return (
                    <div 
                      key={store}
                      className={cn(
                        "flex-1 text-center py-1 px-2 rounded text-xs",
                        price !== undefined
                          ? isCheapest 
                            ? "bg-primary/10 text-primary font-medium"
                            : "bg-muted text-muted-foreground"
                          : "bg-muted/50 text-muted-foreground/50"
                      )}
                    >
                      <span className="block text-[10px] opacity-70">{storeInfo.name}</span>
                      {price !== undefined ? (
                        <span>{(price * item.quantity).toFixed(2)} лв</span>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
