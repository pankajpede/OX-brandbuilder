import { Component, Input } from '@angular/core';
import { BrandData } from '../../../models/brand.model';

@Component({
  selector: 'app-preview-layout',
  standalone: true,
  templateUrl: './preview-layout.component.html',
  styleUrl: './preview-layout.component.scss'
})
export class PreviewLayoutComponent {
  @Input() data!: BrandData;

  get gridColumns(): number[] {
    const grid = this.data.layout.grid || '12-column';
    const count = parseInt(grid) || 12;
    return Array(count).fill(0);
  }

  get spacingSizes(): { label: string; px: number }[] {
    const base = parseInt(this.data.layout.spacing) || 8;
    return [
      { label: '1x', px: base },
      { label: '2x', px: base * 2 },
      { label: '3x', px: base * 3 },
      { label: '4x', px: base * 4 },
      { label: '6x', px: base * 6 },
    ];
  }
}
