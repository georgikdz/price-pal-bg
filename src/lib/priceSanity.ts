// Centralized client-side sanity checks to prevent displaying obviously wrong OCR/AI prices.
// Kept intentionally small: backend should be the main validator.

export const ABSOLUTE_MIN_PRICE = 0.30;

// Realistic minimum prices in BGN for Bulgarian grocery products
// These are sanity checks - any price below these is almost certainly OCR/AI error
export const MIN_PRICES_BY_PRODUCT: Record<string, number> = {
  // Bakery & Grains
  bread: 0.80,
  flour: 0.60,
  rice: 1.00,
  pasta: 0.80,
  banitsa: 1.50,
  pita: 0.60,
  
  // Dairy
  milk: 1.50,
  yogurt: 0.50,
  butter: 4.00,
  eggs: 3.00,
  sirene: 5.00,
  kashkaval: 6.00,
  'cream-cheese': 2.00,
  'sour-cream': 1.50,
  
  // Meat & Fish
  chicken: 5.00,
  'chicken-breast': 8.00,
  pork: 7.00,
  'pork-chops': 8.00,
  beef: 12.00,
  'minced-meat': 6.00,
  fish: 6.00,
  salmon: 15.00,
  tuna: 3.00,
  mackerel: 4.00,
  sausages: 3.00,
  ham: 6.00,
  lukanka: 8.00,
  kebapche: 0.80,
  kyufte: 0.80,
  
  // Fruits & Vegetables
  apples: 1.50,
  bananas: 1.50,
  oranges: 1.50,
  lemons: 2.00,
  grapes: 2.50,
  tomatoes: 1.50,
  cucumbers: 1.00,
  peppers: 2.00,
  potatoes: 0.80,
  onions: 0.80,
  carrots: 0.80,
  cabbage: 0.60,
  lettuce: 1.00,
  'sweet-potatoes': 2.00,
  
  // Oils & Condiments
  'sunflower-oil': 3.00,
  'olive-oil': 8.00,
  sugar: 1.50,
  honey: 6.00,
  'tomato-paste': 1.00,
  pickles: 2.00,
  
  // Canned Goods
  'canned-beans': 1.00,
  'canned-corn': 1.50,
  
  // Beverages
  water: 0.40,
  juice: 1.50,
  cola: 1.50,
  beer: 1.00,
  wine: 5.00,
  coffee: 4.00,
  tea: 1.50,
  
  // Snacks
  chocolate: 1.50,
  biscuits: 1.00,
  chips: 1.50,
  wafers: 1.00,
  nuts: 4.00,
};

type PriceLike = {
  product_id: string;
  price: number;
  promo_price: number | null;
  is_promo: boolean;
};

export function getEffectivePrice(p: PriceLike): number {
  const value = p.is_promo && p.promo_price != null ? p.promo_price : p.price;
  return Number.isFinite(value) ? value : NaN;
}

export function isSuspiciousPrice(productId: string, effectivePrice: number): boolean {
  if (!Number.isFinite(effectivePrice)) return true;

  const min = MIN_PRICES_BY_PRODUCT[productId] ?? ABSOLUTE_MIN_PRICE;
  return effectivePrice < ABSOLUTE_MIN_PRICE || effectivePrice < min;
}
