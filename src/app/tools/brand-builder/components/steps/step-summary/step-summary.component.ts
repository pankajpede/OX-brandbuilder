import { Component, inject, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';
import { BrandData } from '../../../models/brand.model';
import { SummaryTemplateComponent } from '../../preview/summary-template/summary-template.component';

interface SummaryTemplate {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-step-summary',
  standalone: true,
  imports: [CommonModule, SummaryTemplateComponent],
  templateUrl: './step-summary.component.html',
  styleUrl: './step-summary.component.scss'
})
export class StepSummaryComponent implements OnInit, OnDestroy, AfterViewInit {
  private brandService = inject(BrandService);
  private zone = inject(NgZone);
  private brandDataSub!: Subscription;

  brandData!: BrandData;
  selectedId = '';
  previewId = '';
  thumbScale = 0.224;
  modalScale = 1;

  optionalSteps = [
    { id: 'logo', title: 'Logo System', icon: '◎' },
    { id: 'colors', title: 'Color System', icon: '◐' },
    { id: 'typography', title: 'Typography', icon: 'Aa' },
    { id: 'iconography', title: 'Iconography', icon: '✦' },
    { id: 'techstack', title: 'Tech Stack', icon: '⌘' },
  ];

  templates: SummaryTemplate[] = [
    { id: 's1', name: 'Clean List',     description: 'Numbered with dot leaders' },
    { id: 's2', name: 'Bold Accent',    description: 'Left accent bar + circles' },
    { id: 's3', name: 'Grid Cards',     description: 'Card-based section layout' },
    { id: 's4', name: 'Split Column',   description: 'Color split with index' },
    { id: 's5', name: 'Minimal Center', description: 'Centered & clean' },
  ];

  @ViewChildren('thumbRef') thumbRefs!: QueryList<ElementRef>;

  get enabledCount(): number {
    return this.brandData?.summary?.enabledSections?.length || 0;
  }

  get totalCount(): number {
    return this.optionalSteps.length;
  }

  ngOnInit(): void {
    this.brandData = this.brandService.brandData;
    this.selectedId = this.brandService.getSection('summary').variant || 's1';
    
    this.brandDataSub = this.brandService.brandData$.subscribe(d => {
      this.brandData = d;
    });
  }

  isSectionEnabled(id: string): boolean {
    return this.brandData?.summary?.enabledSections?.includes(id) || false;
  }

  toggleSection(id: string): void {
    const current = [...(this.brandData?.summary?.enabledSections || [])];
    const index = current.indexOf(id);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    
    this.brandService.updateSection('summary', { enabledSections: current });
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
    this.brandDataSub?.unsubscribe();
    document.body.style.overflow = '';
  }

  selectTemplate(id: string): void {
    this.selectedId = id;
    this.brandService.updateSection('summary', { variant: id });
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

  getSelectedName(): string { return this.templates.find(t => t.id === this.selectedId)?.name || ''; }
  getTemplateName(id: string): string { return this.templates.find(t => t.id === id)?.name || ''; }
}
