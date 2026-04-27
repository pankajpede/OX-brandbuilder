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

  private syncFonts(): void {
    if (this._data?.typography?.primaryFont) {
      this.fontService.loadFont(this._data.typography.primaryFont);
    }
  }
}
