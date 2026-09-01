import { Component, Input, OnInit, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { GoogleFontsService, GoogleFont } from '../../../services/google-fonts.service';

@Component({
  selector: 'app-google-font-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './google-font-selector.component.html',
  styleUrl: './google-font-selector.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GoogleFontSelectorComponent),
      multi: true
    }
  ]
})
export class GoogleFontSelectorComponent implements OnInit, ControlValueAccessor {
  private fontService = inject(GoogleFontsService);

  @Input() label = 'Select Font';
  @Input() placeholder = 'Search fonts...';

  // State
  isOpen = false;
  selectedValue = '';
  searchQuery = '';
  selectedCategory = 'all';

  categories = [
    { id: 'all', label: 'All' },
    { id: 'serif', label: 'Serif' },
    { id: 'sans-serif', label: 'Sans-Serif' },
    { id: 'display', label: 'Display' },
    { id: 'handwriting', label: 'Handwriting' },
    { id: 'monospace', label: 'Monospace' }
  ];

  filteredFonts: GoogleFont[] = [];
  allFonts: GoogleFont[] = [];

  // ControlValueAccessor
  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit(): void {
    this.fontService.fonts$.subscribe(fonts => {
      this.allFonts = fonts;
      this.filterFonts();
    });
  }

  getSelectedFontObj(): GoogleFont | undefined {
    return this.allFonts.find(f => f.family.toLowerCase() === this.selectedValue.toLowerCase());
  }

  getSelectedCategoryLabel(): string {
    const f = this.getSelectedFontObj();
    return f ? f.category : 'Sans-Serif';
  }

  filterFonts(): void {
    let filtered = this.allFonts;

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(f => f.family.toLowerCase().includes(q));
    }

    this.filteredFonts = filtered.slice(0, 50); // Limit rendered items for performance
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        const input = document.querySelector('.font-search-input') as HTMLInputElement;
        input?.focus();
      }, 0);
    }
  }

  selectFont(font: GoogleFont): void {
    this.selectedValue = font.family;
    this.isOpen = false;
    this.searchQuery = '';
    this.fontService.loadFont(font.family);
    this.onChange(font.family);
    this.onTouched();
    this.filterFonts();
  }

  onSearchChange(): void {
    this.filterFonts();
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
    this.filterFonts();
  }

  // CVA Implementation
  writeValue(value: any): void {
    this.selectedValue = value || '';
    if (this.selectedValue) {
      this.fontService.loadFont(this.selectedValue);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }
}
