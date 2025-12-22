import { useState, useCallback, useMemo } from 'react';
import { useLatestPrices, Price } from './usePrices';
import { CANONICAL_PRODUCTS } from '@/data/products';
import { Store } from '@/types';
import { getEffectivePrice } from '@/lib/priceSanity';

export interface ShoppingListItem {
  productId: string;
  quantity: number;
}

export interface StoreTotals {
  store: Store;
  total: number;
  itemCount: number;
  missingItems: string[];
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const { data: prices = [], isLoading } = useLatestPrices();

  const addItem = useCallback((productId: string, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => 
          i.productId === productId 
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setItems(prev => prev.map(i => 
        i.productId === productId ? { ...i, quantity } : i
      ));
    }
  }, []);

  const clearList = useCallback(() => {
    setItems([]);
  }, []);

  const storeTotals = useMemo((): StoreTotals[] => {
    const stores: Store[] = ['billa', 'kaufland', 'lidl'];
    
    return stores.map(store => {
      let total = 0;
      let itemCount = 0;
      const missingItems: string[] = [];

      items.forEach(item => {
        const priceRecord = prices.find(
          p => p.product_id === item.productId && p.store === store
        );
        
        if (priceRecord) {
          const effectivePrice = getEffectivePrice(priceRecord);
          if (effectivePrice !== undefined) {
            total += effectivePrice * item.quantity;
            itemCount++;
          } else {
            const product = CANONICAL_PRODUCTS.find(p => p.id === item.productId);
            missingItems.push(product?.nameBg || item.productId);
          }
        } else {
          const product = CANONICAL_PRODUCTS.find(p => p.id === item.productId);
          missingItems.push(product?.nameBg || item.productId);
        }
      });

      return { store, total, itemCount, missingItems };
    });
  }, [items, prices]);

  const recommendation = useMemo(() => {
    if (items.length === 0) return null;

    const validTotals = storeTotals.filter(t => t.itemCount > 0);
    if (validTotals.length === 0) return null;

    const sortedByTotal = [...validTotals].sort((a, b) => a.total - b.total);
    const cheapest = sortedByTotal[0];
    const mostExpensive = sortedByTotal[sortedByTotal.length - 1];

    if (!cheapest || !mostExpensive || cheapest.total === 0) return null;

    const savings = mostExpensive.total - cheapest.total;
    const savingsPercent = mostExpensive.total > 0 
      ? (savings / mostExpensive.total) * 100 
      : 0;

    return {
      bestStore: cheapest.store,
      savings,
      savingsPercent,
      totalItems: items.length,
      coveredItems: cheapest.itemCount,
    };
  }, [items, storeTotals]);

  const getItemPrice = useCallback((productId: string, store: Store): number | undefined => {
    const priceRecord = prices.find(
      p => p.product_id === productId && p.store === store
    );
    return priceRecord ? getEffectivePrice(priceRecord) : undefined;
  }, [prices]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearList,
    storeTotals,
    recommendation,
    getItemPrice,
    isLoading,
  };
}
