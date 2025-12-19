import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

export interface PDFPageImage {
  pageNumber: number;
  dataUrl: string; // base64 data URL
  width: number;
  height: number;
}

/**
 * Convert PDF pages to JPEG images
 * @param file PDF file to convert
 * @param maxPages Maximum number of pages to convert (default: 10)
 * @param scale Scale factor for rendering (default: 1.5 for good quality while keeping size down)
 * @param quality JPEG quality 0-1 (default: 0.7)
 */
export async function pdfToImages(
  file: File,
  maxPages = 10,
  scale = 1.5,
  quality = 0.7
): Promise<PDFPageImage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const numPages = Math.min(pdf.numPages, maxPages);
  const images: PDFPageImage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get canvas context');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    // Convert to JPEG data URL
    const dataUrl = canvas.toDataURL('image/jpeg', quality);

    images.push({
      pageNumber: pageNum,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });

    // Clean up
    canvas.remove();
  }

  return images;
}

/**
 * Estimate total size of images in bytes
 */
export function estimateImagesSize(images: PDFPageImage[]): number {
  return images.reduce((total, img) => {
    // base64 is ~4/3 of original size, data URL has prefix
    const base64Length = img.dataUrl.length - 'data:image/jpeg;base64,'.length;
    return total + Math.ceil(base64Length * 0.75);
  }, 0);
}
