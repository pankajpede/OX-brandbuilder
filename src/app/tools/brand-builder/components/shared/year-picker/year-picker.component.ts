import { Component, Input, forwardRef, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-year-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YearPickerComponent),
      multi: true,
    },
  ],
  templateUrl: './year-picker.component.html',
  styleUrl: './year-picker.component.scss',
  host: { 'class': 'block w-full' }
})
export class YearPickerComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder = 'Select Year';
  @Input() minYear = 1900;
  @Input() maxYear = new Date().getFullYear();

  selectedYear: number | null = null;
  years: number[] = [];
  isOpen = false;
  isDisabled = false;

  private elRef = inject(ElementRef);
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.generateYears();
  }

  generateYears(): void {
    const list = [];
    for (let y = this.maxYear; y >= this.minYear; y--) {
      list.push(y);
    }
    this.years = list;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  writeValue(value: any): void {
    // If null/undefined, explicitly set our internal selectedYear.
    // However, if we want strict ControlValueAccessor behavior, we follow the value.
    // Since the model now guarantees a year, this is mostly a safety check.
    this.selectedYear = value || null;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggleDropdown(): void {
    if (this.isDisabled) return;
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.onTouched();
    }
  }

  selectYear(year: number): void {
    this.selectedYear = year;
    this.onChange(this.selectedYear);
    this.isOpen = false;
  }

  isSelected(year: number): boolean {
    return this.selectedYear === year;
  }
}
