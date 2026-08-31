import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Subject } from 'rxjs';
import {
  BrandData,
  BrandSection,
  createDefaultBrandData,
  STEPS,
  StepConfig,
} from '../models/brand.model';

const STORAGE_KEY = 'ox-brand-builder-data';
const STEP_KEY = 'ox-brand-builder-step';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private brandDataSubject = new BehaviorSubject<BrandData>(this.loadFromStorage());
  private currentStepSubject = new BehaviorSubject<number>(this.loadStepFromStorage());
  private saveSubject = new Subject<void>();

  /** Observable of the full brand data */
  brandData$ = this.brandDataSubject.asObservable();

  /** Observable of the current step index */
  currentStep$ = this.currentStepSubject.asObservable();

  /** Observable that emits when data is saved */
  saveEvent$ = this.saveSubject.asObservable();

  /** Observable of only enabled steps */
  activeSteps$ = this.brandData$.pipe(
    map(data => STEPS.filter((s: StepConfig) => data.summary.enabledSections.includes(s.id)))
  );

  /** Get current brand data snapshot */
  get brandData(): BrandData {
    return this.brandDataSubject.getValue();
  }

  /** Get current step index */
  get currentStep(): number {
    return this.currentStepSubject.getValue();
  }

  /** Get step config */
  get steps(): StepConfig[] {
    return STEPS;
  }

  /** Get only enabled steps */
  get activeSteps(): StepConfig[] {
    const enabled = this.brandData.summary.enabledSections;
    return STEPS.filter((s: StepConfig) => enabled.includes(s.id));
  }

  /** Update a specific section of brand data */
  updateSection<K extends BrandSection>(section: K, data: Partial<BrandData[K]>): void {
    const current = this.brandData;
    const sectionData = current[section];
    
    let updated: BrandData;
    if (typeof sectionData === 'object' && !Array.isArray(sectionData) && sectionData !== null) {
      updated = {
        ...current,
        [section]: { ...sectionData, ...data },
      };
    } else {
      updated = {
        ...current,
        [section]: data,
      };
    }
    
    this.brandDataSubject.next(updated);
    this.autoSave();
  }

  /** Update full brand data */
  updateBrandData(data: BrandData): void {
    this.brandDataSubject.next(data);
    this.autoSave();
  }

  /** Set the variant for a section */
  setVariant(section: BrandSection, variantId: string): void {
    const sectionData = this.brandData[section] as any;
    if (sectionData && typeof sectionData === 'object' && 'variant' in sectionData) {
      this.updateSection(section, { variant: variantId } as any);
    }
  }

  /** Get a specific section */
  getSection<K extends BrandSection>(section: K): BrandData[K] {
    return this.brandData[section];
  }

  /** Navigate to a step index in the GLOBAL STEPS array */
  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      this.currentStepSubject.next(stepIndex);
      this.saveStepToStorage(stepIndex);
    }
  }

  /** Go to next enabled step */
  nextStep(): void {
    const active = this.activeSteps;
    const currentIndex = active.findIndex(s => s.index === this.currentStep);
    if (currentIndex !== -1 && currentIndex < active.length - 1) {
      this.goToStep(active[currentIndex + 1].index);
    }
  }

  /** Go to previous enabled step */
  previousStep(): void {
    const active = this.activeSteps;
    const currentIndex = active.findIndex(s => s.index === this.currentStep);
    if (currentIndex !== -1 && currentIndex > 0) {
      this.goToStep(active[currentIndex - 1].index);
    }
  }

  /** Check if a step has been filled with required data */
  isStepValid(stepIndex: number): boolean {
    const data = this.brandData;
    switch (stepIndex) {
      case 0: // Selection
        return true;
      case 1: // Cover
        return !!data.cover.name;
      case 2: // Summary
        return true;
      case 3: // Logo
        return true;
      case 4: // Colors
        return data.colors.palette.length > 0;
      case 5: // Typography
        return !!data.typography.primaryFont;
      case 6: // Iconography
        return !!data.iconography.library;
      case 7: // Tech Stack
        return !!(data.techstack && data.techstack.technology && data.techstack.uiFramework);
      case 8: // Review
        return true;
      default:
        return false;
    }
  }

  /** ── Progress Intelligence ──────────────────────────────── */
  get completionPercentage(): number {
    const data = this.brandData;
    let score = 0;
    let total = 0;

    const weights = {
      required: 15,
      important: 10,
      optional: 5
    };

    // Cover (Required: Name, Important: Industry)
    total += weights.required + weights.important;
    if (data.cover.name) score += weights.required;
    if (data.cover.industry && data.cover.industry.length > 0) score += weights.important;
    
    // Logo (Important: Icon, Optional: Primary)
    total += weights.important + weights.optional;
    if (data.logo.primary) score += weights.optional;
    if (data.logo.icon) score += weights.important;

    // Typography (Required: Primary Font)
    total += weights.required;
    if (data.typography.primaryFont) score += weights.required;

    // Colors (Important: Palette modified from default? We check non-default vibrancy)
    total += weights.important;
    const hasCustomColors = data.colors.palette.some(c => c.hex !== '#4f46e5' && c.hex !== '#AE2D24');
    if (hasCustomColors) score += weights.important;

    // Summary/Sections (Optional)
    total += weights.optional;
    if (data.summary.enabledSections.length > 5) score += weights.optional;

    return Math.round((score / total) * 100);
  }

  get pendingFields(): { label: string, stepIndex: number, id: string, required: boolean }[] {
    const data = this.brandData;
    const pending: { label: string, stepIndex: number, id: string, required: boolean }[] = [];

    if (!data.cover.name) pending.push({ label: 'Brand Name', stepIndex: 1, id: 'brand-name', required: true });
    if (!data.cover.industry || data.cover.industry.length === 0) pending.push({ label: 'Industry', stepIndex: 1, id: 'industry-select', required: false });
    
    // Consolidated Logo Assets
    const logoFields = ['primary', 'secondary', 'horizontal', 'vertical', 'icon', 'monoBlack', 'monoWhite'];
    const uploadedCount = logoFields.filter(f => !!(data.logo as any)[f]).length;
    if (uploadedCount < 7) {
      pending.push({ 
        label: `Logo Assets (${uploadedCount}/7 Uploaded)`, 
        stepIndex: 3, 
        id: 'logo-assets', 
        required: false 
      });
    }

    if (!data.typography.primaryFont) pending.push({ label: 'Primary Font', stepIndex: 5, id: 'font-primary', required: true });

    return pending;
  }

  get progressColorClass(): string {
    const p = this.completionPercentage;
    if (p === 100) return 'bg-success';
    if (p >= 60) return 'bg-amber-500';
    return 'bg-error';
  }

  get isAllDataValid(): boolean {
    return !this.pendingFields.some(f => f.required);
  }

  /** Save current state to localStorage */
  saveDraft(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.brandData));
      this.saveSubject.next();
    } catch (e) {
      console.warn('Failed to save draft:', e);
    }
  }

  /** Reset all data */
  resetAll(): void {
    const defaultData = createDefaultBrandData();
    this.brandDataSubject.next(defaultData);
    this.currentStepSubject.next(0);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_KEY);
  }

  /** Auto-save with debounce managed externally */
  private autoSave(): void {
    this.saveDraft();
  }

  /** Load from localStorage or return defaults */
  private loadFromStorage(): BrandData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BrandData;
        const defaults = createDefaultBrandData();
        return {
          ...defaults,
          ...parsed,
          cover: {
            ...defaults.cover,
            ...(parsed.cover || {})
          },
          summary: {
            ...defaults.summary,
            ...(parsed.summary || {}),
            enabledSections: Array.from(new Set([
              'selection', 
              'techstack',
              ...(parsed.summary?.enabledSections || defaults.summary.enabledSections)
            ])).filter(id => STEPS.some((s: StepConfig) => s.id === id))
          },
          logo: {
            ...defaults.logo,
            ...(parsed.logo || {})
          },
          techstack: {
            ...defaults.techstack,
            ...(parsed.techstack || {})
          },
          colors: parsed.colors && parsed.colors.palette && parsed.colors.palette[0] && parsed.colors.palette[0].category 
            ? {
                ...parsed.colors,
                palette: parsed.colors.palette.map((c: any) => {
                  if (c.name === 'Primary' && (c.hex === '#4A6E7A' || c.hex === '#4a6e7a')) {
                    return { ...c, hex: '#4f46e5', rgb: '79, 70, 229' };
                  }
                  return c;
                })
              }
            : defaults.colors
        };
      }
    } catch (e) {
      console.warn('Failed to load draft:', e);
    }
    return createDefaultBrandData();
  }

  /** Load step from localStorage */
  private loadStepFromStorage(): number {
    try {
      const stored = localStorage.getItem(STEP_KEY);
      if (stored) {
        return parseInt(stored, 10) || 0;
      }
    } catch (e) {
      // ignore
    }
    return 0;
  }

  /** Save step to localStorage */
  private saveStepToStorage(step: number): void {
    try {
      localStorage.setItem(STEP_KEY, String(step));
    } catch (e) {
      // ignore
    }
  }
}
