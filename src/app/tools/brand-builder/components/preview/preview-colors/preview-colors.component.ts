import { Component, Input } from '@angular/core';
import { BrandData, ColorEntry } from '../../../models/brand.model';

@Component({
  selector: 'app-preview-colors',
  standalone: true,
  templateUrl: './preview-colors.component.html',
  styleUrl: './preview-colors.component.scss'
})
export class PreviewColorsComponent {
  @Input() data!: BrandData;
  @Input() paletteOverride?: ColorEntry[];
  @Input() pageNumber: string = '04';
  @Input() isPdfView: boolean = false;

  Math = Math;
  copiedHex: string | null = null;

  get variantTitle(): string {
    return 'Color System';
  }

  get paletteToRender(): ColorEntry[] {
    return this.paletteOverride || this.data?.colors?.palette || [];
  }

  get categories(): string[] {
    const cats = new Set<string>();
    this.paletteToRender.forEach(c => {
      if (c.category) cats.add(c.category);
    });
    const order = ['Brand', 'Semantic', 'Neutral'];
    return order.filter(o => cats.has(o)).concat(Array.from(cats).filter(c => !order.includes(c)));
  }

  getColorsByCategory(category: string): ColorEntry[] {
    const numTones = this.data?.colors?.numTones || 9;
    return this.paletteToRender
      .filter(c => c.category === category)
      .map(c => {
        const hasDuplicates = c.tones && new Set(c.tones).size !== c.tones.length;
        return {
          ...c,
          tones: (c.tones && c.tones.length === numTones && !hasDuplicates) 
            ? c.tones 
            : this.generateTonesFallback(c.hex, numTones)
        };
      });
  }

  generateTonesFallback(hex: string, numTones: number = 9): string[] {
    if (!hex || !hex.startsWith('#')) return Array(numTones).fill('#888888');
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const tones: string[] = [];
    
    for (let i = 0; i < numTones; i++) {
      const factor = 0.02 + (0.96 * i / (numTones - 1));
      let mixedR, mixedG, mixedB;
      
      const isNeutral = (Math.max(r, g, b) - Math.min(r, g, b)) < 25;

      if (isNeutral) {
        const baseVal = Math.round(255 * factor);
        const tintStrength = 0.05;
        mixedR = Math.round(baseVal + (r - luma * 255) * tintStrength);
        mixedG = Math.round(baseVal + (g - luma * 255) * tintStrength);
        mixedB = Math.round(baseVal + (b - luma * 255) * tintStrength);
      } else if (luma < 0.01 || luma > 0.99) {
        mixedR = mixedG = mixedB = Math.round(255 * factor);
      } else if (factor < luma) {
        const subFactor = factor / luma;
        mixedR = Math.round(0 + (r - 0) * subFactor);
        mixedG = Math.round(0 + (g - 0) * subFactor);
        mixedB = Math.round(0 + (b - 0) * subFactor);
      } else {
        const subFactor = (factor - luma) / (1 - luma);
        mixedR = Math.round(r + (255 - r) * subFactor);
        mixedG = Math.round(g + (255 - g) * subFactor);
        mixedB = Math.round(b + (255 - b) * subFactor);
      }
      
      const toHex = (c: number) => {
        const h = Math.max(0, Math.min(255, Math.round(c))).toString(16);
        return h.length === 1 ? '0' + h : h;
      };
      
      mixedR = Math.max(0, Math.min(255, mixedR));
      mixedG = Math.max(0, Math.min(255, mixedG));
      mixedB = Math.max(0, Math.min(255, mixedB));

      tones.push(`#${toHex(mixedR)}${toHex(mixedG)}${toHex(mixedB)}`.toLowerCase());
    }

    return tones.sort((a, b) => this.getLuma(b) - this.getLuma(a));
  }

  getLuma(hex: string): number {
    if (!hex || !hex.startsWith('#')) return 0.5;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  isLightColor(hex: string): boolean {
    return this.getLuma(hex) > 0.5;
  }

  getToneLabel(index: number, total: number): string {
    if (total === 0) return '';
    const step = 100 / (total + 1);
    const val = Math.round(100 - (index + 1) * step);
    return val.toString();
  }

  copyToClipboard(text: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copiedHex = text;
        setTimeout(() => {
          if (this.copiedHex === text) {
            this.copiedHex = null;
          }
        }, 2000);
      });
    }
  }

  copyAllTones(color: ColorEntry): void {
    const tones = color.tones || [];
    const text = tones.join(', ');
    this.copyToClipboard(text);
  }
}
