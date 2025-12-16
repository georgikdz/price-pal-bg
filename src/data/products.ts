import { CanonicalProduct, StorePrice, Store } from '@/types';

export const CANONICAL_PRODUCTS: CanonicalProduct[] = [
  // Dairy
  { id: 'kashkaval', name: 'Yellow Cheese (Kashkaval)', nameBg: 'Кашкавал', category: 'dairy', unit: 'kg', icon: '🧀' },
  { id: 'sirene', name: 'White Cheese (Sirene)', nameBg: 'Сирене', category: 'dairy', unit: 'kg', icon: '🧀' },
  { id: 'milk', name: 'Milk 3.6%', nameBg: 'Прясно мляко 3.6%', category: 'dairy', unit: 'L', icon: '🥛' },
  { id: 'yogurt', name: 'Bulgarian Yogurt', nameBg: 'Българско кисело мляко', category: 'dairy', unit: 'kg', icon: '🥛' },
  { id: 'butter', name: 'Butter', nameBg: 'Масло', category: 'dairy', unit: 'kg', icon: '🧈' },
  { id: 'eggs', name: 'Eggs (10 pcs)', nameBg: 'Яйца (10 бр.)', category: 'dairy', unit: 'pcs', icon: '🥚' },
  
  // Oils
  { id: 'sunflower-oil', name: 'Sunflower Oil', nameBg: 'Слънчогледово олио', category: 'oils', unit: 'L', icon: '🌻' },
  { id: 'olive-oil', name: 'Olive Oil', nameBg: 'Зехтин', category: 'oils', unit: 'L', icon: '🫒' },
  
  // Grains
  { id: 'flour', name: 'White Flour', nameBg: 'Бяло брашно', category: 'grains', unit: 'kg', icon: '🌾' },
  { id: 'bread', name: 'White Bread', nameBg: 'Бял хляб', category: 'grains', unit: 'pcs', icon: '🍞' },
  { id: 'rice', name: 'White Rice', nameBg: 'Бял ориз', category: 'grains', unit: 'kg', icon: '🍚' },
  { id: 'pasta', name: 'Pasta', nameBg: 'Макарони', category: 'grains', unit: 'kg', icon: '🍝' },
  
  // Produce
  { id: 'tomatoes', name: 'Tomatoes', nameBg: 'Домати', category: 'produce', unit: 'kg', icon: '🍅' },
  { id: 'cucumbers', name: 'Cucumbers', nameBg: 'Краставици', category: 'produce', unit: 'kg', icon: '🥒' },
  { id: 'potatoes', name: 'Potatoes', nameBg: 'Картофи', category: 'produce', unit: 'kg', icon: '🥔' },
  { id: 'onions', name: 'Onions', nameBg: 'Лук', category: 'produce', unit: 'kg', icon: '🧅' },
  { id: 'lemons', name: 'Lemons', nameBg: 'Лимони', category: 'produce', unit: 'kg', icon: '🍋' },
  { id: 'apples', name: 'Apples', nameBg: 'Ябълки', category: 'produce', unit: 'kg', icon: '🍎' },
  { id: 'bananas', name: 'Bananas', nameBg: 'Банани', category: 'produce', unit: 'kg', icon: '🍌' },
  
  // Proteins
  { id: 'chicken', name: 'Chicken Breast', nameBg: 'Пилешко филе', category: 'proteins', unit: 'kg', icon: '🍗' },
  { id: 'minced-meat', name: 'Minced Meat', nameBg: 'Кайма', category: 'proteins', unit: 'kg', icon: '🥩' },
  { id: 'pork', name: 'Pork', nameBg: 'Свинско месо', category: 'proteins', unit: 'kg', icon: '🥓' },
  
  // Pantry
  { id: 'sugar', name: 'White Sugar', nameBg: 'Бяла захар', category: 'pantry', unit: 'kg', icon: '🍬' },
  { id: 'salt', name: 'Table Salt', nameBg: 'Готварска сол', category: 'pantry', unit: 'kg', icon: '🧂' },
  { id: 'coffee', name: 'Ground Coffee', nameBg: 'Мляно кафе', category: 'pantry', unit: '100g', icon: '☕' },
  { id: 'tomato-paste', name: 'Tomato Paste', nameBg: 'Доматено пюре', category: 'pantry', unit: 'kg', icon: '🥫' },
  
  // Snacks
  { id: 'biscuits', name: 'Biscuits', nameBg: 'Бисквити', category: 'snacks', unit: '100g', icon: '🍪' },
  { id: 'chocolate', name: 'Chocolate', nameBg: 'Шоколад', category: 'snacks', unit: '100g', icon: '🍫' },
  
  // Beverages
  { id: 'water', name: 'Mineral Water', nameBg: 'Минерална вода', category: 'beverages', unit: 'L', icon: '💧' },
  { id: 'juice', name: 'Orange Juice', nameBg: 'Портокалов сок', category: 'beverages', unit: 'L', icon: '🍊' },
];

// Mock data for demonstration
const generateMockPrice = (productId: string, store: Store, basePrice: number): StorePrice => {
  const variance = (Math.random() - 0.5) * basePrice * 0.3;
  const price = Math.round((basePrice + variance) * 100) / 100;
  const product = CANONICAL_PRODUCTS.find(p => p.id === productId)!;
  
  return {
    id: `${store}-${productId}`,
    productId,
    store,
    price,
    pricePerUnit: price,
    packageSize: product.unit === 'kg' ? '1 kg' : product.unit === 'L' ? '1 L' : '1 бр.',
    brand: store === 'lidl' ? 'Lidl Brand' : store === 'kaufland' ? 'K-Classic' : 'Clever',
    isPromo: Math.random() > 0.7,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  };
};

const BASE_PRICES: Record<string, number> = {
  'kashkaval': 18.99,
  'sirene': 14.99,
  'milk': 2.49,
  'yogurt': 3.99,
  'butter': 12.99,
  'eggs': 5.49,
  'sunflower-oil': 3.99,
  'olive-oil': 15.99,
  'flour': 1.99,
  'bread': 1.49,
  'rice': 3.49,
  'pasta': 2.99,
  'tomatoes': 4.99,
  'cucumbers': 3.49,
  'potatoes': 1.99,
  'onions': 2.49,
  'lemons': 5.99,
  'apples': 3.99,
  'bananas': 2.99,
  'chicken': 12.99,
  'minced-meat': 11.99,
  'pork': 14.99,
  'sugar': 2.49,
  'salt': 0.99,
  'coffee': 4.99,
  'tomato-paste': 2.99,
  'biscuits': 1.99,
  'chocolate': 2.49,
  'water': 0.79,
  'juice': 2.99,
};

export const MOCK_PRICES: StorePrice[] = CANONICAL_PRODUCTS.flatMap(product => {
  const stores: Store[] = ['billa', 'kaufland', 'lidl'];
  return stores.map(store => generateMockPrice(product.id, store, BASE_PRICES[product.id] || 5));
});

export const CATEGORY_LABELS: Record<string, string> = {
  dairy: 'Dairy & Eggs',
  oils: 'Oils',
  grains: 'Bread & Grains',
  produce: 'Fresh Produce',
  proteins: 'Meat & Proteins',
  pantry: 'Pantry Staples',
  snacks: 'Snacks',
  beverages: 'Beverages',
};

export const STORE_INFO: Record<Store, { name: string; color: string; logo: string }> = {
  billa: { name: 'Billa', color: 'billa', logo: '🔴' },
  kaufland: { name: 'Kaufland', color: 'kaufland', logo: '🔴' },
  lidl: { name: 'Lidl', color: 'lidl', logo: '🔵' },
};
