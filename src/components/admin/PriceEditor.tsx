import { useState } from 'react';
import { usePrices, usePriceHistory, Price } from '@/hooks/usePrices';
import { useUpdatePrice, useDeletePrice } from '@/hooks/usePriceEditor';
import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, AlertTriangle, Check, X, TrendingUp, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { pricesToCsv, downloadCsv } from '@/lib/csvUtils';

// Store colors for chart
const STORE_COLORS: Record<string, string> = {
  billa: '#FF6B00',
  kaufland: '#E31E24',
  lidl: '#0050AA',
};

function PriceHistoryChart({ productId }: { productId: string }) {
  const { data: history, isLoading } = usePriceHistory(productId);
  const product = CANONICAL_PRODUCTS.find(p => p.id === productId);

  if (isLoading) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        Няма налична ценова история за този продукт
      </div>
    );
  }

  // Transform data for chart - group by date and show prices by store
  const dateMap = new Map<string, Record<string, number>>();
  for (const price of history) {
    const date = new Date(price.extracted_at).toLocaleDateString('bg-BG');
    const existing = dateMap.get(date) || {};
    const effectivePrice = price.promo_price || price.price;
    existing[price.store] = effectivePrice;
    dateMap.set(date, existing);
  }

  const chartData = Array.from(dateMap.entries()).map(([date, stores]) => ({
    date,
    ...stores,
  }));

  const storesInData = new Set(history.map(p => p.store));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-lg">{product?.icon}</span>
        <span className="font-medium">{product?.nameBg}</span>
        <span className="text-muted-foreground">- Ценова история</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis 
            fontSize={12} 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `${value.toFixed(2)} лв`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value.toFixed(2)} лв`, '']}
          />
          <Legend />
          {Array.from(storesInData).map(store => (
            <Line
              key={store}
              type="monotone"
              dataKey={store}
              name={STORE_INFO[store as keyof typeof STORE_INFO]?.name || store}
              stroke={STORE_COLORS[store] || '#888'}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriceEditor() {
  const { data: prices, isLoading } = usePrices();
  const updatePrice = useUpdatePrice();
  const deletePrice = useDeletePrice();

  const [filterStore, setFilterStore] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [editForm, setEditForm] = useState({ price: '', promo_price: '', unit: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showHistoryChart, setShowHistoryChart] = useState(false);

  const getProductInfo = (productId: string) => {
    return CANONICAL_PRODUCTS.find(p => p.id === productId);
  };

  const filteredPrices = prices?.filter(p => {
    if (filterStore !== 'all' && p.store !== filterStore) return false;
    if (filterProduct !== 'all' && p.product_id !== filterProduct) return false;
    return true;
  }).sort((a, b) => new Date(b.extracted_at).getTime() - new Date(a.extracted_at).getTime()) || [];

  const handleEdit = (price: Price) => {
    setEditingPrice(price);
    setEditForm({
      price: price.price.toString(),
      promo_price: price.promo_price?.toString() || '',
      unit: price.unit || '',
    });
  };

  const handleSave = async () => {
    if (!editingPrice) return;

    const priceValue = parseFloat(editForm.price);
    const promoValue = editForm.promo_price ? parseFloat(editForm.promo_price) : null;

    if (isNaN(priceValue) || priceValue <= 0) {
      toast({ title: 'Невалидна цена', description: 'Моля, въведете валидна цена.', variant: 'destructive' });
      return;
    }

    if (promoValue !== null && (isNaN(promoValue) || promoValue <= 0)) {
      toast({ title: 'Невалидна промо цена', description: 'Моля, въведете валидна промо цена.', variant: 'destructive' });
      return;
    }

    try {
      await updatePrice.mutateAsync({
        id: editingPrice.id,
        price: priceValue,
        promo_price: promoValue,
        unit: editForm.unit || null,
      });
      toast({ title: 'Цената е обновена', description: 'Цената беше успешно обновена.' });
      setEditingPrice(null);
    } catch (error) {
      toast({ title: 'Грешка', description: 'Неуспешно обновяване на цената.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePrice.mutateAsync(id);
      toast({ title: 'Цената е изтрита', description: 'Записът за цената беше премахнат.' });
      setDeleteConfirm(null);
    } catch (error) {
      toast({ title: 'Грешка', description: 'Неуспешно изтриване на цената.', variant: 'destructive' });
    }
  };

  // Flag prices that seem suspiciously low or high
  const isPriceSuspicious = (price: Price) => {
    const product = getProductInfo(price.product_id);
    if (!product) return false;

    const effectivePrice = price.promo_price || price.price;
    
    // Check for suspiciously low prices based on category
    if (product.category === 'produce' && effectivePrice < 0.5) return true;
    if (product.category === 'dairy' && effectivePrice < 0.3) return true;
    if (product.category === 'proteins' && effectivePrice < 2) return true;
    
    return false;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Редактор на цени</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleExportCsv = () => {
    const pricesToExport = filteredPrices.length > 0 ? filteredPrices : (prices || []);
    if (pricesToExport.length === 0) {
      toast({
        title: 'Няма цени за експорт',
        description: 'Няма цени, съответстващи на вашите филтри.',
        variant: 'destructive',
      });
      return;
    }

    const csv = pricesToCsv(pricesToExport);
    const storePart = filterStore !== 'all' ? `_${filterStore}` : '';
    const productPart = filterProduct !== 'all' ? `_${filterProduct}` : '';
    const filename = `цени${storePart}${productPart}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCsv(csv, filename);

    toast({
      title: 'Успешен експорт',
      description: `Експортирани ${pricesToExport.length} цени в ${filename}`,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Редактор на цени
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2">
              <Download className="h-4 w-4" />
              Експорт CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label>Магазин:</Label>
              <Select value={filterStore} onValueChange={setFilterStore}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички магазини</SelectItem>
                  {Object.entries(STORE_INFO).map(([key, info]) => (
                    <SelectItem key={key} value={key}>{info.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Продукт:</Label>
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички продукти</SelectItem>
                  {CANONICAL_PRODUCTS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.icon} {p.nameBg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price History Chart */}
          {filterProduct !== 'all' && (
            <Collapsible open={showHistoryChart} onOpenChange={setShowHistoryChart}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Графика на ценова история
                  </span>
                  {showHistoryChart ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <Card>
                  <CardContent className="pt-4">
                    <PriceHistoryChart productId={filterProduct} />
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Price count */}
          <p className="text-sm text-muted-foreground">
            Показване на {filteredPrices.length} ценови записа
          </p>

          {/* Prices Table */}
          <div className="rounded-md border overflow-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Магазин</TableHead>
                  <TableHead>Марка</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="text-right">Промо</TableHead>
                  <TableHead>Единица</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrices.map(price => {
                  const product = getProductInfo(price.product_id);
                  const suspicious = isPriceSuspicious(price);
                  
                  return (
                    <TableRow key={price.id} className={suspicious ? 'bg-destructive/10' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {suspicious && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                          <span>{product?.icon}</span>
                          <span className="font-medium">{product?.nameBg || price.product_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{STORE_INFO[price.store as keyof typeof STORE_INFO]?.name || price.store}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                        {price.brand}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {price.price.toFixed(2)} лв
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {price.promo_price ? (
                          <span className="text-green-600 dark:text-green-400">
                            {price.promo_price.toFixed(2)} лв
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {price.unit || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(price.extracted_at).toLocaleDateString('bg-BG')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(price)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(price.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrice} onOpenChange={() => setEditingPrice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактиране на цена</DialogTitle>
          </DialogHeader>
          {editingPrice && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg">
                <span>{getProductInfo(editingPrice.product_id)?.icon}</span>
                <span className="font-medium">{getProductInfo(editingPrice.product_id)?.nameBg}</span>
                <Badge variant="outline">{STORE_INFO[editingPrice.store as keyof typeof STORE_INFO]?.name}</Badge>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Редовна цена (лв)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="promo_price">Промо цена (лв) - оставете празно, ако не е в промоция</Label>
                  <Input
                    id="promo_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.promo_price}
                    onChange={e => setEditForm(f => ({ ...f, promo_price: e.target.value }))}
                    placeholder="По избор"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Единица</Label>
                  <Input
                    id="unit"
                    value={editForm.unit}
                    onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="напр. 1 kg, 500g, 1 L"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPrice(null)}>
              <X className="h-4 w-4 mr-2" />
              Отказ
            </Button>
            <Button onClick={handleSave} disabled={updatePrice.isPending}>
              <Check className="h-4 w-4 mr-2" />
              Запази
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Потвърждение за изтриване</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Сигурни ли сте, че искате да изтриете този ценови запис? Това действие не може да бъде отменено.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Отказ
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deletePrice.isPending}
            >
              Изтрий
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
