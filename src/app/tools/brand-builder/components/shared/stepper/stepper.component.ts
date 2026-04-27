import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StepConfig } from '../../../models/brand.model';

@Component({
  selector: 'app-stepper',
  standalone: true,
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss'
})
export class StepperComponent {
  @Input() steps: StepConfig[] = [];
  @Input() currentStep = 0;
  @Output() stepChange = new EventEmitter<number>();

  get progressPercent(): number {
    if (this.steps.length <= 1) return 0;
    return (this.currentStep / (this.steps.length - 1)) * 100;
  }

  onStepClick(stepIndex: number): void {
    if (stepIndex <= this.currentStep) {
      this.stepChange.emit(stepIndex);
    }
  }
}
