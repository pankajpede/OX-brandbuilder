import { Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { BrandData } from '../../../models/brand.model';

@Component({
  selector: 'app-cover-template',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './cover-template.component.html',
  styleUrl: './cover-template.component.scss'
})
export class CoverTemplateComponent {
  @Input() templateId = 't1';
  @Input() data!: BrandData;

  get brandName(): string {
    return this.data?.cover?.name || 'Brand Name';
  }
  get year(): string {
    return String(this.data?.cover?.year || new Date().getFullYear());
  }
  get gridRows(): number[] { return Array(8).fill(0); }
  get gridCols(): number[] { return Array(6).fill(0); }
}
