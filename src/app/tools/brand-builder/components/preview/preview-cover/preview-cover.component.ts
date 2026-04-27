import { Component, Input } from '@angular/core';
import { BrandData } from '../../../models/brand.model';
import { CoverTemplateComponent } from '../cover-template/cover-template.component';

@Component({
  selector: 'app-preview-cover',
  standalone: true,
  imports: [CoverTemplateComponent],
  templateUrl: './preview-cover.component.html',
  styleUrl: './preview-cover.component.scss'
})
export class PreviewCoverComponent {
  @Input() data!: BrandData;
}
