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

  get primaryColor(): string {
    if (!this.data?.colors?.palette) return '#4f46e5';
    const primary = this.data.colors.palette.find(c => c.name === 'Primary');
    return primary?.hex || '#4f46e5';
  }

  get darkPrimaryColor(): string {
    const hex = this.primaryColor;
    if (hex.startsWith('#') && hex.length === 7) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const dr = Math.round(r * 0.3);
      const dg = Math.round(g * 0.3);
      const db = Math.round(b * 0.3);
      return `rgb(${dr}, ${dg}, ${db})`;
    }
    return '#1e1b4b';
  }

  get gridRows(): number[] { return Array(8).fill(0); }
  get gridCols(): number[] { return Array(6).fill(0); }
}
