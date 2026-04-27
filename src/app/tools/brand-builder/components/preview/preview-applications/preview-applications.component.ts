import { Component, Input } from '@angular/core';
import { BrandData } from '../../../models/brand.model';

@Component({
  selector: 'app-preview-applications',
  standalone: true,
  templateUrl: './preview-applications.component.html',
  styleUrl: './preview-applications.component.scss'
})
export class PreviewApplicationsComponent {
  @Input() data!: BrandData;
}
