import { Component, Input, inject } from '@angular/core';
import { BrandData } from '../../../models/brand.model';
import { GoogleFontsService } from '../../../services/google-fonts.service';
import { VariantService } from '../../../services/variant.service';

@Component({
  selector: 'app-preview-typography',
  standalone: true,
  templateUrl: './preview-typography.component.html',
  styleUrl: './preview-typography.component.scss'
})
export class PreviewTypographyComponent {
  private fontService = inject(GoogleFontsService);
  private variantService = inject(VariantService);
  private _data!: BrandData;

  @Input() pageNumber: string = '05';
  @Input() isPdfView: boolean = false;

  @Input() 
  set data(val: BrandData) {
    this._data = val;
    this.syncFonts();
  }
  get data(): BrandData {
    return this._data;
  }

  get variantTitle(): string {
    const variantId = this._data?.typography?.variant;
    if (!variantId) return 'Typography System';
    const variant = this.variantService.getVariant('typography', variantId);
    return variant ? variant.name : 'Typography System';
  }

  get fontName(): string {
    return this._data?.typography?.primaryFont || 'Inter';
  }

  get fontTone(): string {
    return this._data?.typography?.tone || 'professional';
  }

  get fontDensity(): string {
    return this._data?.typography?.density || 'comfortable';
  }

  get toneDescriptor(): string {
    const tone = this.fontTone;
    if (tone === 'modern') return 'Clean geometry & modern aesthetic';
    if (tone === 'bold') return 'High contrast display presence';
    return 'Balanced & clean legibility';
  }

  get densityDescriptor(): string {
    const density = this.fontDensity;
    if (density === 'compact') return '1.35x Body • 1.15x Heading';
    return '1.6x Body • 1.25x Heading';
  }

  private syncFonts(): void {
    if (this._data?.typography?.primaryFont) {
      this.fontService.loadFont(this._data.typography.primaryFont);
    }
  }
}
