// Centralized client-side sanity checks to prevent displaying obviously wrong OCR/AI prices.
// Kept intentionally small: backend should be the main validator.

export const ABSOLUTE_MIN_PRICE = 0.2;

export const MIN_PRICES_BY_PRODUCT: Record<string, number> = {
  bread: 0.7,
  flour: 0.6,
  rice: 1.0,
  pasta: 0.8,
  milk: 1.2,
  yogurt: 0.5,
  eggs: 2.0,
  butter: 3.0,
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
