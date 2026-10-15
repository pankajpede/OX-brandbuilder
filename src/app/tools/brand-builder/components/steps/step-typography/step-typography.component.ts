import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BrandService } from '../../../services/brand.service';
import { VariantService } from '../../../services/variant.service';
import { GoogleFontSelectorComponent } from '../../shared/google-font-selector/google-font-selector.component';
import { VariantSelectorComponent } from '../../shared/variant-selector/variant-selector.component';
import { VariantOption, TypographyTone, TypographyDensity, BrandTypography, FontFamilyEntry } from '../../../models/brand.model';

@Component({
  selector: 'app-step-typography',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VariantSelectorComponent, GoogleFontSelectorComponent],
  templateUrl: './step-typography.component.html',
  styleUrl: './step-typography.component.scss'
})
export class StepTypographyComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private variantService = inject(VariantService);
  private sub!: Subscription;

  form!: FormGroup;
  variants: VariantOption[] = [];
  selectedVariant = '';

  tones: { id: TypographyTone, label: string, desc: string }[] = [
    { id: 'professional', label: 'Professional', desc: 'Balanced, standard weights (400 / 500 / 600)' },
    { id: 'modern', label: 'Modern', desc: 'Lighter, clean aesthetic (300 / 400 / 500)' },
    { id: 'bold', label: 'Bold', desc: 'Heavier, high contrast (400 / 600 / 700)' }
  ];

  densities: { id: TypographyDensity, label: string, desc: string }[] = [
    { id: 'compact', label: 'Compact', desc: 'Optimized for information-dense products' },
    { id: 'comfortable', label: 'Comfortable', desc: 'Designed for high readability and focus' }
  ];

  get currentFont(): string {
    return this.form?.get('primaryFont')?.value || 'Inter';
  }

  get currentStyle(): TypographyTone {
    return this.form?.get('tone')?.value || 'professional';
  }

  get currentDensity(): TypographyDensity {
    return this.form?.get('density')?.value || 'comfortable';
  }

  getWeightsForTone(style: TypographyTone): string[] {
    if (style === 'modern') return ['300 Light', '400 Regular', '500 Medium'];
    if (style === 'bold') return ['400 Regular', '600 Semibold', '700 Bold'];
    return ['400 Regular', '500 Medium', '600 Semibold'];
  }

  getScaleForFamily(style: TypographyTone): { label: string; size: string; line: string; weight: string }[] {
    const isCompact = this.currentDensity === 'compact';
    const isBold = style === 'bold';
    const isModern = style === 'modern';

    const mainWeight = isBold ? '700' : (isModern ? '500' : '600');
    const bodyWeight = isModern ? '300' : '400';

    return [
      { label: 'Display', size: isCompact ? '40px' : '48px', line: isCompact ? '48px' : '56px', weight: mainWeight },
      { label: 'H1', size: isCompact ? '32px' : '36px', line: isCompact ? '40px' : '44px', weight: mainWeight },
      { label: 'H2', size: isCompact ? '24px' : '28px', line: isCompact ? '32px' : '36px', weight: mainWeight },
      { label: 'H3', size: isCompact ? '20px' : '22px', line: isCompact ? '28px' : '30px', weight: mainWeight },
      { label: 'Body', size: isCompact ? '14px' : '16px', line: isCompact ? '20px' : '24px', weight: bodyWeight },
      { label: 'Small', size: isCompact ? '12px' : '14px', line: isCompact ? '18px' : '20px', weight: bodyWeight },
    ];
  }

  get typographyData(): BrandTypography {
    return this.brandService.getSection('typography');
  }

  useRecommendedFont(): void {
    const fallback = this.typographyData.fallbackFont || 'Inter';
    this.form.patchValue({ primaryFont: fallback });
    this.brandService.updateSection('typography', {
      primaryFont: fallback,
      isCustomWebFont: false
    });
  }

  keepActualFontName(): void {
    this.brandService.updateSection('typography', {
      isCustomWebFont: false
    });
  }

  get fontFamilies(): FontFamilyEntry[] {
    const data = this.brandService.getSection('typography');
    if (!data.fontFamilies || data.fontFamilies.length === 0) {
      return [
        { role: 'primary', fontFamily: data.primaryFont || 'Inter', tone: data.tone || 'professional' }
      ];
    }
    return data.fontFamilies;
  }

  addFontFamily(): void {
    const current = [...this.fontFamilies];
    current.push({
      role: 'secondary',
      fontFamily: 'Outfit',
      tone: 'modern'
    });
    this.brandService.updateSection('typography', { fontFamilies: current });
  }

  removeFontFamily(index: number): void {
    const current = [...this.fontFamilies];
    if (current.length > 1) {
      current.splice(index, 1);
      this.brandService.updateSection('typography', { fontFamilies: current });
    }
  }

  updateFontFamilyName(index: number, fontFamily: string): void {
    const current = [...this.fontFamilies];
    if (current[index] && fontFamily) {
      current[index] = { ...current[index], fontFamily };
      if (index === 0) {
        this.form.patchValue({ primaryFont: fontFamily }, { emitEvent: false });
      }
      this.brandService.updateSection('typography', {
        primaryFont: current[0].fontFamily,
        fontFamilies: current
      });
    }
  }

  updateFontFamilyRole(index: number, role: 'primary' | 'secondary' | 'display' | 'body' | 'code'): void {
    const current = [...this.fontFamilies];
    if (current[index]) {
      current[index] = { ...current[index], role };
      this.brandService.updateSection('typography', { fontFamilies: current });
    }
  }

  updateFontFamilyTone(index: number, tone: TypographyTone): void {
    const current = [...this.fontFamilies];
    if (current[index]) {
      current[index] = { ...current[index], tone };
      this.brandService.updateSection('typography', { fontFamilies: current });
    }
  }

  ngOnInit(): void {
    const data = this.brandService.getSection('typography');
    this.variants = this.variantService.getVariants('typography');
    this.selectedVariant = data.variant;

    this.form = this.fb.group({
      primaryFont: [data.primaryFont || 'Inter', Validators.required],
      tone: [data.tone || 'professional'],
      density: [data.density || 'comfortable']
    });

    this.sub = this.form.valueChanges.subscribe(val => {
      // Sync primary font family entry in fontFamilies list
      const list = [...this.fontFamilies];
      if (list.length > 0 && val.primaryFont) {
        list[0] = { ...list[0], fontFamily: val.primaryFont, tone: val.tone };
      }
      this.brandService.updateSection('typography', {
        ...val,
        fontFamilies: list
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onVariantChange(variantId: string): void {
    this.selectedVariant = variantId;
    this.brandService.setVariant('typography', variantId);
  }

  setTone(tone: TypographyTone): void {
    this.form.patchValue({ tone });
  }

  setDensity(density: TypographyDensity): void {
    this.form.patchValue({ density });
  }
}
