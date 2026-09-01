import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandData, ColorEntry, STEPS, TocItem } from '../../models/brand.model';
import { CoverTemplateComponent } from '../preview/cover-template/cover-template.component';
import { SummaryTemplateComponent } from '../preview/summary-template/summary-template.component';
import { PreviewLogoComponent, DocumentedLogoVariant } from '../preview/preview-logo/preview-logo.component';
import { PreviewColorsComponent } from '../preview/preview-colors/preview-colors.component';
import { PreviewTypographyComponent } from '../preview/preview-typography/preview-typography.component';
import { PreviewIconographyComponent } from '../preview/preview-iconography/preview-iconography.component';
import { PreviewTechStackComponent } from '../preview/preview-techstack/preview-techstack.component';

@Component({
  selector: 'app-pdf-template',
  standalone: true,
  imports: [
    CommonModule, 
    CoverTemplateComponent, 
    SummaryTemplateComponent, 
    PreviewLogoComponent, 
    PreviewColorsComponent,
    PreviewTypographyComponent,
    PreviewIconographyComponent,
    PreviewTechStackComponent
  ],
  templateUrl: './pdf-template.component.html'
})
export class PdfTemplateComponent {
  @Input({ required: true }) brandData!: BrandData;

  get coverTemplateId(): string {
    return this.brandData?.cover?.variant || 't1';
  }

  get summaryTemplateId(): string {
    return this.brandData?.summary?.variant || 's1';
  }

  get primaryColor(): string {
    if (!this.brandData?.colors?.palette) return '#4f46e5';
    const primary = this.brandData.colors.palette.find(c => c.name === 'Primary');
    return primary?.hex || '#4f46e5';
  }

  get brandName(): string {
    return this.brandData?.cover?.name || 'Brand Name';
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  get tocItems(): TocItem[] {
    const enabled = this.brandData?.summary?.enabledSections || [];
    const activeSteps = STEPS.filter(s => enabled.includes(s.id));
    
    let currentPage = 1;

    return activeSteps.map((step, index) => {
      const pageStr = currentPage < 10 ? `0${currentPage}` : `${currentPage}`;
      const itemNum = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
      
      if (step.id === 'logo') {
        const logo = this.brandData?.logo;
        const variant = logo?.variant || 'grid';
        const types = ['primary', 'secondary', 'horizontal', 'vertical', 'icon', 'monoBlack', 'monoWhite'];
        const uploadedCount = types.filter(k => !!(logo as any)?.[k]).length;
        const logoCount = uploadedCount > 0 ? uploadedCount : 4;
        const chunkSize = variant === 'documented' ? 4 : 9;
        const pageCount = Math.max(1, Math.ceil(logoCount / chunkSize));
        currentPage += pageCount;
      } else if (step.id === 'colors') {
        const palette = this.brandData?.colors?.palette || [];
        const chunkSize = 5;
        const pageCount = Math.max(1, Math.ceil((palette.length || 5) / chunkSize));
        currentPage += pageCount;
      } else {
        currentPage += 1;
      }

      return {
        id:    step.id,
        num:   itemNum,
        label: step.id === 'cover' ? 'Brand Details' : (step.id === 'colors' ? 'Color System' : step.title),
        sub:   step.subtitle,
        page:  pageStr,
        icon:  step.icon
      };
    });
  }

  get allUploadedLogos(): DocumentedLogoVariant[] {
    if (!this.brandData?.logo) return [];
    const logoData = this.brandData.logo;
    const types = [
      { key: 'primary', label: 'Primary Logo', subtitle: 'Main brand representation', bgClass: 'bg-white' },
      { key: 'secondary', label: 'Secondary Logo', subtitle: 'Alternate brand representation', bgClass: 'bg-white' },
      { key: 'horizontal', label: 'Horizontal Layout', subtitle: 'Horizontal logo lockup', bgClass: 'bg-white' },
      { key: 'vertical', label: 'Vertical Layout', subtitle: 'Vertical logo lockup', bgClass: 'bg-white' },
      { key: 'icon', label: 'Icon / Favicon', subtitle: 'Compact digital use', bgClass: 'bg-white' },
      { key: 'monoBlack', label: 'Mono Black', subtitle: 'Single-color dark version', bgClass: 'bg-white' },
      { key: 'monoWhite', label: 'Mono White', subtitle: 'Single-color light version', bgClass: 'bg-[#171717]' },
    ];

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
    return types.slice(0, 4).map(t => ({
      layoutVariantId: t.key,
      name: t.label,
      subtitle: t.subtitle,
      url: '',
      bgClass: t.bgClass
    }));
  }

  get logoPageChunks(): { items: DocumentedLogoVariant[]; pageNum: string }[] {
    const variant = this.brandData?.logo?.variant || 'grid';
    const logos = this.allUploadedLogos;
    if (logos.length === 0) return [{ items: [], pageNum: '03' }];

    const chunkSize = variant === 'documented' ? 4 : 9;

    if (logos.length <= chunkSize) {
      return [{ items: logos, pageNum: '03' }];
    }

    const chunks: { items: DocumentedLogoVariant[]; pageNum: string }[] = [];
    for (let i = 0; i < logos.length; i += chunkSize) {
      const slice = logos.slice(i, i + chunkSize);
      const pageInt = 3 + chunks.length;
      const pageNum = pageInt < 10 ? `0${pageInt}` : `${pageInt}`;
      chunks.push({ items: slice, pageNum });
    }

    return chunks;
  }

  get colorPageChunks(): { items: ColorEntry[]; pageNum: string }[] {
    const palette = this.brandData?.colors?.palette || [];
    if (palette.length === 0) return [{ items: [], pageNum: '04' }];

    const logoPagesCount = this.logoPageChunks.length;
    const startPage = 3 + logoPagesCount;

    const chunkSize = 5;

    if (palette.length <= chunkSize) {
      const pageStr = startPage < 10 ? `0${startPage}` : `${startPage}`;
      return [{ items: palette, pageNum: pageStr }];
    }

    const chunks: { items: ColorEntry[]; pageNum: string }[] = [];
    for (let i = 0; i < palette.length; i += chunkSize) {
      const slice = palette.slice(i, i + chunkSize);
      const pageInt = startPage + chunks.length;
      const pageNum = pageInt < 10 ? `0${pageInt}` : `${pageInt}`;
      chunks.push({ items: slice, pageNum });
    }

    return chunks;
  }

  get typographyPageNum(): string {
    const startPage = 3 + this.logoPageChunks.length + this.colorPageChunks.length;
    return startPage < 10 ? `0${startPage}` : `${startPage}`;
  }

  get iconographyPageNum(): string {
    const startPage = 3 + this.logoPageChunks.length + this.colorPageChunks.length + 1;
    return startPage < 10 ? `0${startPage}` : `${startPage}`;
  }

  get techstackPageNum(): string {
    const startPage = 3 + this.logoPageChunks.length + this.colorPageChunks.length + 2;
    return startPage < 10 ? `0${startPage}` : `${startPage}`;
  }
}
