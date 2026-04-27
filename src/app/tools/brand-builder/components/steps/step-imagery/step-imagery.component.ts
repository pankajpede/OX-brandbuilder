import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';
import { VariantService } from '../../../services/variant.service';
import { VariantSelectorComponent } from '../../shared/variant-selector/variant-selector.component';
import { FileUploadComponent } from '../../shared/file-upload/file-upload.component';
import { VariantOption } from '../../../models/brand.model';

@Component({
  selector: 'app-step-imagery',
  standalone: true,
  imports: [ReactiveFormsModule, VariantSelectorComponent, FileUploadComponent],
  templateUrl: './step-imagery.component.html',
  styleUrl: './step-imagery.component.scss'
})
export class StepImageryComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private variantService = inject(VariantService);
  private sub!: Subscription;

  form!: FormGroup;
  variants: VariantOption[] = [];
  selectedVariant = '';
  samples: string[] = [];

  ngOnInit(): void {
    const data = this.brandService.getSection('imagery');
    this.variants = this.variantService.getVariants('imagery');
    this.selectedVariant = data.variant;
    this.samples = [...(data.samples || [])];

    if (this.samples.length === 0) {
      this.samples = ['', '', ''];
    }

    this.form = this.fb.group({
      style: [data.style],
    });

    this.sub = this.form.valueChanges.subscribe(val => {
      this.brandService.updateSection('imagery', { ...val, samples: this.samples.filter(s => s) });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onVariantChange(variantId: string): void {
    this.selectedVariant = variantId;
    this.brandService.setVariant('imagery', variantId);
  }

  onSampleChange(index: number, base64: string): void {
    this.samples[index] = base64;
    this.brandService.updateSection('imagery', { samples: this.samples.filter(s => s) });
  }

  addSampleSlot(): void {
    if (this.samples.length < 6) {
      this.samples.push('');
    }
  }
}
