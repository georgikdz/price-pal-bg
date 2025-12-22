import { Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CANONICAL_PRODUCTS } from '@/data/products';
import { ShoppingListItem } from '@/hooks/useShoppingList';

interface ShoppingListItemsProps {
  items: ShoppingListItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function ShoppingListItems({ items, onUpdateQuantity, onRemove }: ShoppingListItemsProps) {
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

        return (
          <div
            key={item.productId}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
          >
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
        );
      })}
    </div>
  );
}
