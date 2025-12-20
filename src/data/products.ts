import { CanonicalProduct, StorePrice, Store } from '@/types';

export const CANONICAL_PRODUCTS: CanonicalProduct[] = [
  // Dairy
  { id: 'kashkaval', name: 'Yellow Cheese (Kashkaval)', nameBg: 'Кашкавал', category: 'dairy', unit: 'kg', icon: '🧀' },
  { id: 'sirene', name: 'White Cheese (Sirene)', nameBg: 'Сирене', category: 'dairy', unit: 'kg', icon: '🧀' },
  { id: 'cream-cheese', name: 'Cream Cheese', nameBg: 'Крема сирене', category: 'dairy', unit: 'g', icon: '🧀' },
  { id: 'milk', name: 'Milk 3.6%', nameBg: 'Прясно мляко', category: 'dairy', unit: 'L', icon: '🥛' },
  { id: 'yogurt', name: 'Bulgarian Yogurt', nameBg: 'Кисело мляко', category: 'dairy', unit: 'g', icon: '🥣' },
  { id: 'butter', name: 'Butter', nameBg: 'Масло', category: 'dairy', unit: 'g', icon: '🧈' },
  { id: 'eggs', name: 'Eggs (10 pcs)', nameBg: 'Яйца', category: 'dairy', unit: 'pcs', icon: '🥚' },
  { id: 'sour-cream', name: 'Sour Cream', nameBg: 'Заквасена сметана', category: 'dairy', unit: 'g', icon: '🥛' },
  
  // Oils
  { id: 'sunflower-oil', name: 'Sunflower Oil', nameBg: 'Олио', category: 'oils', unit: 'L', icon: '🌻' },
  { id: 'olive-oil', name: 'Olive Oil', nameBg: 'Зехтин', category: 'oils', unit: 'L', icon: '🫒' },
  
  // Grains & Bakery
  { id: 'flour', name: 'White Flour', nameBg: 'Брашно', category: 'grains', unit: 'kg', icon: '🌾' },
  { id: 'bread', name: 'White Bread', nameBg: 'Хляб', category: 'grains', unit: 'pcs', icon: '🍞' },
  { id: 'rice', name: 'White Rice', nameBg: 'Ориз', category: 'grains', unit: 'kg', icon: '🍚' },
  { id: 'pasta', name: 'Pasta', nameBg: 'Макарони', category: 'grains', unit: 'g', icon: '🍝' },
  { id: 'banitsa', name: 'Banitsa', nameBg: 'Баница', category: 'grains', unit: 'pcs', icon: '🥧' },
  { id: 'pita', name: 'Pita Bread', nameBg: 'Питка', category: 'grains', unit: 'pcs', icon: '🫓' },
  
  // Produce - Vegetables
  { id: 'tomatoes', name: 'Tomatoes', nameBg: 'Домати', category: 'produce', unit: 'kg', icon: '🍅' },
  { id: 'cucumbers', name: 'Cucumbers', nameBg: 'Краставици', category: 'produce', unit: 'kg', icon: '🥒' },
  { id: 'potatoes', name: 'Potatoes', nameBg: 'Картофи', category: 'produce', unit: 'kg', icon: '🥔' },
  { id: 'sweet-potatoes', name: 'Sweet Potatoes', nameBg: 'Сладки картофи', category: 'produce', unit: 'kg', icon: '🍠' },
  { id: 'onions', name: 'Onions', nameBg: 'Лук', category: 'produce', unit: 'kg', icon: '🧅' },
  { id: 'carrots', name: 'Carrots', nameBg: 'Моркови', category: 'produce', unit: 'kg', icon: '🥕' },
  { id: 'peppers', name: 'Bell Peppers', nameBg: 'Чушки', category: 'produce', unit: 'kg', icon: '🫑' },
  { id: 'cabbage', name: 'Cabbage', nameBg: 'Зеле', category: 'produce', unit: 'kg', icon: '🥬' },
  { id: 'lettuce', name: 'Lettuce', nameBg: 'Маруля', category: 'produce', unit: 'pcs', icon: '🥬' },
  { id: 'garlic', name: 'Garlic', nameBg: 'Чесън', category: 'produce', unit: 'kg', icon: '🧄' },
  
  // Produce - Fruits
  { id: 'lemons', name: 'Lemons', nameBg: 'Лимони', category: 'produce', unit: 'kg', icon: '🍋' },
  { id: 'apples', name: 'Apples', nameBg: 'Ябълки', category: 'produce', unit: 'kg', icon: '🍎' },
  { id: 'bananas', name: 'Bananas', nameBg: 'Банани', category: 'produce', unit: 'kg', icon: '🍌' },
  { id: 'oranges', name: 'Oranges', nameBg: 'Портокали', category: 'produce', unit: 'kg', icon: '🍊' },
  { id: 'grapes', name: 'Grapes', nameBg: 'Грозде', category: 'produce', unit: 'kg', icon: '🍇' },
  { id: 'watermelon', name: 'Watermelon', nameBg: 'Диня', category: 'produce', unit: 'kg', icon: '🍉' },
  
  // Proteins - Meat
  { id: 'chicken', name: 'Chicken', nameBg: 'Пиле', category: 'proteins', unit: 'kg', icon: '🍗' },
  { id: 'chicken-breast', name: 'Chicken Breast', nameBg: 'Пилешко филе', category: 'proteins', unit: 'kg', icon: '🍗' },
  { id: 'minced-meat', name: 'Minced Meat', nameBg: 'Кайма', category: 'proteins', unit: 'kg', icon: '🥩' },
  { id: 'pork', name: 'Pork', nameBg: 'Свинско', category: 'proteins', unit: 'kg', icon: '🥓' },
  { id: 'pork-chops', name: 'Pork Chops', nameBg: 'Свински котлети', category: 'proteins', unit: 'kg', icon: '🥩' },
  { id: 'beef', name: 'Beef', nameBg: 'Телешко', category: 'proteins', unit: 'kg', icon: '🥩' },
  { id: 'sausages', name: 'Sausages', nameBg: 'Наденица', category: 'proteins', unit: 'kg', icon: '🌭' },
  { id: 'kebapche', name: 'Kebapche', nameBg: 'Кебапче', category: 'proteins', unit: 'pcs', icon: '🥓' },
  { id: 'kyufte', name: 'Kyufte', nameBg: 'Кюфте', category: 'proteins', unit: 'pcs', icon: '🍔' },
  { id: 'lukanka', name: 'Lukanka', nameBg: 'Луканка', category: 'proteins', unit: 'g', icon: '🥓' },
  { id: 'ham', name: 'Ham', nameBg: 'Шунка', category: 'proteins', unit: 'g', icon: '🥓' },
  
  // Proteins - Fish
  { id: 'fish', name: 'Fish', nameBg: 'Риба', category: 'proteins', unit: 'kg', icon: '🐟' },
  { id: 'salmon', name: 'Salmon', nameBg: 'Сьомга', category: 'proteins', unit: 'kg', icon: '🍣' },
  { id: 'tuna', name: 'Tuna', nameBg: 'Риба тон', category: 'proteins', unit: 'g', icon: '🐟' },
  { id: 'mackerel', name: 'Mackerel', nameBg: 'Скумрия', category: 'proteins', unit: 'g', icon: '🐟' },
  
  // Pantry - Basics
  { id: 'sugar', name: 'White Sugar', nameBg: 'Захар', category: 'pantry', unit: 'kg', icon: '🍬' },
  { id: 'salt', name: 'Table Salt', nameBg: 'Сол', category: 'pantry', unit: 'kg', icon: '🧂' },
  { id: 'coffee', name: 'Coffee', nameBg: 'Кафе', category: 'pantry', unit: 'g', icon: '☕' },
  { id: 'tea', name: 'Tea', nameBg: 'Чай', category: 'pantry', unit: 'pcs', icon: '🍵' },
  { id: 'honey', name: 'Honey', nameBg: 'Мед', category: 'pantry', unit: 'g', icon: '🍯' },
  
  // Pantry - Canned & Preserved
  { id: 'tomato-paste', name: 'Tomato Paste', nameBg: 'Доматено пюре', category: 'pantry', unit: 'g', icon: '🥫' },
  { id: 'canned-beans', name: 'Canned Beans', nameBg: 'Консервиран боб', category: 'pantry', unit: 'g', icon: '🥫' },
  { id: 'canned-corn', name: 'Canned Corn', nameBg: 'Консервирана царевица', category: 'pantry', unit: 'g', icon: '🌽' },
  { id: 'pickles', name: 'Pickles', nameBg: 'Кисели краставички', category: 'pantry', unit: 'g', icon: '🥒' },
  
  // Snacks
  { id: 'biscuits', name: 'Biscuits', nameBg: 'Бисквити', category: 'snacks', unit: 'g', icon: '🍪' },
  { id: 'chocolate', name: 'Chocolate', nameBg: 'Шоколад', category: 'snacks', unit: 'g', icon: '🍫' },
  { id: 'chips', name: 'Chips', nameBg: 'Чипс', category: 'snacks', unit: 'g', icon: '🍟' },
  { id: 'wafers', name: 'Wafers', nameBg: 'Вафли', category: 'snacks', unit: 'g', icon: '🍪' },
  { id: 'nuts', name: 'Nuts', nameBg: 'Ядки', category: 'snacks', unit: 'g', icon: '🥜' },
  
  // Beverages
  { id: 'water', name: 'Mineral Water', nameBg: 'Минерална вода', category: 'beverages', unit: 'L', icon: '💧' },
  { id: 'juice', name: 'Juice', nameBg: 'Сок', category: 'beverages', unit: 'L', icon: '🧃' },
  { id: 'cola', name: 'Cola', nameBg: 'Кола', category: 'beverages', unit: 'L', icon: '🥤' },
  { id: 'beer', name: 'Beer', nameBg: 'Бира', category: 'beverages', unit: 'L', icon: '🍺' },
  { id: 'wine', name: 'Wine', nameBg: 'Вино', category: 'beverages', unit: 'L', icon: '🍷' },
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
  'cream-cheese': 3.49,
  'milk': 2.49,
  'yogurt': 1.89,
  'butter': 12.99,
  'eggs': 5.49,
  'sour-cream': 2.99,
  'sunflower-oil': 3.99,
  'olive-oil': 15.99,
  'flour': 1.99,
  'bread': 1.49,
  'rice': 3.49,
  'pasta': 2.99,
  'banitsa': 2.49,
  'pita': 0.99,
  'tomatoes': 4.99,
  'cucumbers': 3.49,
  'potatoes': 1.99,
  'sweet-potatoes': 2.99,
  'onions': 2.49,
  'carrots': 1.49,
  'peppers': 3.99,
  'cabbage': 1.29,
  'lettuce': 1.99,
  'garlic': 9.99,
  'lemons': 5.99,
  'apples': 3.99,
  'bananas': 2.99,
  'oranges': 3.49,
  'grapes': 4.99,
  'watermelon': 0.99,
  'chicken': 8.99,
  'chicken-breast': 12.99,
  'minced-meat': 11.99,
  'pork': 14.99,
  'pork-chops': 12.99,
  'beef': 19.99,
  'sausages': 8.99,
  'kebapche': 0.59,
  'kyufte': 0.59,
  'lukanka': 24.99,
  'ham': 14.99,
  'fish': 12.99,
  'salmon': 29.99,
  'tuna': 4.99,
  'mackerel': 3.49,
  'sugar': 2.49,
  'salt': 0.99,
  'coffee': 8.99,
  'tea': 2.99,
  'honey': 9.99,
  'tomato-paste': 2.99,
  'canned-beans': 1.99,
  'canned-corn': 1.79,
  'pickles': 2.49,
  'biscuits': 1.99,
  'chocolate': 2.49,
  'chips': 2.99,
  'wafers': 1.49,
  'nuts': 4.99,
  'water': 0.79,
  'juice': 2.99,
  'cola': 2.49,
  'beer': 1.49,
  'wine': 6.99,
};

export const MOCK_PRICES: StorePrice[] = CANONICAL_PRODUCTS.flatMap(product => {
  const stores: Store[] = ['billa', 'kaufland', 'lidl'];
  return stores.map(store => generateMockPrice(product.id, store, BASE_PRICES[product.id] || 5));
});

export const CATEGORY_LABELS: Record<string, string> = {
  dairy: 'Млечни и яйца',
  oils: 'Олио',
  grains: 'Хляб и зърнени',
  produce: 'Пресни плодове и зеленчуци',
  proteins: 'Месо и риба',
  pantry: 'Основни продукти',
  snacks: 'Снаксове',
  beverages: 'Напитки',
};

export const STORE_INFO: Record<Store, { name: string; color: string; logo: string }> = {
  billa: { name: 'Billa', color: 'billa', logo: '🔴' },
  kaufland: { name: 'Kaufland', color: 'kaufland', logo: '🔴' },
  lidl: { name: 'Lidl', color: 'lidl', logo: '🔵' },
};
