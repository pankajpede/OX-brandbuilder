import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';
import { VariantService } from '../../../services/variant.service';
import { VariantSelectorComponent } from '../../shared/variant-selector/variant-selector.component';
import { FileUploadComponent } from '../../shared/file-upload/file-upload.component';
import { VariantOption } from '../../../models/brand.model';

@Component({
  selector: 'app-step-applications',
  standalone: true,
  imports: [ReactiveFormsModule, VariantSelectorComponent, FileUploadComponent],
  templateUrl: './step-applications.component.html',
  styleUrl: './step-applications.component.scss'
})
export class StepApplicationsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private variantService = inject(VariantService);
  private sub!: Subscription;

  form!: FormGroup;
  variants: VariantOption[] = [];
  selectedVariant = '';

  ngOnInit(): void {
    const data = this.brandService.getSection('printables');
    this.variants = this.variantService.getVariants('printables');
    this.selectedVariant = data.variant;

    this.form = this.fb.group({
      businessCard: [data.businessCard],
      letterhead: [data.letterhead],
      socialMedia: [data.socialMedia],
    });

    this.sub = this.form.valueChanges.subscribe(val => {
      this.brandService.updateSection('printables', val);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onVariantChange(variantId: string): void {
    this.selectedVariant = variantId;
    this.brandService.setVariant('printables', variantId);
  }

  onFileChange(field: string, base64: string): void {
    this.form.patchValue({ [field]: base64 });
  }
}
