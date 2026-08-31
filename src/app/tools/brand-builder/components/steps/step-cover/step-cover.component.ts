import { Component, inject, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';
import { BrandData } from '../../../models/brand.model';
import { CoverTemplateComponent } from '../../preview/cover-template/cover-template.component';
import { MultiSelectDropdownComponent } from '../../shared/multi-select-dropdown/multi-select-dropdown.component';
import { YearPickerComponent } from '../../shared/year-picker/year-picker.component';

interface CoverTemplate {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-step-cover',
  standalone: true,
  imports: [CoverTemplateComponent, ReactiveFormsModule, MultiSelectDropdownComponent, YearPickerComponent],
  templateUrl: './step-cover.component.html',
  styleUrl: './step-cover.component.scss'
})
export class StepCoverComponent implements OnInit, OnDestroy, AfterViewInit {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private zone = inject(NgZone);
  private sub!: Subscription;
  private formSub!: Subscription;

  form!: FormGroup;
  brandData!: BrandData;
  selectedId = '';
  previewId = '';
  thumbScale = 0.224;
  modalScale = 1;

  templates: CoverTemplate[] = [
    { id: 't1', name: 'Bold Fill',   description: 'Full color background' },
    { id: 't2', name: 'Clean Type',  description: 'White, giant typography' },
    { id: 't3', name: 'Geometric',   description: 'Color + grid & circles' },
    { id: 't4', name: 'Arc Minimal', description: 'White with side arcs' },
    { id: 't5', name: 'Brand Book',  description: 'Header meta + headline' },
  ];

  industryOptions = [
    'Technology', 'Software / SaaS', 'E-Commerce', 'Finance / FinTech',
    'Healthcare', 'Education / EdTech', 'Real Estate', 'Fashion / Apparel',
    'Food & Beverage', 'Automotive', 'Travel & Hospitality', 'Media & Entertainment',
    'Sports & Fitness', 'Beauty & Cosmetics', 'Architecture & Design',
    'Legal Services', 'Non-Profit / NGO', 'Agriculture', 'Manufacturing',
    'Energy / CleanTech', 'Logistics / Supply Chain', 'Retail', 'Consulting', 'Other',
  ];

  audienceOptions = [
    'Children (Under 12)', 'Teenagers (13–17)', 'Young Adults (18–24)',
    'Millennials (25–34)', 'Adults (35–44)', 'Middle-Aged (45–54)', 'Seniors (55+)',
    'Students', 'Professionals', 'Entrepreneurs', 'Small Business Owners',
    'Enterprise / Corporate', 'Developers / Tech', 'Creatives / Designers',
    'Healthcare Workers', 'Parents / Families', 'High-Income Earners',
    'Budget-Conscious', 'Eco-Conscious', 'Luxury Consumers', 'General Public',
  ];

  personalityOptions = [
    'Bold', 'Modern', 'Elegant', 'Playful', 'Minimal', 'Professional',
    'Friendly', 'Trustworthy', 'Innovative', 'Luxurious', 'Artistic',
    'Sophisticated', 'Energetic', 'Calm', 'Authoritative', 'Rebellious',
    'Warm', 'Futuristic', 'Organic / Natural', 'Edgy', 'Classic',
    'Youthful', 'Confident', 'Approachable',
  ];

  @ViewChildren('thumbRef') thumbRefs!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.brandData = this.brandService.brandData;
    this.selectedId = this.brandData.cover.variant || 't1';
    
    this.sub = this.brandService.brandData$.subscribe(d => this.brandData = d);

    // Initialize form with cover data (renamed from basics)
    const data = this.brandService.getSection('cover');
    this.form = this.fb.group({
      name:        [data.name,        Validators.required],
      tagline:     [data.tagline],
      description: [data.description],
      industry:    [data.industry    || []],
      audience:    [data.audience    || []],
      personality: [data.personality || []],
      year:        [data.year],
    });

    this.formSub = this.form.valueChanges.subscribe(val => {
      this.brandService.updateSection('cover', val);
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const el = this.thumbRefs.first?.nativeElement as HTMLElement;
        if (el) {
          const w = el.offsetWidth;
          this.zone.run(() => { this.thumbScale = w / 800; });
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.formSub?.unsubscribe();
    document.body.style.overflow = '';
  }

  selectTemplate(id: string): void {
    this.selectedId = id;
    this.brandService.updateSection('cover', { variant: id });
  }

  openPreview(id: string): void {
    this.previewId = id;
    document.body.style.overflow = 'hidden';
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const box = document.querySelector('.modal-body') as HTMLElement;
        if (box) {
          const w = box.offsetWidth;
          this.zone.run(() => { this.modalScale = w / 800; });
        }
      });
    });
  }

  closePreview(): void {
    this.previewId = '';
    document.body.style.overflow = '';
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getSelectedName(): string { return this.templates.find(t => t.id === this.selectedId)?.name || ''; }
  getTemplateName(id: string): string { return this.templates.find(t => t.id === id)?.name || ''; }
}
