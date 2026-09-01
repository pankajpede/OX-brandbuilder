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
  title: string;
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
  maxDescLength = 750;

  templates: CoverTemplate[] = [
    { id: 't1', name: 'Bold Fill', title: 'Bold & expressive', description: 'Strong color blocks, large typography, and high visual impact.' },
    { id: 't2', name: 'Clean Type', title: 'Minimal & editorial', description: 'White space, typography-led layouts, and a restrained visual treatment.' },
    { id: 't3', name: 'Geometric', title: 'Structured & modern', description: 'Grid-based layouts with geometric forms and visual patterns.' },
    { id: 't4', name: 'Arc Minimal', title: 'Soft & refined', description: 'Minimal layouts with subtle curved elements and generous space.' },
    { id: 't5', name: 'Brand Book', title: 'Classic & corporate', description: 'Traditional brand-book structure with clear documentation hierarchy.' },
  ];

  industryOptions = [
    'Software / SaaS', 'Technology', 'E-Commerce', 'Finance / FinTech',
    'Healthcare', 'Education / EdTech', 'Real Estate', 'Fashion / Apparel',
    'Food & Beverage', 'Automotive', 'Travel & Hospitality', 'Media & Entertainment',
    'Sports & Fitness', 'Beauty & Cosmetics', 'Architecture & Design',
    'Legal Services', 'Non-Profit / NGO', 'Agriculture', 'Manufacturing',
    'Energy / CleanTech', 'Logistics / Supply Chain', 'Retail', 'Consulting', 'Other',
  ];

  primaryAudienceOptions = [
    'Business professionals', 'Developers / Tech', 'Consumers', 'Entrepreneurs',
    'Small Business Owners', 'Creatives / Designers', 'Students', 'Parents / Families',
    'Enterprise / Corporate', 'Educators', 'Healthcare Workers', 'General Public'
  ];

  secondaryAudienceOptions = [
    'Business professionals', 'Developers / Tech', 'Consumers', 'Entrepreneurs',
    'Small Business Owners', 'Creatives / Designers', 'Students', 'Parents / Families',
    'Enterprise / Corporate', 'Educators', 'Healthcare Workers', 'General Public'
  ];

  personalityOptions = [
    'Modern', 'Professional', 'Friendly', 'Bold', 'Innovative', 'Elegant',
    'Playful', 'Minimal', 'Trustworthy', 'Premium', 'Energetic', 'Approachable'
  ];

  @ViewChildren('thumbRef') thumbRefs!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.brandData = this.brandService.brandData;
    this.selectedId = this.brandData.cover.variant || 't1';
    
    this.sub = this.brandService.brandData$.subscribe(d => this.brandData = d);

    // Initialize form with cover data
    const data = this.brandService.getSection('cover');
    const currentYear = new Date().getFullYear();

    let initialPrimaryArray: string[] = [];
    let initialSecondary = data.secondaryAudiences || [];
    
    if (data.primaryAudience) {
      initialPrimaryArray = [data.primaryAudience];
    } else if (data.audience && data.audience.length > 0) {
      initialPrimaryArray = [data.audience[0]];
      initialSecondary = data.audience.slice(1);
    }

    this.form = this.fb.group({
      name:               [data.name, [Validators.required]],
      year:               [data.year || currentYear],
      tagline:            [data.tagline],
      description:        [data.description, [Validators.maxLength(750)]],
      industry:           [data.industry || []],
      primaryAudience:    [initialPrimaryArray], // Optional custom dropdown
      secondaryAudiences: [initialSecondary],
      personality:        [data.personality || []],
    });

    this.formSub = this.form.valueChanges.subscribe(val => {
      const primaryStr = val.primaryAudience && val.primaryAudience.length > 0 ? val.primaryAudience[0] : '';
      const combinedAudience: string[] = [];
      if (primaryStr) combinedAudience.push(primaryStr);
      if (val.secondaryAudiences && val.secondaryAudiences.length > 0) {
        val.secondaryAudiences.forEach((sec: string) => {
          if (!combinedAudience.includes(sec)) combinedAudience.push(sec);
        });
      }

      this.brandService.updateSection('cover', {
        ...val,
        primaryAudience: primaryStr,
        audience: combinedAudience
      });
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

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  get descCharCount(): number {
    return (this.form.get('description')?.value || '').length;
  }

  get isBasicsComplete(): boolean {
    const name = this.form?.get('name')?.value;
    return !!(name && name.trim());
  }

  get isPositioningComplete(): boolean {
    const primary = this.form?.get('primaryAudience')?.value;
    const industry = this.form?.get('industry')?.value;
    const personality = this.form?.get('personality')?.value;
    return (primary && primary.length > 0) || (industry && industry.length > 0) || (personality && personality.length > 0);
  }

  get isStyleComplete(): boolean {
    return !!this.selectedId;
  }

  getSelectedName(): string { return this.templates.find(t => t.id === this.selectedId)?.name || ''; }
  getTemplateName(id: string): string { return this.templates.find(t => t.id === id)?.name || ''; }
}
