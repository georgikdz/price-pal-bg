import { Price } from '@/hooks/usePrices';
import { CANONICAL_PRODUCTS } from '@/data/products';

// CSV Export
export function pricesToCsv(prices: Price[]): string {
  const headers = ['product_id', 'store', 'price', 'promo_price', 'unit', 'brand', 'is_promo'];
  const rows = prices.map(p => [
    escapeCsvField(p.product_id),
    escapeCsvField(p.store),
    p.price.toString(),
    p.promo_price?.toString() || '',
    escapeCsvField(p.unit || ''),
    escapeCsvField(p.brand || ''),
    p.is_promo ? 'true' : 'false',
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// CSV Import
export interface ParsedPriceRow {
  product_id: string;
  store: string;
  price: number;
  promo_price: number | null;
  unit: string | null;
  brand: string | null;
  is_promo: boolean;
  rowNumber: number;
  errors: string[];
  warnings: string[];
}

export interface ParseResult {
  rows: ParsedPriceRow[];
  validCount: number;
  errorCount: number;
}

const validStores = ['billa', 'kaufland', 'lidl'];

export function parseCsvText(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return { rows: [], validCount: 0, errorCount: 0 };
  }

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
  const productIdIndex = headers.indexOf('product_id');
  const storeIndex = headers.indexOf('store');
  const priceIndex = headers.indexOf('price');
  const promoPriceIndex = headers.indexOf('promo_price');
  const unitIndex = headers.indexOf('unit');
  const brandIndex = headers.indexOf('brand');
  const isPromoIndex = headers.indexOf('is_promo');

  if (productIdIndex === -1 || storeIndex === -1 || priceIndex === -1) {
    return { 
      rows: [{
        product_id: '',
        store: '',
        price: 0,
        promo_price: null,
        unit: null,
        brand: null,
        is_promo: false,
        rowNumber: 1,
        errors: ['Missing required columns: product_id, store, and price are required'],
        warnings: [],
      }], 
      validCount: 0, 
      errorCount: 1 
    };
  }

  const knownProductIds = new Set(CANONICAL_PRODUCTS.map(p => p.id));
  const rows: ParsedPriceRow[] = [];
  let validCount = 0;
  let errorCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    const errors: string[] = [];
    const warnings: string[] = [];

    const productId = values[productIdIndex]?.trim() || '';
    const store = values[storeIndex]?.trim().toLowerCase() || '';
    const priceStr = values[priceIndex]?.trim() || '';
    const promoPriceStr = promoPriceIndex !== -1 ? values[promoPriceIndex]?.trim() || '' : '';
    const unit = unitIndex !== -1 ? values[unitIndex]?.trim() || null : null;
    const brand = brandIndex !== -1 ? values[brandIndex]?.trim() || null : null;
    const isPromoStr = isPromoIndex !== -1 ? values[isPromoIndex]?.trim().toLowerCase() : '';

    // Validate required fields
    if (!productId) errors.push('Missing product_id');
    if (!store) errors.push('Missing store');
    if (!priceStr) errors.push('Missing price');

    // Validate store
    if (store && !validStores.includes(store)) {
      errors.push(`Invalid store: ${store}. Must be one of: ${validStores.join(', ')}`);
    }

    // Validate price
    const price = parseFloat(priceStr);
    if (priceStr && (isNaN(price) || price <= 0)) {
      errors.push('Invalid price: must be a positive number');
    }

    // Validate promo price
    let promoPrice: number | null = null;
    if (promoPriceStr) {
      promoPrice = parseFloat(promoPriceStr);
      if (isNaN(promoPrice) || promoPrice <= 0) {
        errors.push('Invalid promo_price: must be a positive number');
        promoPrice = null;
      }
    }

    // Warnings
    if (productId && !knownProductIds.has(productId)) {
      warnings.push(`Unknown product_id: ${productId}`);
    }

    if (price > 0 && price < 0.10) {
      warnings.push('Price seems suspiciously low');
    }

    if (price > 100) {
      warnings.push('Price seems unusually high');
    }

    // Determine is_promo
    let isPromo = false;
    if (isPromoStr === 'true' || isPromoStr === '1' || isPromoStr === 'yes') {
      isPromo = true;
    } else if (promoPrice !== null && promoPrice < price) {
      isPromo = true;
    }

    const row: ParsedPriceRow = {
      product_id: productId,
      store,
      price: isNaN(price) ? 0 : price,
      promo_price: promoPrice,
      unit,
      brand,
      is_promo: isPromo,
      rowNumber: i + 1,
      errors,
      warnings,
    };

    rows.push(row);

    if (errors.length > 0) {
      errorCount++;
    } else {
      validCount++;
    }
  }

  return { rows, validCount, errorCount };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current);
  return result;
}

// Template generation
export function generateCsvTemplate(): string {
  const headers = 'product_id,store,price,promo_price,unit,brand,is_promo';
  const examples = [
    'cucumbers,billa,3.49,,kg,Bulgarian,false',
    'tomatoes,kaufland,4.99,3.99,kg,K-Classic,true',
    'milk,lidl,2.29,,1L,Pilos,false',
  ];
  return [headers, ...examples].join('\n');
}
