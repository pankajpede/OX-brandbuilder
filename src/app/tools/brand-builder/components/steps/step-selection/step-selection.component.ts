import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandService } from '../../../services/brand.service';
import { BrandData } from '../../../models/brand.model';

@Component({
  selector: 'app-step-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-selection.component.html',
  styleUrl: './step-selection.component.scss'
})
export class StepSelectionComponent {
  public brandService = inject(BrandService);

  isAnalyzing = false;
  analysisStep = '';
  
  private analysisSteps = [
    'Scanning mockups...',
    'Extracting primary colors...',
    'Analyzing functional UI tones...',
    'Mapping brand identity...',
    'Generating 9-step tonal scales...',
    'Finalizing design system...'
  ];

  get brandData(): BrandData {
    return this.brandService.brandData;
  }

  setMode(mode: 'ai' | 'custom' | 'import'): void {
    this.brandService.updateBrandData({
      ...this.brandData,
      brandMode: mode
    });
    // Auto-advance if custom, or stay to upload if AI/Import
    if (mode === 'custom') {
      this.brandService.nextStep();
    }
  }

  onJsonUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          
          // 1. Full Builder State (Best for editing)
          if (json._builder_state) {
            this.brandService.updateBrandData(json._builder_state);
            this.brandService.nextStep();
            return;
          }

          // 2. Legacy Raw Data or direct BrandData
          if (json.brandMode && json.cover && json.colors) {
            this.brandService.updateBrandData(json);
            this.brandService.nextStep();
            return;
          }

          // 3. Foundations JSON (Best effort mapping)
          if (json.meta && json.foundations) {
            const currentData = this.brandService.brandData;
            this.brandService.updateBrandData({
              ...currentData,
              brandMode: 'import',
              cover: {
                ...currentData.cover,
                name: json.meta.brandName || '',
                description: json.meta.description || '',
                industry: json.meta.industry || []
              },
              typography: {
                ...currentData.typography,
                primaryFont: json.foundations.typography?.fontFamily || 'Inter'
              }
            });
            this.brandService.nextStep();
            return;
          }

          alert('Invalid JSON structure. Please upload a valid Brand Foundations file.');
        } catch (err) {
          alert('Error parsing JSON file.');
        }
      };
      reader.readAsText(file);
    }
  }

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files).slice(0, 5);
      const readers = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(images => {
        this.brandService.updateBrandData({
          ...this.brandData,
          aiMockups: [...this.brandData.aiMockups, ...images].slice(0, 5)
        });
      });
    }
  }

  removeMockup(index: number): void {
    const mockups = [...this.brandData.aiMockups];
    mockups.splice(index, 1);
    this.brandService.updateBrandData({
      ...this.brandData,
      aiMockups: mockups
    });
  }

  async analyzeImages(): Promise<void> {
    if (this.brandData.aiMockups.length === 0) return;

    this.isAnalyzing = true;
    
    // Simulate processing steps for visual feedback
    for (const step of this.analysisSteps) {
      this.analysisStep = step;
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    }

    const sampledColors: string[] = [];
    for (const dataUrl of this.brandData.aiMockups) {
      const colors = await this.extractColorsFromImage(dataUrl);
      sampledColors.push(...colors);
    }

    // Expert Classification
    const classification = this.classifyColors(sampledColors);
    
    const palette = [...this.brandData.colors.palette];
    
    const updateColor = (name: string, hex: string) => {
      const idx = palette.findIndex(c => c.name === name);
      if (idx !== -1) {
        palette[idx] = {
          ...palette[idx],
          hex: hex,
          tones: this.generate9StepScale(hex)
        };
      }
    };

    // 1. Brand / Primary
    if (classification.brand) updateColor('Primary', classification.brand);
    
    // 2. Secondary (Second most dominant vibrant)
    if (classification.secondary) updateColor('Secondary', classification.secondary);

    // 3. Neutrals (Background/Surfaces)
    if (classification.neutral) {
      updateColor('White', classification.neutral); // Using the most dominant neutral as base
      updateColor('Gray', classification.neutral); 
    }

    // 4. Feedback Colors (Functional Extraction)
    if (classification.feedback.success) updateColor('Success', classification.feedback.success);
    if (classification.feedback.warning) updateColor('Warning', classification.feedback.warning);
    if (classification.feedback.error) updateColor('Error', classification.feedback.error);
    if (classification.feedback.info) updateColor('Info', classification.feedback.info);

    this.brandService.updateSection('colors', { palette });
    this.brandService.nextStep();
  }

  private classifyColors(colors: string[]): any {
    const counts: Record<string, number> = {};
    colors.forEach(c => counts[c] = (counts[c] || 0) + 1);

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0]);

    const result: any = {
      brand: null,
      secondary: null,
      neutral: null,
      feedback: { success: null, warning: null, error: null, info: null }
    };

    const vibrants: string[] = [];
    const neutrals: string[] = [];

    sorted.forEach(hex => {
      const hsl = this.hexToHsl(hex);
      if (hsl.s < 10 || (hsl.l > 90 || hsl.l < 10)) {
        neutrals.push(hex);
      } else {
        vibrants.push(hex);
      }
    });

    // Brand is the most frequent vibrant color
    result.brand = vibrants[0] || sorted[0];
    result.secondary = vibrants[1] || null;
    
    // Neutral is the most frequent neutral color (usually background)
    result.neutral = neutrals[0] || '#FFFFFF';

    // Feedback Detection (Hue-based matching)
    vibrants.forEach(hex => {
      const hsl = this.hexToHsl(hex);
      const h = hsl.h;
      
      if (!result.feedback.success && (h >= 100 && h <= 150)) result.feedback.success = hex;
      if (!result.feedback.warning && (h >= 35 && h <= 65)) result.feedback.warning = hex;
      if (!result.feedback.error && (h >= 0 && h <= 20 || h >= 340)) result.feedback.error = hex;
      if (!result.feedback.info && (h >= 190 && h <= 240)) result.feedback.info = hex;
    });

    return result;
  }

  private extractColorsFromImage(dataUrl: string): Promise<string[]> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve([]);
          return;
        }

        // Resize for faster processing
        const maxSide = 200;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxSide) { h *= maxSide / w; w = maxSide; }
        } else {
          if (h > maxSide) { w *= maxSide / h; h = maxSide; }
        }
        
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        
        const imageData = ctx.getImageData(0, 0, w, h).data;
        const colors: string[] = [];
        
        // Sample every 4th pixel for high accuracy
        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];
          
          if (a > 200) { // High opacity only
            const hex = this.rgbToHex(
              Math.round(r / 5) * 5,
              Math.round(g / 5) * 5,
              Math.round(b / 5) * 5
            );
            colors.push(hex);
          }
        }
        resolve(colors);
      };
      img.src = dataUrl;
    });
  }

  private rgbToHex(r: number, g: number, b: number): string {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  private hexToHsl(hex: string) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private generate9StepScale(baseHex: string): string[] {
    const scale: string[] = [];
    const weights = [0.95, 0.8, 0.6, 0.4, 0.2, 0, 0.2, 0.4, 0.6, 0.8]; // 10 steps to match UI
    
    for (let i = 0; i < 10; i++) {
      if (i < 5) {
        // Lighten (50 to 400)
        scale.push(this.mixColors('#FFFFFF', baseHex, 1 - weights[i]));
      } else if (i === 5) {
        // 500
        scale.push(baseHex);
      } else {
        // Darken (600 to 900)
        scale.push(this.mixColors(baseHex, '#000000', weights[i]));
      }
    }
    // Reverse because our UI expects 100% to 0% (White to Black)
    return scale.reverse();
  }

  private mixColors(c1: string, c2: string, weight: number): string {
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);
    
    const r = Math.round(r1 * (1 - weight) + r2 * weight);
    const g = Math.round(g1 * (1 - weight) + g2 * weight);
    const b = Math.round(b1 * (1 - weight) + b2 * weight);
    
    return this.rgbToHex(r, g, b);
  }
}
