// ============================================================
// SINGLE SOURCE OF TRUTH for price validation thresholds (CLIENT MIRROR)
// This MUST stay in sync with supabase/functions/_shared/price-validation.ts
// ============================================================

// Universal absolute minimum - NO food product in Bulgaria costs less than this
export const ABSOLUTE_MIN_PRICE = 0.30;

// Category-based fallbacks for unknown products
export const CATEGORY_MIN_PRICES: Record<string, number> = {
  dairy: 0.50,
  meat: 5.00,
  fish: 3.00,
  bakery: 0.60,
  produce: 0.50,
  pantry: 0.40,
  beverages: 0.40,
  snacks: 0.80,
  oils: 2.00,
};

// Default fallback for completely unknown products
export const DEFAULT_MIN_PRICE = 0.50;

// Specific minimum prices for known products (BGN)
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
  garlic: 4.00,
  watermelon: 0.50,

  // Oils & Condiments
  'sunflower-oil': 3.00,
  'olive-oil': 8.00,
  sugar: 1.50,
  salt: 0.40,
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

// Maps product IDs to their category for fallback pricing
export const PRODUCT_CATEGORIES: Record<string, string> = {
  // Dairy
  milk: 'dairy', yogurt: 'dairy', butter: 'dairy', eggs: 'dairy',
  sirene: 'dairy', kashkaval: 'dairy', 'cream-cheese': 'dairy', 'sour-cream': 'dairy',
  // Meat
  chicken: 'meat', 'chicken-breast': 'meat', pork: 'meat', 'pork-chops': 'meat',
  beef: 'meat', 'minced-meat': 'meat', sausages: 'meat', ham: 'meat',
  lukanka: 'meat', kebapche: 'meat', kyufte: 'meat',
  // Fish
  fish: 'fish', salmon: 'fish', tuna: 'fish', mackerel: 'fish',
  // Bakery
  bread: 'bakery', flour: 'bakery', rice: 'bakery', pasta: 'bakery',
  banitsa: 'bakery', pita: 'bakery',
  // Produce
  apples: 'produce', bananas: 'produce', oranges: 'produce', lemons: 'produce',
  grapes: 'produce', tomatoes: 'produce', cucumbers: 'produce', peppers: 'produce',
  potatoes: 'produce', onions: 'produce', carrots: 'produce', cabbage: 'produce',
  lettuce: 'produce', 'sweet-potatoes': 'produce', garlic: 'produce', watermelon: 'produce',
  // Oils
  'sunflower-oil': 'oils', 'olive-oil': 'oils',
  // Pantry
  sugar: 'pantry', salt: 'pantry', honey: 'pantry', 'tomato-paste': 'pantry',
  pickles: 'pantry', 'canned-beans': 'pantry', 'canned-corn': 'pantry',
  // Beverages
  water: 'beverages', juice: 'beverages', cola: 'beverages', beer: 'beverages',
  wine: 'beverages', coffee: 'beverages', tea: 'beverages',
  // Snacks
  chocolate: 'snacks', biscuits: 'snacks', chips: 'snacks', wafers: 'snacks', nuts: 'snacks',
};

/**
 * Get the minimum acceptable price for a product.
 * Uses specific product price if known, otherwise falls back to category, then default.
 */
export function getMinPriceForProduct(productId: string | null): number {
  if (!productId) return DEFAULT_MIN_PRICE;
  
  // First check specific product minimum
  if (MIN_PRICES_BY_PRODUCT[productId] !== undefined) {
    return MIN_PRICES_BY_PRODUCT[productId];
  }
  
  // Fallback to category minimum
  const category = PRODUCT_CATEGORIES[productId];
  if (category && CATEGORY_MIN_PRICES[category] !== undefined) {
    return CATEGORY_MIN_PRICES[category];
  }
  
  // Final fallback
  return DEFAULT_MIN_PRICE;
}

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

/**
 * Universal price validation - works for any product, known or unknown.
 */
export function isSuspiciousPrice(productId: string, effectivePrice: number): boolean {
  if (!Number.isFinite(effectivePrice)) return true;
  
  // Always reject prices below absolute minimum
  if (effectivePrice < ABSOLUTE_MIN_PRICE) return true;
  
  // Check against product-specific or category minimum
  const minPrice = getMinPriceForProduct(productId);
  return effectivePrice < minPrice;
}
