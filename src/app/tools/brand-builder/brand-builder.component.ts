import { Component, inject, OnDestroy, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Services
import { BrandService } from './services/brand.service';
import { ExportService } from './services/export.service';

// Models
import { BrandData, STEPS, StepConfig } from './models/brand.model';

// Shared Components
import { StepperComponent } from './components/shared/stepper/stepper.component';
import { OnboardingTourComponent, TourStep } from './components/shared/onboarding-tour/onboarding-tour.component';

// Tool Components
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
    FormsModule,
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

  // Footer Checkbox Selections (Default all true)
  exportJson = true;
  exportPdf = true;
  exportFonts = true;

  get canExport(): boolean {
    return this.exportJson || this.exportPdf || this.exportFonts;
  }

  toggleExportMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.showExportMenu = !this.showExportMenu;
  }

  closeExportMenu() {
    this.showExportMenu = false;
  }

  toggleMobileView() {
    this.showPreviewMobile = !this.showPreviewMobile;
  }

  closeResetModal() {
    this.showResetModal = false;
  }

  onExportBundle() {
    this.closeExportMenu();
    this.exportService.exportBundleZip(this.brandData, {
      json: this.exportJson,
      pdf: this.exportPdf,
      fonts: this.exportFonts
    });
  }

  onExportJson() {
    this.showExportMenu = false;
    this.exportService.exportToJson(this.brandData);
  }

  onExportPdf() {
    this.showExportMenu = false;
    this.exportService.exportToPdf(this.brandData);
  }

  onExportFonts() {
    this.showExportMenu = false;
    this.exportService.exportFonts(this.brandData);
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

  private subs: Subscription[] = [];

  ngOnInit() {
    this.brandData = this.brandService.brandData;
    this.steps = this.brandService.activeSteps;

    this.subs.push(
      this.brandService.currentStep$.subscribe(step => {
        this.currentStep = step;
        this.scrollToTop();
      }),
      this.brandService.brandData$.subscribe(data => {
        this.brandData = data;
        this.steps = this.brandService.activeSteps;
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  setViewMode(mode: 'split' | 'form-full' | 'preview-full') {
    this.viewMode = mode;
  }

  onStepChange(index: number) {
    this.brandService.goToStep(index);
  }

  onNext() {
    if (this.currentStep < this.steps.length - 1) {
      this.brandService.goToStep(this.currentStep + 1);
    }
  }

  onBack() {
    if (this.currentStep > 0) {
      this.brandService.goToStep(this.currentStep - 1);
    }
  }

  onReset() {
    this.showResetModal = true;
  }

  confirmReset() {
    this.brandService.resetAll();
    this.showResetModal = false;
  }

  cancelReset() {
    this.showResetModal = false;
  }

  get isCurrentStepValid(): boolean {
    return this.brandService.isStepValid(this.currentStep);
  }

  get currentStepConfig(): StepConfig | undefined {
    return this.steps[this.currentStep];
  }

  jumpToField(field: { stepIndex: number; id: string }) {
    this.brandService.goToStep(field.stepIndex);
    this.showProgressPopover = false;

    setTimeout(() => {
      const el = document.getElementById(field.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2000);
      }
    }, 150);
  }

  private scrollToTop() {
    if (this.formScrollContainer?.nativeElement) {
      this.formScrollContainer.nativeElement.scrollTop = 0;
    }
  }

  startTour() {
    this.isTourActive = true;
  }

  onTourComplete() {
    this.isTourActive = false;
  }

  onTourSkip() {
    this.isTourActive = false;
  }
}
