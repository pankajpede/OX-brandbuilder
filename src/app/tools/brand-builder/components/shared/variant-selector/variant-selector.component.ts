import { Component, Input, Output, EventEmitter } from '@angular/core';
import { VariantOption } from '../../../models/brand.model';

@Component({
  selector: 'app-variant-selector',
  standalone: true,
  templateUrl: './variant-selector.component.html',
  styleUrl: './variant-selector.component.scss'
})
export class VariantSelectorComponent {
  @Input() variants: VariantOption[] = [];
  @Input() selectedVariant = '';
  @Output() variantSelected = new EventEmitter<string>();

  selectVariant(id: string): void {
    this.variantSelected.emit(id);
  }
}
