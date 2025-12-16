export type Store = 'billa' | 'kaufland' | 'lidl';

export type ProductCategory = 
  | 'dairy'
  | 'oils'
  | 'grains'
  | 'produce'
  | 'proteins'
  | 'pantry'
  | 'snacks'
  | 'beverages';

export interface CanonicalProduct {
  id: string;
  name: string;
  nameBg: string;
  category: ProductCategory;
  unit: 'kg' | 'L' | 'pcs' | '100g';
  icon: string;
}

export interface StorePrice {
  id: string;
  productId: string;
  store: Store;
  price: number;
  pricePerUnit: number;
  packageSize: string;
  brand: string;
  isPromo: boolean;
  validFrom: Date;
  validTo: Date;
  createdAt: Date;
}

export interface PriceComparison {
  product: CanonicalProduct;
  prices: {
    billa?: StorePrice;
    kaufland?: StorePrice;
    lidl?: StorePrice;
  };
  bestPrice?: {
    store: Store;
    savings: number;
    savingsPercent: number;
  };
}

export interface BrochureUpload {
  id: string;
  store: Store;
  uploadedAt: Date;
  validFrom: Date;
  validTo: Date;
  fileName: string;
  productsExtracted: number;
  status: 'processing' | 'completed' | 'failed';
}

export interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  totalProducts: number;
  avgSavings: number;
  bestDeals: PriceComparison[];
  priceChanges: {
    increased: number;
    decreased: number;
    unchanged: number;
  };
}
