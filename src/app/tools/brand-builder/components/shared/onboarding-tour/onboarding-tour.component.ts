import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit, AfterContentChecked, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

@Component({
  selector: 'app-onboarding-tour',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-tour.component.html',
  styleUrl: './onboarding-tour.component.scss'
})
export class OnboardingTourComponent implements OnInit, OnDestroy, AfterContentChecked {
  @Input() steps: TourStep[] = [];
  @Output() completed = new EventEmitter<void>();
  @Output() skipped = new EventEmitter<void>();

  currentIndex = 0;
  targetRect: DOMRect | null = null;
  popoverStyle: any = {};
  show = false;

  constructor(private host: ElementRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.show = true;
      this.updatePosition();
    }, 500);
  }

  ngAfterContentChecked(): void {
    if (this.show) {
      this.updatePosition();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updatePosition();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    this.updatePosition();
  }

  @ViewChild('popover') popoverElement!: ElementRef<HTMLElement>;

  updatePosition(): void {
    const step = this.steps[this.currentIndex];
    if (!step) return;

    if (step.position === 'center') {
      this.targetRect = null;
      this.popoverStyle = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed',
        margin: '0'
      };
      return;
    }

    const element = document.getElementById(step.targetId);
    if (!element) {
      this.targetRect = null;
      this.popoverStyle = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed'
      };
      return;
    }

    // Scroll slightly to ensure it's in view
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    this.targetRect = element.getBoundingClientRect();
    
    const rect = this.targetRect;
    const padding = 16;
    const margin = 20; // safe distance from window edges
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    
    // Default dimensions if element not yet measured correctly
    const popW = this.popoverElement?.nativeElement.offsetWidth || 340;
    const popH = this.popoverElement?.nativeElement.offsetHeight || 200;

    let left = 0;
    let top = 0;

    switch (step.position) {
      case 'bottom':
        left = rect.left + rect.width / 2 - popW / 2;
        top = rect.bottom + padding;
        break;
      case 'top':
        left = rect.left + rect.width / 2 - popW / 2;
        top = rect.top - popH - padding;
        break;
      case 'left':
        left = rect.left - popW - padding;
        top = rect.top + rect.height / 2 - popH / 2;
        break;
      case 'right':
        left = rect.right + padding;
        top = rect.top + rect.height / 2 - popH / 2;
        break;
    }

    // Clamp to viewport
    left = Math.max(margin, Math.min(left, winW - popW - margin));
    top = Math.max(margin, Math.min(top, winH - popH - margin));

    this.popoverStyle = {
      top: `${top}px`,
      left: `${left}px`,
      width: `${popW}px`,
      position: 'fixed',
      transform: 'none', // Remove transform to keep clamping accurate
      margin: '0'
    };
  }

  next(): void {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.updatePosition();
    } else {
      this.finish();
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updatePosition();
    }
  }

  skip(): void {
    this.show = false;
    this.skipped.emit();
  }

  finish(): void {
    this.show = false;
    this.completed.emit();
  }

  ngOnDestroy(): void {}
}
