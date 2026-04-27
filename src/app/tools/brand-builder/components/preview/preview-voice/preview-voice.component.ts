import { Component, Input } from '@angular/core';
import { BrandData } from '../../../models/brand.model';

@Component({
  selector: 'app-preview-voice',
  standalone: true,
  templateUrl: './preview-voice.component.html',
  styleUrl: './preview-voice.component.scss'
})
export class PreviewVoiceComponent {
  @Input() data!: BrandData;
}
