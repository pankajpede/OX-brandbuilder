import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';
import { ChipInputComponent } from '../../shared/chip-input/chip-input.component';

@Component({
  selector: 'app-step-voice',
  standalone: true,
  imports: [ReactiveFormsModule, ChipInputComponent],
  templateUrl: './step-voice.component.html',
  styleUrl: './step-voice.component.scss'
})
export class StepVoiceComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private sub!: Subscription;

  form!: FormGroup;

  ngOnInit(): void {
    const data = this.brandService.getSection('voice');

    this.form = this.fb.group({
      tone: [data.tone],
      dos: [data.dos],
      donts: [data.donts],
      examples: [data.examples],
    });

    this.sub = this.form.valueChanges.subscribe(val => {
      this.brandService.updateSection('voice', val);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
