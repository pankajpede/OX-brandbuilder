import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-chip-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipInputComponent),
      multi: true,
    },
  ],
  templateUrl: './chip-input.component.html',
  styleUrl: './chip-input.component.scss'
})
export class ChipInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Type and press Enter';

  chips: string[] = [];

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[]): void {
    this.chips = value || [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    if (event.key === 'Enter' && value) {
      event.preventDefault();
      if (!this.chips.includes(value)) {
        this.chips = [...this.chips, value];
        this.onChange(this.chips);
      }
      input.value = '';
    }

    if (event.key === 'Backspace' && !value && this.chips.length > 0) {
      this.chips = this.chips.slice(0, -1);
      this.onChange(this.chips);
    }
  }

  onInputBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && !this.chips.includes(value)) {
      this.chips = [...this.chips, value];
      this.onChange(this.chips);
    }
    input.value = '';
    this.onTouched();
  }

  removeChip(chip: string): void {
    this.chips = this.chips.filter(c => c !== chip);
    this.onChange(this.chips);
  }
}
