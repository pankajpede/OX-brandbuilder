import { Component, Input, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewCoverComponent } from '../preview-cover/preview-cover.component';
import { PreviewSummaryComponent } from '../preview-summary/preview-summary.component';
import { PreviewLogoComponent } from '../preview-logo/preview-logo.component';
import { PreviewColorsComponent } from '../preview-colors/preview-colors.component';
import { PreviewTypographyComponent } from '../preview-typography/preview-typography.component';
import { PreviewIconographyComponent } from '../preview-iconography/preview-iconography.component';
import { PreviewTechStackComponent } from '../preview-techstack/preview-techstack.component';
import { BrandData } from '../../../models/brand.model';
import { GoogleFontsService } from '../../../services/google-fonts.service';
import { generateTypographyTokens } from '../../../constants/typography-engine';

@Component({
  selector: 'app-preview-container',
  standalone: true,
  imports: [
    CommonModule, 
    PreviewCoverComponent, 
    PreviewSummaryComponent, 
    PreviewLogoComponent, 
    PreviewColorsComponent, 
    PreviewTypographyComponent, 
    PreviewIconographyComponent,
    PreviewTechStackComponent
  ],
  templateUrl: './preview-container.component.html',
  styleUrl: './preview-container.component.scss'
})
export class PreviewContainerComponent {
  private fontService = inject(GoogleFontsService);

  private _data!: BrandData;
  @Input() 
  set data(val: BrandData) {
    this._data = val;
    this.syncFonts();
  }
  get data(): BrandData { return this._data; }

  private _currentStep = 0;
  
  @Input() 
  set currentStep(val: number) {
    this._currentStep = val;
    this.scrollToActiveStep(val);
  }
  get currentStep(): number { return this._currentStep; }
  @ViewChild('previewScrollContainer') previewScrollContainer!: ElementRef;

  public scrollToTop(): void {
    if (this.previewScrollContainer) {
      this.previewScrollContainer.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  private scrollToActiveStep(step: number): void {
    setTimeout(() => {
      if (!this.previewScrollContainer) return;
      
      const container = this.previewScrollContainer.nativeElement;
      const pages = container.querySelectorAll('.preview-page');
      
      if (step === 8) { // Review Step
        this.scrollToTop();
      } else if (step > 0 && pages && pages[step - 1]) {
        // Step 1 maps to Page 0 (Cover), Step 2 to Page 1 (Summary), etc.
        pages[step - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  private syncFonts(): void {
    if (this._data?.typography?.primaryFont) {
      this.fontService.loadFont(this._data.typography.primaryFont);
    }
  }

  protected getPreviewStyles() {
    if (!this._data?.typography) return {};
    
    const tokens = generateTypographyTokens(
      this._data.typography.tone || 'professional',
      this._data.typography.density || 'comfortable'
    );

    return {
      ...tokens,
      '--font-primary': this._data.typography.primaryFont ? `'${this._data.typography.primaryFont}', sans-serif` : 'Inter, sans-serif',
      '--font-secondary': 'var(--font-primary)'
    };
  }
}
