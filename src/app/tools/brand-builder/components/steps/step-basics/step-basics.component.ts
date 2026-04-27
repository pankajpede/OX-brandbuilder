import { Component, inject, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';
import { BrandData } from '../../../models/brand.model';
import { CoverTemplateComponent } from '../../preview/cover-template/cover-template.component';
import { MultiSelectDropdownComponent } from '../../shared/multi-select-dropdown/multi-select-dropdown.component';

interface CoverTemplate {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-step-basics',
  standalone: true,
  imports: [CoverTemplateComponent, ReactiveFormsModule, MultiSelectDropdownComponent],
  template: `
    <div class="step-content animate-fade-in-up">
      <div class="step-header">
        <h2>Cover Page</h2>
        <p>Choose a cover template and enter your brand details</p>
      </div>

      <div class="templates-section">
        <span class="section-label">Select Template</span>
        <div class="template-grid" #gridRef>
          @for (tpl of templates; track tpl.id; let i = $index) {
            <div
              class="template-card"
              [class.is-selected]="selectedId === tpl.id"
              [class.is-blurred]="selectedId && selectedId !== tpl.id"
              (click)="selectTemplate(tpl.id)"
            >
              <!-- Thumbnail -->
              <div class="template-thumb" #thumbRef (click)="$event.stopPropagation(); openPreview(tpl.id)">
                <div class="thumb-inner" [style.transform]="'scale(' + thumbScale + ')'" [style.transform-origin]="'top left'">
                  <app-cover-template [templateId]="tpl.id" [data]="brandData"></app-cover-template>
                </div>
                <div class="thumb-overlay">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  Preview
                </div>
              </div>

              <!-- Footer -->
              <div class="template-footer">
                <div class="template-meta">
                  <span class="template-name">{{ tpl.name }}</span>
                  <span class="template-desc">{{ tpl.description }}</span>
                </div>
                @if (selectedId === tpl.id) {
                  <span class="badge-selected">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Active
                  </span>
                } @else {
                  <button class="btn-use" (click)="selectTemplate(tpl.id); $event.stopPropagation()">Use</button>
                }
              </div>
            </div>
          }
        </div>
      </div>

      @if (selectedId) {
        <div class="selection-note">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <strong>{{ getSelectedName() }}</strong>&nbsp;selected — this will appear as Page 1 of your PDF export
        </div>
      }

      <!-- ── Brand Info Section ────────────────────────────── -->
      <div class="brand-info-section">
        <span class="section-label">Brand Information</span>
        <p class="section-desc">This information will appear throughout your brand guidelines document</p>

        <form [formGroup]="form" class="step-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Brand Name *</label>
              <input
                class="form-input"
                formControlName="name"
                placeholder="Enter your brand name"
                [class.is-invalid]="isInvalid('name')"
              />
              @if (isInvalid('name')) {
                <span class="form-error">Brand name is required</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Year Founded</label>
              <input
                class="form-input"
                formControlName="year"
                type="number"
                placeholder="e.g. 2024"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Tagline</label>
            <input
              class="form-input"
              formControlName="tagline"
              placeholder="A short, memorable phrase"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Brand Description *</label>
            <textarea
              class="form-textarea"
              formControlName="description"
              placeholder="Describe what your brand does and stands for..."
              rows="4"
              [class.is-invalid]="isInvalid('description')"
            ></textarea>
            @if (isInvalid('description')) {
              <span class="form-error">Description is required</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Industry</label>
            <span class="form-hint">Select up to 3 industries</span>
            <app-multi-select-dropdown
              formControlName="industry"
              [options]="industryOptions"
              [maxSelections]="3"
              placeholder="Select industries..."
            ></app-multi-select-dropdown>
          </div>

          <div class="form-group">
            <label class="form-label">Target Audience</label>
            <span class="form-hint">Select up to 3 audience segments</span>
            <app-multi-select-dropdown
              formControlName="audience"
              [options]="audienceOptions"
              [maxSelections]="3"
              placeholder="Select target audiences..."
            ></app-multi-select-dropdown>
          </div>

          <div class="form-group">
            <label class="form-label">Brand Personality</label>
            <span class="form-hint">Select up to 3 personality traits</span>
            <app-multi-select-dropdown
              formControlName="personality"
              [options]="personalityOptions"
              [maxSelections]="3"
              placeholder="Select personality traits..."
            ></app-multi-select-dropdown>
          </div>
        </form>
      </div>
    </div>

    <!-- ── Modal ──────────────────────────────────────────────── -->
    @if (previewId) {
      <div class="modal-backdrop" (click)="closePreview()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">{{ getTemplateName(previewId) }}</span>
            <div class="modal-actions">
              <button class="btn btn-primary btn-sm" (click)="selectTemplate(previewId); closePreview()">
                Use This Template
              </button>
              <button class="modal-close-btn" (click)="closePreview()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="modal-body" #modalBodyRef>
            <!-- 800×500 template rendered then scaled to fit modal width -->
            <div class="modal-canvas" [style.width.px]="800" [style.height.px]="500" [style.transform]="'scale(' + modalScale + ')'" [style.transform-origin]="'top left'">
              <app-cover-template [templateId]="previewId" [data]="brandData"></app-cover-template>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .step-content { padding: var(--space-6); }

    .step-header { margin-bottom: var(--space-6); }
    .step-header h2 { margin-bottom: var(--space-2); }
    .step-header p { font-size: var(--text-base); color: var(--color-text-secondary); }

    .section-label {
      display: block;
      font-size: var(--text-xs); font-weight: 700;
      text-transform: uppercase; letter-spacing: var(--tracking-widest);
      color: var(--color-text-muted); margin-bottom: var(--space-4);
    }

    .section-desc {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      margin-top: calc(var(--space-1) * -1);
      margin-bottom: var(--space-5);
    }

    /* ── Brand Info Section ─────────────── */
    .brand-info-section {
      margin-top: var(--space-8);
      padding-top: var(--space-8);
      border-top: 1px solid var(--color-border);
    }

    .step-form { display: flex; flex-direction: column; gap: var(--space-6); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }

    /* ── Grid ─────────────────────────────── */
    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-4);
    }

    /* ── Card ─────────────────────────────── */
    .template-card {
      border: 2px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.25s ease;
      background: var(--color-bg);
      animation: fadeInUp 0.3s ease-out;
    }
    .template-card:hover {
      border-color: var(--color-gray-400);
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }
    .template-card.is-selected {
      border-color: var(--color-primary);
      border-width: 2.5px;
      transform: translateY(-3px);
      box-shadow: 0 0 0 3px rgba(0,0,0,0.10), var(--shadow-md);
    }
    .template-card.is-blurred {
      opacity: 0.38;
      filter: blur(0.5px);
      transform: none;
      box-shadow: none;
    }
    .template-card.is-blurred:hover {
      opacity: 0.65;
      filter: none;
      transform: translateY(-1px);
    }

    /* ── Thumbnail ────────────────────────── */
    .template-thumb {
      position: relative;
      width: 100%;
      height: 112px;   /* fixed pixel height for the thumb area */
      overflow: hidden;
      background: #eee;
      cursor: zoom-in;
    }

    /* The inner div is 800×500, we scale it to fill 100% × 112px */
    .thumb-inner {
      position: absolute;
      top: 0; left: 0;
      width: 800px; height: 500px;
    }

    .thumb-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      gap: 6px; font-size: 12px; font-weight: 600; color: #fff;
      background: rgba(0,0,0,0.52);
      opacity: 0; transition: opacity 0.2s ease;
    }
    .template-thumb:hover .thumb-overlay { opacity: 1; }

    /* ── Footer ───────────────────────────── */
    .template-footer {
      padding: var(--space-3);
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--space-2); border-top: 1px solid var(--color-border);
    }
    .template-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .template-name { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .template-desc { font-size: 10px; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .badge-selected {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; background: var(--color-primary); color: #fff;
      border-radius: var(--radius-full); font-size: 10px; font-weight: 700;
      white-space: nowrap; flex-shrink: 0;
    }

    .btn-use {
      padding: 3px 10px; border: 1.5px solid var(--color-border);
      border-radius: var(--radius-sm); font-size: 11px; font-weight: 600;
      color: var(--color-text-secondary); transition: all var(--transition-fast);
      flex-shrink: 0;
    }
    .btn-use:hover { border-color: var(--color-primary); color: var(--color-primary); }

    /* ── Selection Note ───────────────────── */
    .selection-note {
      display: flex; align-items: center; gap: var(--space-2);
      margin-top: var(--space-5); padding: var(--space-3) var(--space-4);
      background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: var(--radius-md); font-size: var(--text-sm); color: #166534;
    }
    .selection-note svg { stroke: #16a34a; flex-shrink: 0; }

    /* ── Modal Backdrop ───────────────────── */
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.75);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: fadeIn 0.18s ease;
    }

    /* ── Modal Box ────────────────────────── */
    .modal-box {
      width: 100%; max-width: 860px;
      background: var(--color-bg);
      border-radius: var(--radius-xl);
      overflow: hidden; box-shadow: var(--shadow-xl);
      animation: fadeInUp 0.22s ease-out;
    }

    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--color-border);
    }
    .modal-title { font-size: var(--text-base); font-weight: 700; }
    .modal-actions { display: flex; align-items: center; gap: var(--space-3); }
    .modal-close-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: var(--radius-md);
      color: var(--color-text-muted); transition: all var(--transition-fast);
    }
    .modal-close-btn:hover { background: var(--color-gray-100); color: var(--color-text); }

    /* ── Modal Body ───────────────────────── */
    .modal-body {
      width: 100%;
      /* maintain 16:10 ratio for 800×500 canvas */
      aspect-ratio: 8 / 5;
      position: relative;
      overflow: hidden;
      background: #e5e5e5;
    }

    /* canvas is 800×500, transform scale fills the modal-body */
    .modal-canvas {
      position: absolute; top: 0; left: 0;
    }
  `]
})
export class StepBasicsComponent implements OnInit, OnDestroy, AfterViewInit {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private zone = inject(NgZone);
  private sub!: Subscription;
  private formSub!: Subscription;

  form!: FormGroup;
  brandData!: BrandData;
  selectedId = '';
  previewId = '';
  thumbScale = 0.224;   // 112/500
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
    this.selectedId = this.brandService.getSection('cover').variant || '';
    this.sub = this.brandService.brandData$.subscribe(d => this.brandData = d);

    // Initialize form with basics data
    const data = this.brandService.getSection('basics');
    this.form = this.fb.group({
      name:        [data.name,        Validators.required],
      tagline:     [data.tagline],
      description: [data.description, Validators.required],
      industry:    [data.industry    || []],
      audience:    [data.audience    || []],
      personality: [data.personality || []],
      year:        [data.year],
    });

    this.formSub = this.form.valueChanges.subscribe(val => {
      this.brandService.updateSection('basics', val);
    });
  }

  ngAfterViewInit(): void {
    // Compute scale once the thumb elements are in DOM
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const el = this.thumbRefs.first?.nativeElement as HTMLElement;
        if (el) {
          const w = el.offsetWidth;   // actual thumb width in px
          this.zone.run(() => {
            // scale so 800px wide template fills the thumb width
            this.thumbScale = w / 800;
          });
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
    this.brandService.updateSection('cover', { ...this.brandService.getSection('cover'), variant: id });
  }

  openPreview(id: string): void {
    this.previewId = id;
    document.body.style.overflow = 'hidden';
    // Compute modal scale on next frame
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
