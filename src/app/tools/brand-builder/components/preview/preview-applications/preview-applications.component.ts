import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandData } from '../../../models/brand.model';

@Component({
  selector: 'app-preview-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-applications.component.html',
  styleUrl: './preview-applications.component.scss'
})
export class PreviewApplicationsComponent {
  @Input() data!: BrandData;
  @Input() pageNumber: string = '07';
  @Input() isPdfView: boolean = false;

  activeHoveredIndex: number | null = null;

  setHoveredIndex(idx: number | null): void {
    this.activeHoveredIndex = idx;
  }
}
