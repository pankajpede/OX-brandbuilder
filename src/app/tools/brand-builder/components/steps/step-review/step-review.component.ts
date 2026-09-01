import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandService } from '../../../services/brand.service';
import { ExportService } from '../../../services/export.service';
import { BrandData } from '../../../models/brand.model';

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-review.component.html',
  styleUrl: './step-review.component.scss'
})
export class StepReviewComponent {
  private brandService = inject(BrandService);
  public exportService = inject(ExportService);

  get exportJson(): boolean {
    return this.exportService.bundleOptions.json;
  }
  set exportJson(val: boolean) {
    this.exportService.bundleOptions.json = val;
  }

  get exportPdf(): boolean {
    return this.exportService.bundleOptions.pdf;
  }
  set exportPdf(val: boolean) {
    this.exportService.bundleOptions.pdf = val;
  }

  get exportLogos(): boolean {
    return this.exportService.bundleOptions.logos !== false;
  }
  set exportLogos(val: boolean) {
    this.exportService.bundleOptions.logos = val;
  }

  get exportFonts(): boolean {
    return this.exportService.bundleOptions.fonts;
  }
  set exportFonts(val: boolean) {
    this.exportService.bundleOptions.fonts = val;
  }

  get brandData(): BrandData {
    return this.brandService.brandData;
  }

  get totalSteps(): number {
    return this.brandService.activeSteps.length - 1; // exclude review step
  }

  get completedSteps(): number {
    let count = 0;
    const active = this.brandService.activeSteps;
    for (const step of active) {
      if (step.id === 'review') continue;
      if (this.brandService.isStepValid(step.index)) count++;
    }
    return count;
  }

  isSectionEnabled(id: string): boolean {
    return this.brandData.summary.enabledSections.includes(id);
  }

  get uploadCount(): number {
    const d = this.brandData;
    let count = 0;
    if (d.cover.primaryLogo) count++;
    if (d.cover.shortLogo) count++;
    if (d.cover.background) count++;
    if (d.logo.primary) count++;
    if (d.logo.secondary) count++;
    if (d.logo.icon) count++;
    if (d.logo.horizontal) count++;
    if (d.logo.vertical) count++;
    if (d.logo.monoBlack) count++;
    if (d.logo.monoWhite) count++;
    return count;
  }

  get canExport(): boolean {
    return this.exportService.canExport;
  }

  toggleOption(option: 'json' | 'pdf' | 'logos' | 'fonts'): void {
    this.exportService.toggleBundleOption(option);
  }

  onExportBundle(): void {
    this.exportService.exportBundleZip(this.brandData, this.exportService.bundleOptions);
  }

  // Legacy helper methods
  onExport(): void {
    this.exportService.exportToJson(this.brandData);
  }

  onExportPdf(): void {
    this.exportService.exportToPdf(this.brandData);
  }

  onExportFonts(): void {
    this.exportService.exportFonts(this.brandData);
  }
}
