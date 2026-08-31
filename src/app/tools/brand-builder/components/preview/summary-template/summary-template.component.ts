import { Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { BrandData, STEPS, TocItem } from '../../../models/brand.model';

@Component({
  selector: 'app-summary-template',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './summary-template.component.html',
  styleUrl: './summary-template.component.scss'
})
export class SummaryTemplateComponent {
  @Input() templateId = 's1';
  @Input() data!: BrandData;

  get brandName(): string {
    return this.data?.cover?.name || 'Brand Name';
  }
  get year(): string {
    return String(this.data?.cover?.year || new Date().getFullYear());
  }

  get primaryColor(): string {
    if (!this.data?.colors?.palette) return '#4f46e5';
    const primary = this.data.colors.palette.find(c => c.name === 'Primary');
    return primary?.hex || '#4f46e5';
  }

  get tocItems(): TocItem[] {
    const enabled = this.data?.summary?.enabledSections || [];
    const activeSteps = STEPS.filter(s => enabled.includes(s.id));
    
    let currentPage = 1;

    return activeSteps.map((step, index) => {
      const pageStr = currentPage < 10 ? `0${currentPage}` : `${currentPage}`;
      const itemNum = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
      
      if (step.id === 'logo') {
        const logo = this.data?.logo;
        const variant = logo?.variant || 'grid';
        const types = ['primary', 'secondary', 'horizontal', 'vertical', 'icon', 'monoBlack', 'monoWhite'];
        const uploadedCount = types.filter(k => !!(logo as any)?.[k]).length;
        const logoCount = uploadedCount > 0 ? uploadedCount : 4;
        const chunkSize = variant === 'documented' ? 4 : 9;
        const pageCount = Math.max(1, Math.ceil(logoCount / chunkSize));
        currentPage += pageCount;
      } else if (step.id === 'colors') {
        const palette = this.data?.colors?.palette || [];
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
}
