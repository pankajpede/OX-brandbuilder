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
    map(data => STEPS.filter(s => data.summary.enabledSections.includes(s.id)))
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
    return STEPS.filter(s => enabled.includes(s.id));
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
      case 0: // Cover Page
        return !!(data.cover.name && data.cover.description);
      case 1: // Summary
        return true;
      case 2: // Logo
        return true;
      case 3: // Colors
        return data.colors.palette.length > 0;
      case 4: // Typography
        return !!data.typography.primaryFont;
      case 5: // Iconography
        return !!data.iconography.library;
      case 6: // Review
        return true;
      default:
        return false;
    }
  }

  /** Check if all enabled steps are valid */
  get isAllDataValid(): boolean {
    return this.activeSteps.every(step => {
      // Step 6 (Review) is always valid, but we care about the actual data steps
      if (step.id === 'review') return true;
      return this.isStepValid(step.index);
    });
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
              ...(parsed.summary?.enabledSections || defaults.summary.enabledSections)
            ])).filter(id => STEPS.some(s => s.id === id))
          },
          logo: {
            ...defaults.logo,
            ...(parsed.logo || {})
          },
          colors: parsed.colors && parsed.colors.palette && parsed.colors.palette[0] && parsed.colors.palette[0].category 
            ? parsed.colors 
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
