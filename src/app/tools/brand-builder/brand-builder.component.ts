import { Component, inject, OnDestroy, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Services
import { BrandService } from './services/brand.service';
import { ExportService } from './services/export.service';

// Models
import { BrandData, STEPS, StepConfig } from './models/brand.model';

// Shared Components (Now internal to tool shared)
import { StepperComponent } from './components/shared/stepper/stepper.component';
import { OnboardingTourComponent, TourStep } from './components/shared/onboarding-tour/onboarding-tour.component';

// Tool Components (Now under tools/brand-builder/components)
import { StepCoverComponent } from './components/steps/step-cover/step-cover.component';
import { StepSummaryComponent } from './components/steps/step-summary/step-summary.component';
import { StepLogoComponent } from './components/steps/step-logo/step-logo.component';
import { StepColorsComponent } from './components/steps/step-colors/step-colors.component';
import { StepTypographyComponent } from './components/steps/step-typography/step-typography.component';
import { StepIconographyComponent } from './components/steps/step-iconography/step-iconography.component';
import { StepTechStackComponent } from './components/steps/step-techstack/step-techstack.component';
import { StepSelectionComponent } from './components/steps/step-selection/step-selection.component';
import { StepReviewComponent } from './components/steps/step-review/step-review.component';
import { PreviewContainerComponent } from './components/preview/preview-container/preview-container.component';
import { PdfTemplateComponent } from './components/pdf-template/pdf-template.component';

@Component({
  selector: 'app-brand-builder',
  standalone: true,
  imports: [
    CommonModule,
    StepperComponent,
    PreviewContainerComponent,
    OnboardingTourComponent,
    StepCoverComponent,
    StepSummaryComponent,
    StepLogoComponent,
    StepColorsComponent,
    StepTypographyComponent,
    StepIconographyComponent,
    StepTechStackComponent,
    StepSelectionComponent,
    StepReviewComponent,
    PdfTemplateComponent
  ],
  templateUrl: './brand-builder.component.html',
  styleUrls: ['./brand-builder.component.scss']
})
export class BrandBuilderComponent implements OnInit, OnDestroy {
  public brandService = inject(BrandService);
  public exportService = inject(ExportService);

  showExportMenu = false;

  toggleExportMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.showExportMenu = !this.showExportMenu;
  }

  closeExportMenu() {
    this.showExportMenu = false;
  }

  onExportJson() {
    this.showExportMenu = false;
    this.exportService.exportToJson(this.brandData);
  }

  onExportPdf() {
    this.showExportMenu = false;
    this.exportService.exportToPdf(this.brandData);
  }

  @ViewChild('formScrollContainer') formScrollContainer!: ElementRef<HTMLElement>;
  @ViewChild(PreviewContainerComponent) previewContainer!: PreviewContainerComponent;

  steps: StepConfig[] = [];
  currentStep = 0;
  brandData!: BrandData;
  showPreviewMobile = false;
  showResetModal = false;
  showProgressPopover = false;
  viewMode: 'split' | 'form-full' | 'preview-full' = 'split';

  // Tour
  isTourActive = false;
  tourSteps: TourStep[] = [
    { targetId: 'ox-logo', title: 'OS Builder', content: 'Welcome to the OS Builder ecosystem.', position: 'bottom' },
    { targetId: 'stepper-tour', title: 'Brand Flow', content: 'Follow these steps to build your brand guide.', position: 'bottom' },
    { targetId: 'preview-tour', title: 'Live Preview', content: 'See your design system come to life in real-time.', position: 'left' },
    { targetId: 'next-step-btn', title: 'Navigation', content: 'Move through the workflow as you complete sections.', position: 'top' }
  ];

  private sub = new Subscription();

  ngOnInit() {
    this.sub.add(
      this.brandService.brandData$.subscribe(data => {
        this.brandData = data;
      })
    );
    this.sub.add(
      this.brandService.currentStep$.subscribe(step => {
        this.currentStep = step;
        this.scrollToTop();
      })
    );
    this.sub.add(
      this.brandService.activeSteps$.subscribe(steps => {
        this.steps = steps;
      })
    );

    // Initial view mode check
    if (window.innerWidth < 1024) {
      this.viewMode = 'form-full';
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onStepChange(index: number) {
    this.brandService.goToStep(index);
  }

  onNext() {
    this.brandService.nextStep();
  }

  onBack() {
    this.brandService.previousStep();
  }

  onReset() {
    this.showResetModal = true;
  }

  confirmReset() {
    this.brandService.resetAll();
    this.showResetModal = false;
  }

  closeResetModal() {
    this.showResetModal = false;
  }

  onExport() {
    this.exportService.exportToJson(this.brandData);
  }

  toggleMobileView() {
    this.showPreviewMobile = !this.showPreviewMobile;
  }

  setViewMode(mode: 'split' | 'form-full' | 'preview-full') {
    this.viewMode = mode;
  }

  startTour() {
    this.isTourActive = true;
  }

  onTourComplete() {
    this.isTourActive = false;
  }

  private scrollToTop() {
    if (this.formScrollContainer) {
      this.formScrollContainer.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (this.previewContainer) {
      this.previewContainer.scrollToTop();
    }
  }

  get isCurrentStepValid(): boolean {
    return this.brandService.isStepValid(this.currentStep);
  }

  get progressTooltip(): string {
    const pending = this.brandService.pendingFields;
    if (pending.length === 0) return 'Design System Complete! 100%';
    return `Pending: ${pending.map(p => p.label).join(', ')}`;
  }

  jumpToField(item: { label: string, stepIndex: number, id: string }) {
    this.brandService.goToStep(item.stepIndex);
    this.showProgressPopover = false;

    // Use a small timeout to allow the step component to render before scrolling
    setTimeout(() => {
      const element = document.getElementById(item.id);
      if (element && this.formScrollContainer) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary highlight effect
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2000);
      }
    }, 100);
  }
}
