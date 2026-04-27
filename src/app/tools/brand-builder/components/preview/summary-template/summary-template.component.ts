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

  get tocItems(): TocItem[] {
    const enabled = this.data?.summary?.enabledSections || [];
    
    // map enabled section IDs to their metadata in STEPS
    const activeSteps = STEPS.filter(s => enabled.includes(s.id));
    
    // transform to TocItem format for templates
    return activeSteps.map((step, index) => {
      const pageNum = index + 1;
      const displayPage = pageNum < 10 ? `0${pageNum}` : `${pageNum}`;
      const itemNum = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
      
      return {
        id:    step.id,
        num:   itemNum,
        label: step.title,
        sub:   step.subtitle,
        page:  displayPage,
        icon:  step.icon
      };
    });
  }
}
