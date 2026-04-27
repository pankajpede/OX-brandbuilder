import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';

@Component({
  selector: 'app-step-layout',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-layout.component.html',
  styleUrl: './step-layout.component.scss'
})
export class StepLayoutComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private sub!: Subscription;

  form!: FormGroup;

  radiusOptions = [
    { value: '0px', label: 'Sharp' },
    { value: '4px', label: 'Subtle' },
    { value: '8px', label: 'Rounded' },
    { value: '16px', label: 'Pill' },
  ];

  get gridColumns(): number[] {
    const grid = this.form?.get('grid')?.value || '12-column';
    const count = parseInt(grid) || 12;
    return Array(count).fill(0);
  }

  ngOnInit(): void {
    const data = this.brandService.getSection('layout');

    this.form = this.fb.group({
      grid: [data.grid],
      spacing: [data.spacing],
      radius: [data.radius],
    });

    this.sub = this.form.valueChanges.subscribe(val => {
      this.brandService.updateSection('layout', val);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  setRadius(value: string): void {
    this.form.patchValue({ radius: value });
  }
}
