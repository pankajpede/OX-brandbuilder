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

  get uploadedLogos() {
    const types = [
      { key: 'primary',    label: 'Primary Logo',    clearSpace: this.data.logo.primaryClearSpace,    minSize: this.data.logo.primaryMinSize },
      { key: 'secondary',  label: 'Secondary Logo',  clearSpace: this.data.logo.secondaryClearSpace,  minSize: this.data.logo.secondaryMinSize },
      { key: 'horizontal', label: 'Horizontal Mark', clearSpace: this.data.logo.horizontalClearSpace, minSize: this.data.logo.horizontalMinSize },
      { key: 'vertical',   label: 'Vertical Mark',   clearSpace: this.data.logo.verticalClearSpace,   minSize: this.data.logo.verticalMinSize },
      { key: 'icon',       label: 'Icon / Favicon',  clearSpace: this.data.logo.iconClearSpace,       minSize: this.data.logo.iconMinSize },
      { key: 'monoBlack',  label: 'Mono Black',      clearSpace: this.data.logo.monoBlackClearSpace,  minSize: this.data.logo.monoBlackMinSize },
      { key: 'monoWhite',  label: 'Mono White',      clearSpace: this.data.logo.monoWhiteClearSpace,  minSize: this.data.logo.monoWhiteMinSize },
    ];

    return types.filter(t => !!(this.data.logo as any)[t.key]).map(t => ({
      ...t,
      url: (this.data.logo as any)[t.key]
    }));
  }
}
