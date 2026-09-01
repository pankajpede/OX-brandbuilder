import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BrandService } from '../../../services/brand.service';
import { VariantService } from '../../../services/variant.service';
import { VariantSelectorComponent } from '../../shared/variant-selector/variant-selector.component';
import { FileUploadComponent } from '../../shared/file-upload/file-upload.component';
import { VariantOption } from '../../../models/brand.model';

@Component({
  selector: 'app-step-logo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VariantSelectorComponent, FileUploadComponent],
  templateUrl: './step-logo.component.html',
  styleUrl: './step-logo.component.scss'
})
export class StepLogoComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private variantService = inject(VariantService);
  private sub!: Subscription;

  form!: FormGroup;
  variants: VariantOption[] = [];
  selectedVariant = '';
  showOverrides = false;

  clearSpaceRules = [
    { id: '1x-symbol', label: '1× Symbol Height', desc: 'Space equal to symbol height' },
    { id: '1x-logo', label: '1× Logo Height', desc: 'Space equal to total logo height' },
    { id: 'custom', label: 'Custom (px)', desc: 'Set explicit pixel boundary' }
  ];

  logoVariantsConfig = [
    { field: 'primary', label: 'Primary Logo', subtitle: 'Main brand representation', bgClass: 'bg-white' },
    { field: 'secondary', label: 'Secondary Logo', subtitle: 'Alternate brand representation', bgClass: 'bg-white' },
    { field: 'horizontal', label: 'Horizontal Layout', subtitle: 'Horizontal logo lockup', bgClass: 'bg-white' },
    { field: 'vertical', label: 'Vertical Layout', subtitle: 'Vertical logo lockup', bgClass: 'bg-white' },
    { field: 'icon', label: 'Icon / Favicon', subtitle: 'Compact digital use', bgClass: 'bg-white' },
    { field: 'monoBlack', label: 'Mono Black', subtitle: 'Single-color dark version', bgClass: 'bg-white' },
    { field: 'monoWhite', label: 'Mono White', subtitle: 'Single-color light version', bgClass: 'bg-[#171717]' },
  ];

  ngOnInit(): void {
    const data = this.brandService.getSection('logo');
    this.variants = this.variantService.getVariants('logo');
    this.selectedVariant = data.variant;

    this.form = this.fb.group({
      primary: [data.primary],
      secondary: [data.secondary],
      horizontal: [data.horizontal],
      vertical: [data.vertical],
      icon: [data.icon],
      monoBlack: [data.monoBlack],
      monoWhite: [data.monoWhite],
      clearSpaceRule: [data.clearSpaceRule || '1x-symbol'],
      customClearSpace: [data.customClearSpace || data.clearSpace || 24],
      minSizeDigital: [data.minSizeDigital || data.minSize || 32],
      minSizePrint: [data.minSizePrint || 10],
      primaryClearSpace: [data.primaryClearSpace],
      primaryMinSize: [data.primaryMinSize],
      secondaryClearSpace: [data.secondaryClearSpace],
      secondaryMinSize: [data.secondaryMinSize],
      horizontalClearSpace: [data.horizontalClearSpace],
      horizontalMinSize: [data.horizontalMinSize],
      verticalClearSpace: [data.verticalClearSpace],
      verticalMinSize: [data.verticalMinSize],
      iconClearSpace: [data.iconClearSpace],
      iconMinSize: [data.iconMinSize],
      monoBlackClearSpace: [data.monoBlackClearSpace],
      monoBlackMinSize: [data.monoBlackMinSize],
      monoWhiteClearSpace: [data.monoWhiteClearSpace],
      monoWhiteMinSize: [data.monoWhiteMinSize],
      clearSpace: [data.clearSpace || 24],
      minSize: [data.minSize || 32],
    });

    this.sub = this.form.valueChanges.subscribe(val => {
      // Sync legacy fields for backwards compatibility
      const syncedVal = {
        ...val,
        clearSpace: val.clearSpaceRule === 'custom' ? val.customClearSpace : (val.clearSpaceRule === '1x-logo' ? 36 : 24),
        minSize: val.minSizeDigital
      };
      this.brandService.updateSection('logo', syncedVal);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onVariantChange(variantId: string): void {
    this.selectedVariant = variantId;
    this.brandService.setVariant('logo', variantId);
  }

  onFileChange(field: string, base64: string): void {
    this.form.patchValue({ [field]: base64 });
  }

  toggleOverrides(): void {
    this.showOverrides = !this.showOverrides;
  }

  getClearSpaceText(): string {
    const rule = this.form.get('clearSpaceRule')?.value;
    if (rule === '1x-symbol') return '1× Symbol Height';
    if (rule === '1x-logo') return '1× Logo Height';
    return `${this.form.get('customClearSpace')?.value || 24}px`;
  }
}
