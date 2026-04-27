import { Component, Input } from '@angular/core';
import { BrandData } from '../../../models/brand.model';

@Component({
  selector: 'app-preview-imagery',
  standalone: true,
  templateUrl: './preview-imagery.component.html',
  styleUrl: './preview-imagery.component.scss'
})
export class PreviewImageryComponent {
  @Input() data!: BrandData;

  get filteredSamples(): string[] {
    return (this.data.imagery.samples || []).filter(s => s);
  }
}
