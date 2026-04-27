import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';
import { VariantService } from '../../../services/variant.service';
import { GoogleFontSelectorComponent } from '../../shared/google-font-selector/google-font-selector.component';
import { VariantSelectorComponent } from '../../shared/variant-selector/variant-selector.component';
import { VariantOption, TypographyTone, TypographyDensity } from '../../../models/brand.model';

@Component({
  selector: 'app-step-typography',
  standalone: true,
  imports: [ReactiveFormsModule, VariantSelectorComponent, GoogleFontSelectorComponent],
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
    { id: 'professional', label: 'Professional', desc: 'Balanced, standard weights (400/500/600)' },
    { id: 'modern', label: 'Modern', desc: 'Lighter, clean aesthetic (300/400/500)' },
    { id: 'bold', label: 'Bold', desc: 'Heavier, high contrast (400/600/700)' }
  ];

  densities: { id: TypographyDensity, label: string, desc: string }[] = [
    { id: 'compact', label: 'Compact', desc: 'Optimized for information-dense products' },
    { id: 'comfortable', label: 'Comfortable', desc: 'Designed for high readability and focus' }
  ];

  ngOnInit(): void {
    const data = this.brandService.getSection('typography');
    this.variants = this.variantService.getVariants('typography');
    this.selectedVariant = data.variant;

    this.form = this.fb.group({
      primaryFont: [data.primaryFont, Validators.required],
      tone: [data.tone || 'professional'],
      density: [data.density || 'comfortable']
    });

    this.sub = this.form.valueChanges.subscribe(val => {
      this.brandService.updateSection('typography', val);
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
