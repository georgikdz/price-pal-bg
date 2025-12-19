import { CANONICAL_PRODUCTS, CATEGORY_LABELS } from '@/data/products';
import { ProductCategory } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<ProductCategory, string> = {
  dairy: '🧀',
  oils: '🫒',
  grains: '🍞',
  produce: '🥬',
  proteins: '🍗',
  pantry: '🥫',
  snacks: '🍪',
  beverages: '🥤',
};

export function CategoryBreakdown() {
  const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[];
  
  return (
    <div className="rounded-2xl bg-card p-6 shadow-md border border-border/50">
      <h3 className="font-display text-lg font-semibold mb-4">Продукти по категории</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(category => {
          const count = CANONICAL_PRODUCTS.filter(p => p.category === category).length;
          
          return (
            <div
              key={category}
              className="flex flex-col items-center p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {CATEGORY_ICONS[category]}
              </span>
              <p className="text-sm font-medium text-center">{CATEGORY_LABELS[category]}</p>
              <p className="text-xs text-muted-foreground">{count} артикула</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
