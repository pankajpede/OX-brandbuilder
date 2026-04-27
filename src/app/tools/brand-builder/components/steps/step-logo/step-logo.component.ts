import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';
import { VariantService } from '../../../services/variant.service';
import { VariantSelectorComponent } from '../../shared/variant-selector/variant-selector.component';
import { FileUploadComponent } from '../../shared/file-upload/file-upload.component';
import { VariantOption } from '../../../models/brand.model';

@Component({
  selector: 'app-step-logo',
  standalone: true,
  imports: [ReactiveFormsModule, VariantSelectorComponent, FileUploadComponent],
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
      clearSpace: [data.clearSpace],
      minSize: [data.minSize],
    });

    this.sub = this.form.valueChanges.subscribe(val => {
      this.brandService.updateSection('logo', val);
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
}
