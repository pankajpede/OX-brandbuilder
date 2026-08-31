import { Injectable } from '@angular/core';
import { BrandData } from '../tools/brand-builder/models/brand.model';
import { saveAs } from 'file-saver';

declare const html2canvas: any;
declare const jspdf: any;

@Injectable({ providedIn: 'root' })
export class PdfService {
  /** Generate and download a multi-page A4 PDF from the preview element smoothly */
  async generatePDF(
    brandData: BrandData, 
    previewElement: HTMLElement,
    onProgress?: (currentStep: number, totalSteps: number, overallPercent: number, pageTitle: string) => void
  ): Promise<void> {
    const blob = await this.generatePdfBlob(brandData, previewElement, onProgress);
    const fileName = (brandData.cover.name || 'Brand_Guidelines')
      .replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
    saveAs(blob, fileName);
  }

  /** Generate and return a Blob of the multi-page A4 PDF */
  async generatePdfBlob(
    brandData: BrandData, 
    previewElement: HTMLElement,
    onProgress?: (currentStep: number, totalSteps: number, overallPercent: number, pageTitle: string) => void
  ): Promise<Blob> {
    const html2canvasModule = await import('html2canvas');
    const html2canvasDefault = html2canvasModule.default;
    const jsPDFModule = await import('jspdf');
    const { jsPDF } = jsPDFModule;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const a4Width = 297;
    const a4Height = 210;

    const pages = Array.from(previewElement.querySelectorAll('.pdf-page, .preview-page')) as HTMLElement[];
    if (pages.length === 0) throw new Error('PDF pages element not found');

    const getPageTitle = (el: HTMLElement, idx: number): string => {
      const h2 = el.querySelector('h2');
      if (h2 && h2.textContent && h2.textContent.trim()) return h2.textContent.trim();
      const h1 = el.querySelector('h1');
      if (h1 && h1.textContent && h1.textContent.trim()) return h1.textContent.trim();
      return `Page ${idx + 1}`;
    };

    const clones: HTMLElement[] = [];
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageTitle = getPageTitle(page, i);
      const overallPercent = Math.round(((i + 0.5) / pages.length) * 100);

      if (onProgress) {
        onProgress(i + 1, pages.length, overallPercent, `Preparing ${pageTitle}...`);
      }

      await new Promise(resolve => setTimeout(resolve, 30));

      const clone = page.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: `${page.offsetWidth}px`,
        height: `${page.offsetHeight}px`,
        margin: '0',
        zIndex: '-1'
      });
      
      clone.classList.add('exporting');
      document.body.appendChild(clone);
      
      this.bakeStyles(page, clone, true);
      clones.push(clone);
    }

    try {
      for (let i = 0; i < clones.length; i++) {
        const clone = clones[i];
        const origPage = pages[i];
        const pageTitle = getPageTitle(origPage, i);
        const overallPercent = Math.round(((i + 1) / clones.length) * 100);

        if (onProgress) {
          onProgress(i + 1, clones.length, overallPercent, pageTitle);
        }

        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (i > 0) pdf.addPage();
        
        const isCoverPage = (i === 0);
        await this.renderElementToPage(html2canvasDefault, pdf, clone, a4Width, a4Height, false, isCoverPage);
      }

      if (onProgress) {
        onProgress(clones.length, clones.length, 100, 'Compiling PDF document...');
      }
      await new Promise(resolve => setTimeout(resolve, 50));

      return pdf.output('blob');
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    } finally {
      clones.forEach(clone => {
        if (clone.parentNode) document.body.removeChild(clone);
      });
    }
  }

  private colorCanvasCtx: CanvasRenderingContext2D | null = null;

  /** Converts modern color functions (oklab, oklch, color) to rgba */
  private sanitizeCssValue(value: string): string {
    if (!value || typeof value !== 'string') return value;
    if (!value.includes('oklch') && !value.includes('oklab') && !value.includes('color(')) {
      return value;
    }

    const colorRegex = /(?:oklch|oklab|color)\([^)]+\)/g;

    return value.replace(colorRegex, (match) => {
      if (!this.colorCanvasCtx) {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        this.colorCanvasCtx = canvas.getContext('2d', { willReadFrequently: true });
      }
      if (!this.colorCanvasCtx) return match;

      this.colorCanvasCtx.clearRect(0, 0, 1, 1);
      this.colorCanvasCtx.globalCompositeOperation = 'copy';
      this.colorCanvasCtx.fillStyle = match;
      this.colorCanvasCtx.fillRect(0, 0, 1, 1);
      
      const data = this.colorCanvasCtx.getImageData(0, 0, 1, 1).data;
      return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
    });
  }

  private bakeStyles(source: HTMLElement, target: HTMLElement, isRoot = false): void {
    const computed = window.getComputedStyle(source);
    
    let props = [
      'display', 'position', 'top', 'right', 'bottom', 'left',
      'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'box-sizing', 'overflow', 'z-index', 'vertical-align',
      'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
      'justify-content', 'align-items', 'align-content', 'gap', 'column-gap', 'row-gap',
      'order',
      'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row',
      'grid-area', 'grid-auto-flow', 'grid-auto-columns', 'grid-auto-rows',
      'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
      'text-align', 'text-transform', 'text-decoration', 'white-space', 'word-break',
      'color', 'font-style', 'font-variant', 'text-indent', 'text-overflow',
      'background-color', 'background-image', 'background-size', 'background-position',
      'background-repeat', 'background-clip', 'background-origin',
      'border', 'border-color', 'border-width', 'border-style',
      'border-top-color', 'border-top-width', 'border-top-style',
      'border-right-color', 'border-right-width', 'border-right-style',
      'border-bottom-color', 'border-bottom-width', 'border-bottom-style',
      'border-left-color', 'border-left-width', 'border-left-style',
      'border-radius', 'border-top-left-radius', 'border-top-right-radius',
      'border-bottom-left-radius', 'border-bottom-right-radius',
      'box-shadow', 'opacity', 'visibility', 'filter', 'backdrop-filter',
      'transform', 'transform-origin', 'clip-path',
      'fill', 'stroke', 'stroke-width', 'stop-color', 'cx', 'cy', 'r'
    ];

    if (isRoot) {
      const layoutProps = ['position', 'top', 'right', 'bottom', 'left', 'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height', 'margin'];
      props = props.filter(p => !layoutProps.includes(p));
    }

    props.forEach(prop => {
      let value = computed.getPropertyValue(prop);
      if (value) {
        value = this.sanitizeCssValue(value);
        target.style.setProperty(prop, value, 'important');
      }
    });

    const sourceChildren = Array.from(source.children);
    const targetChildren = Array.from(target.children);
    
    sourceChildren.forEach((child, i) => {
      if (targetChildren[i]) {
        this.bakeStyles(child as HTMLElement, targetChildren[i] as HTMLElement, false);
      }
    });
  }

  private async renderElementToPage(
    html2canvasFn: any,
    pdf: any,
    element: HTMLElement,
    pageWidth: number,
    pageHeight: number,
    addPage: boolean,
    isCoverPage: boolean = false
  ): Promise<void> {
    const tplChild = (element.querySelector('.tpl') || element.firstElementChild || element) as HTMLElement;
    let bgColor = tplChild ? window.getComputedStyle(tplChild).backgroundColor : '#FFFFFF';
    
    if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      bgColor = '#FFFFFF';
    }

    const canvas = await html2canvasFn(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      onclone: (clonedDoc: Document) => {
        const styles = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
        styles.forEach(s => s.parentNode?.removeChild(s));
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = imgProps.width / imgProps.height;
    const pageRatio = pageWidth / pageHeight;

    let renderWidth, renderHeight;
    if (ratio > pageRatio) {
      renderWidth = pageWidth;
      renderHeight = renderWidth / ratio;
    } else {
      renderHeight = pageHeight;
      renderWidth = renderHeight * ratio;
    }
    
    const xOffset = (pageWidth - renderWidth) / 2;
    const yOffset = (pageHeight - renderHeight) / 2;

    if (addPage) pdf.addPage();

    pdf.setFillColor(bgColor);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
  }
}
