import { Component, Input } from '@angular/core';
import { BrandData } from '../../../models/brand.model';
import { SummaryTemplateComponent } from '../summary-template/summary-template.component';

@Component({
  selector: 'app-preview-summary',
  standalone: true,
  imports: [SummaryTemplateComponent],
  templateUrl: './preview-summary.component.html',
  styleUrl: './preview-summary.component.scss'
})
export class PreviewSummaryComponent {
  @Input() data!: BrandData;
}
