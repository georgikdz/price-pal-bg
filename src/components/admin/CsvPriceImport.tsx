import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { parseCsvText, generateCsvTemplate, downloadCsv, ParsedPriceRow, ParseResult } from '@/lib/csvUtils';
import { useCsvImport } from '@/hooks/useCsvImport';
import { CANONICAL_PRODUCTS, STORE_INFO } from '@/data/products';
import { cn } from '@/lib/utils';

export function CsvPriceImport() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const csvImport = useCsvImport();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseCsvText(text);
      setParseResult(result);

      if (result.errorCount > 0) {
        toast({
          title: 'CSV parsed with errors',
          description: `${result.validCount} valid rows, ${result.errorCount} rows with errors`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'CSV parsed successfully',
          description: `${result.validCount} rows ready to import`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const template = generateCsvTemplate();
    downloadCsv(template, 'price_import_template.csv');
    toast({
      title: 'Template downloaded',
      description: 'Fill in the template and upload it to import prices',
    });
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.validCount === 0) return;

    try {
      const result = await csvImport.mutateAsync(parseResult.rows);
      
      if (result.successCount > 0) {
        toast({
          title: 'Import successful',
          description: `${result.successCount} prices imported${result.failedCount > 0 ? `, ${result.failedCount} failed` : ''}`,
        });
        setParseResult(null);
        setFileName('');
      } else {
        toast({
          title: 'Import failed',
          description: result.errors.join(', '),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import error',
        description: error instanceof Error ? error.message : 'Failed to import prices',
        variant: 'destructive',
      });
    }
  };

  const handleClear = () => {
    setParseResult(null);
    setFileName('');
  };

  const getProductName = (productId: string) => {
    const product = CANONICAL_PRODUCTS.find(p => p.id === productId);
    return product ? `${product.icon} ${product.nameBg}` : productId;
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Prices from CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleDownloadTemplate} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <Button
              onClick={() => inputRef.current?.click()}
              variant="default"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload CSV
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Required columns:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><code className="bg-muted px-1 rounded">product_id</code> - Product identifier (e.g., cucumbers, milk)</li>
              <li><code className="bg-muted px-1 rounded">store</code> - Store name (billa, kaufland, lidl)</li>
              <li><code className="bg-muted px-1 rounded">price</code> - Regular price</li>
            </ul>
            <p className="font-medium mt-3 mb-1">Optional columns:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><code className="bg-muted px-1 rounded">promo_price</code> - Promotional price</li>
              <li><code className="bg-muted px-1 rounded">unit</code> - Unit (e.g., kg, 1L, 500g)</li>
              <li><code className="bg-muted px-1 rounded">brand</code> - Brand name</li>
              <li><code className="bg-muted px-1 rounded">is_promo</code> - true/false</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {parseResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Preview: {fileName}</span>
                <Badge variant={parseResult.errorCount > 0 ? 'destructive' : 'default'}>
                  {parseResult.validCount} valid / {parseResult.errorCount} errors
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleImport}
                  disabled={parseResult.validCount === 0 || csvImport.isPending}
                  className="gap-2"
                >
                  {csvImport.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Import {parseResult.validCount} Prices
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Promo</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parseResult.rows.map((row) => (
                    <TableRow 
                      key={row.rowNumber}
                      className={cn(
                        row.errors.length > 0 && 'bg-destructive/10',
                        row.warnings.length > 0 && row.errors.length === 0 && 'bg-warning/10'
                      )}
                    >
                      <TableCell className="text-muted-foreground">{row.rowNumber}</TableCell>
                      <TableCell className="font-medium">
                        {getProductName(row.product_id)}
                      </TableCell>
                      <TableCell>
                        {row.store && STORE_INFO[row.store as keyof typeof STORE_INFO] ? (
                          <Badge variant="outline">
                            {STORE_INFO[row.store as keyof typeof STORE_INFO].name}
                          </Badge>
                        ) : (
                          <span className="text-destructive">{row.store || '—'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {row.price > 0 ? `${row.price.toFixed(2)} лв` : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {row.promo_price ? (
                          <span className="text-green-600 dark:text-green-400">
                            {row.promo_price.toFixed(2)} лв
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{row.unit || '—'}</TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <div className="flex items-start gap-1.5">
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            <span className="text-xs text-destructive">{row.errors.join('; ')}</span>
                          </div>
                        ) : row.warnings.length > 0 ? (
                          <div className="flex items-start gap-1.5">
                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                            <span className="text-xs text-warning">{row.warnings.join('; ')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-xs text-success">Valid</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
