import { Component, Input } from '@angular/core';
import { BrandData } from '../../../models/brand.model';

@Component({
  selector: 'app-preview-logo',
  standalone: true,
  templateUrl: './preview-logo.component.html',
  styleUrl: './preview-logo.component.scss'
})
export class PreviewLogoComponent {
  @Input() data!: BrandData;
  @Input() itemsOverride?: any[];
  @Input() pageNumber: string = '03';

  get primaryColor(): string {
    if (!this.data?.colors?.palette) return '#4f46e5';
    const primary = this.data.colors.palette.find(c => c.name === 'Primary');
    return primary?.hex || '#4f46e5';
  }

  get uploadedLogos() {
    if (this.itemsOverride) return this.itemsOverride;
    
    if (!this.data?.logo) return [];

    const types = [
      { key: 'primary',    label: 'Primary Logo',    clearSpace: this.data.logo.primaryClearSpace || 24,    minSize: this.data.logo.primaryMinSize || 32 },
      { key: 'secondary',  label: 'Secondary Logo',  clearSpace: this.data.logo.secondaryClearSpace || 24,  minSize: this.data.logo.secondaryMinSize || 32 },
      { key: 'horizontal', label: 'Horizontal Mark', clearSpace: this.data.logo.horizontalClearSpace || 24, minSize: this.data.logo.horizontalMinSize || 32 },
      { key: 'vertical',   label: 'Vertical Mark',   clearSpace: this.data.logo.verticalClearSpace || 24,   minSize: this.data.logo.verticalMinSize || 32 },
      { key: 'icon',       label: 'Icon / Favicon',  clearSpace: this.data.logo.iconClearSpace || 24,       minSize: this.data.logo.iconMinSize || 32 },
      { key: 'monoBlack',  label: 'Mono Black',      clearSpace: this.data.logo.monoBlackClearSpace || 24,  minSize: this.data.logo.monoBlackMinSize || 32 },
      { key: 'monoWhite',  label: 'Mono White',      clearSpace: this.data.logo.monoWhiteClearSpace || 24,  minSize: this.data.logo.monoWhiteMinSize || 32 },
    ];

    const active = types.filter(t => !!(this.data.logo as any)?.[t.key]).map(t => ({
      ...t,
      url: (this.data.logo as any)[t.key]
    }));

    if (active.length > 0) return active;

    return types.slice(0, 4).map(t => ({
      ...t,
      url: ''
    }));
  }
}
