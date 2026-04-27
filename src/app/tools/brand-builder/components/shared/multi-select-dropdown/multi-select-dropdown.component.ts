import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, HostListener, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectDropdownComponent),
      multi: true,
    },
  ],
  templateUrl: './multi-select-dropdown.component.html',
  styleUrl: './multi-select-dropdown.component.scss'
})
export class MultiSelectDropdownComponent implements ControlValueAccessor {
  @Input() options: string[] = [];
  @Input() placeholder = 'Select options...';
  @Input() maxSelections = 3;

  selected: string[] = [];
  isOpen = false;
  isDisabled = false;
  searchTerm = '';

  private elRef = inject(ElementRef);
  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  get filteredOptions(): string[] {
    if (!this.searchTerm) return this.options;
    const term = this.searchTerm.toLowerCase();
    return this.options.filter(o => o.toLowerCase().includes(term));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchTerm = '';
    }
  }

  writeValue(value: string[]): void {
    this.selected = value || [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.searchTerm = '';
      this.onTouched();
    }
  }

  isSelected(option: string): boolean {
    return this.selected.includes(option);
  }

  toggleOption(option: string): void {
    if (this.isSelected(option)) {
      this.selected = this.selected.filter(s => s !== option);
    } else {
      if (this.selected.length < this.maxSelections) {
        this.selected = [...this.selected, option];
      }
    }
    this.onChange(this.selected);
  }

  removeItem(item: string): void {
    this.selected = this.selected.filter(s => s !== item);
    this.onChange(this.selected);
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }
}
