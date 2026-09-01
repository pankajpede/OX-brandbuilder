import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandData } from '../../../models/brand.model';

export interface DocumentedLogoVariant {
  layoutVariantId: string;
  name: string;
  subtitle: string;
  url: string;
  bgClass: string;
  clearSpaceText?: string;
  minSizeText?: string;
}

@Component({
  selector: 'app-preview-logo',
  standalone: true,
  imports: [CommonModule],
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

  get documentedVariants(): DocumentedLogoVariant[] {
    if (this.itemsOverride) return this.itemsOverride;
    if (!this.data?.logo) return [];

    const types = [
      { key: 'primary', label: 'Primary Logo', subtitle: 'Main brand representation', bgClass: 'bg-white' },
      { key: 'secondary', label: 'Secondary Logo', subtitle: 'Alternate brand representation', bgClass: 'bg-white' },
      { key: 'horizontal', label: 'Horizontal Layout', subtitle: 'Horizontal logo lockup', bgClass: 'bg-white' },
      { key: 'vertical', label: 'Vertical Layout', subtitle: 'Vertical logo lockup', bgClass: 'bg-white' },
      { key: 'icon', label: 'Icon / Favicon', subtitle: 'Compact digital use', bgClass: 'bg-white' },
      { key: 'monoBlack', label: 'Mono Black', subtitle: 'Single-color dark version', bgClass: 'bg-white' },
      { key: 'monoWhite', label: 'Mono White', subtitle: 'Single-color light version', bgClass: 'bg-[#171717]' },
    ];

    const logoData = this.data.logo;

    // Filter active items with uploaded URLs
    const active = types.filter(t => !!(logoData as any)?.[t.key]).map(t => {
      const url = (logoData as any)[t.key];
      const customCS = (logoData as any)[`${t.key}ClearSpace`];
      const customMS = (logoData as any)[`${t.key}MinSize`];

      let clearSpaceText: string | undefined;
      if (customCS) {
        clearSpaceText = `${customCS}px clear space`;
      } else if (logoData.clearSpaceRule === 'custom' && logoData.customClearSpace) {
        clearSpaceText = `${logoData.customClearSpace}px clear space`;
      } else if (logoData.clearSpaceRule === '1x-symbol') {
        clearSpaceText = '1× Symbol Height clear space';
      } else if (logoData.clearSpaceRule === '1x-logo') {
        clearSpaceText = '1× Logo Height clear space';
      }

      let minSizeText: string | undefined;
      if (customMS) {
        minSizeText = `Min: ${customMS}px`;
      } else if (logoData.minSizeDigital || logoData.minSizePrint) {
        const parts: string[] = [];
        if (logoData.minSizeDigital) parts.push(`${logoData.minSizeDigital}px digital`);
        if (logoData.minSizePrint) parts.push(`${logoData.minSizePrint}mm print`);
        minSizeText = `Min: ${parts.join(' / ')}`;
      }

      return {
        layoutVariantId: t.key,
        name: t.label,
        subtitle: t.subtitle,
        url,
        bgClass: t.bgClass,
        clearSpaceText,
        minSizeText
      };
    });

    if (active.length > 0) return active;

    // Fallback if no logo uploaded yet
    return types.slice(0, 4).map(t => ({
      layoutVariantId: t.key,
      name: t.label,
      subtitle: t.subtitle,
      url: '',
      bgClass: t.bgClass
    }));
  }

  // Legacy getter compatibility
  get uploadedLogos() {
    return this.documentedVariants.map(v => ({
      key: v.layoutVariantId,
      label: v.name,
      url: v.url,
      clearSpace: 24,
      minSize: 32
    }));
  }
}
