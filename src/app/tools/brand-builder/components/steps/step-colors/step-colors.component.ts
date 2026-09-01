import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BrandService } from '../../../services/brand.service';
import { VariantService } from '../../../services/variant.service';
import { VariantSelectorComponent } from '../../shared/variant-selector/variant-selector.component';
import { VariantOption } from '../../../models/brand.model';

@Component({
  selector: 'app-step-colors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VariantSelectorComponent],
  templateUrl: './step-colors.component.html',
  styleUrl: './step-colors.component.scss'
})
export class StepColorsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  public brandService = inject(BrandService);
  private variantService = inject(VariantService);
  private sub!: Subscription;

  form!: FormGroup;
  variants: VariantOption[] = [];
  selectedVariant = '';
  copiedHexIndex: number | null = null;

  get paletteArray(): FormArray {
    return this.form.get('palette') as FormArray;
  }

  get categories(): string[] {
    return ['Brand', 'Semantic', 'Neutral'];
  }

  getCategorySubtitle(cat: string): string {
    if (cat === 'Brand') return 'Define the core colors used across your brand.';
    if (cat === 'Semantic') return 'Colors used for system feedback and status.';
    if (cat === 'Neutral') return 'Base background, text, and gray scale colors.';
    return '';
  }

  getColorsByCategory(category: string): any[] {
    return this.paletteArray.controls
      .map((control, index) => ({ control, index }))
      .filter(item => item.control.get('category')?.value === category);
  }

  ngOnInit(): void {
    const data = this.brandService.getSection('colors');
    this.variants = this.variantService.getVariants('colors');
    this.selectedVariant = data.variant;

    this.form = this.fb.group({
      palette: this.fb.array(
        data.palette.map(c => this.createColorGroup(c))
      ),
    });

    this.sub = this.form.valueChanges.subscribe(val => {
      this.brandService.updateSection('colors', val);
    });

    this.brandService.brandData$.subscribe(data => {
      if (this.selectedVariant !== data.colors.variant || this.brandService.getSection('colors').numTones !== data.colors.numTones) {
        this.selectedVariant = data.colors.variant;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onVariantChange(variantId: string): void {
    this.selectedVariant = variantId;
    this.brandService.setVariant('colors', variantId);
  }

  getNumTones(): number {
    return this.brandService.getSection('colors').numTones || 10;
  }

  updateNumTones(delta: number): void {
    const current = this.getNumTones();
    const next = Math.min(15, Math.max(5, current + delta));
    if (next !== current) {
      this.brandService.updateSection('colors', { numTones: next });
      this.refreshAllTones();
    }
  }

  private refreshAllTones(): void {
    this.paletteArray.controls.forEach((control) => {
      const hex = control.get('hex')?.value;
      if (hex) {
        control.patchValue({ tones: this.generateTones(hex) }, { emitEvent: false });
      }
    });
    this.brandService.updateSection('colors', this.form.value);
  }

  addColor(category: string = 'Brand'): void {
    const count = this.getColorsByCategory(category).length + 1;
    const defaultName = category === 'Brand' ? `Accent ${count}` : (category === 'Semantic' ? `Status ${count}` : `Neutral ${count}`);
    const tokenName = `--color-${category.toLowerCase()}-${defaultName.toLowerCase().replace(/\s+/g, '-')}`;

    this.paletteArray.push(this.createColorGroup({
      name: defaultName,
      category: category,
      token: tokenName,
      hex: '#3b82f6',
      rgb: '59, 130, 246',
      cmyk: '76, 47, 0, 4',
      usage: 'Primary actions, links, and key interactions',
    }));
  }

  removeColor(index: number): void {
    if (this.paletteArray.length > 1) {
      this.paletteArray.removeAt(index);
    }
  }

  copyHex(hex: string, index: number): void {
    if (navigator.clipboard && hex) {
      navigator.clipboard.writeText(hex);
      this.copiedHexIndex = index;
      setTimeout(() => {
        if (this.copiedHexIndex === index) {
          this.copiedHexIndex = null;
        }
      }, 1500);
    }
  }

  onHexChange(index: number): void {
    const group = this.paletteArray.at(index);
    let hex = group.get('hex')?.value;

    if (hex && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      
      const rgb = this.hexToRgb(hex);
      if (rgb) {
        const [r, g, b] = rgb.split(', ').map(v => parseInt(v, 10));
        const cmyk = this.rgbToCmyk(r, g, b);
        const tones = this.generateTones(hex);
        group.patchValue({ hex, rgb, cmyk, tones });
      }
    }
  }

  onRgbChange(index: number): void {
    const group = this.paletteArray.at(index);
    const rgb = group.get('rgb')?.value;

    const match = rgb?.match(/^(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})$/);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);

      if (r <= 255 && g <= 255 && b <= 255) {
        const hex = this.rgbToHex(r, g, b);
        const cmyk = this.rgbToCmyk(r, g, b);
        const tones = this.generateTones(hex);
        group.patchValue({ hex, cmyk, tones });
      }
    }
  }

  onCmykChange(index: number): void {
    const group = this.paletteArray.at(index);
    const cmyk = group.get('cmyk')?.value;

    const match = cmyk?.match(/^(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})$/);
    if (match) {
      const c = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);
      const k = parseInt(match[4], 10);

      if (c <= 100 && m <= 100 && y <= 100 && k <= 100) {
        const { r, g, b } = this.cmykToRgb(c, m, y, k);
        const hex = this.rgbToHex(r, g, b);
        const rgbStr = `${r}, ${g}, ${b}`;
        const tones = this.generateTones(hex);
        group.patchValue({ hex, rgb: rgbStr, tones });
      }
    }
  }

  private createColorGroup(color: any): FormGroup {
    const currentNumTones = this.getNumTones();
    const hasDuplicates = color.tones && new Set(color.tones).size !== color.tones.length;
    const tones = (color.tones && color.tones.length === currentNumTones && !hasDuplicates) 
      ? color.tones 
      : this.generateTones(color.hex || '#000000');

    return this.fb.group({
      name: [color.name || ''],
      category: [color.category || 'Brand'],
      token: [color.token || ''],
      hex: [color.hex || '#000000'],
      rgb: [color.rgb || '0, 0, 0'],
      cmyk: [color.cmyk || '0, 0, 0, 100'],
      usage: [color.usage || ''],
      tones: [tones],
    });
  }

  private generateTones(hex: string): string[] {
    const numTones = this.getNumTones();
    const rgbRaw = this.hexToRgb(hex);
    if (!rgbRaw) return [];
    
    const [r, g, b] = rgbRaw.split(', ').map(v => parseInt(v, 10));
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
        const val = Math.round(255 * factor);
        mixedR = mixedG = mixedB = val;
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
      
      mixedR = Math.max(0, Math.min(255, mixedR));
      mixedG = Math.max(0, Math.min(255, mixedG));
      mixedB = Math.max(0, Math.min(255, mixedB));
      
      tones.push(this.rgbToHex(mixedR, mixedG, mixedB));
    }
    
    return Array.from(new Set(tones)).sort((a, b) => this.getLuma(b) - this.getLuma(a));
  }

  private getLuma(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = rgb.split(', ').map(v => parseInt(v, 10));
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  private hexToRgb(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (c: number) => {
      const h = Math.max(0, Math.min(255, c)).toString(16);
      return h.length === 1 ? '0' + h : h;
    };
    return `#${toHex(r)}${toHex(r ? g : g)}${toHex(b)}`.toLowerCase();
  }

  private rgbToCmyk(r: number, g: number, b: number): string {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));

    if (k === 1) {
      c = 0; m = 0; y = 0;
    } else {
      c = Math.round((c - k) / (1 - k) * 100);
      m = Math.round((m - k) / (1 - k) * 100);
      y = Math.round((y - k) / (1 - k) * 100);
    }
    k = Math.round(k * 100);

    return `${c}, ${m}, ${y}, ${k}`;
  }

  private cmykToRgb(c: number, m: number, y: number, k: number): { r: number, g: number, b: number } {
    const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
    const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
    const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
    return { r, g, b };
  }
}
