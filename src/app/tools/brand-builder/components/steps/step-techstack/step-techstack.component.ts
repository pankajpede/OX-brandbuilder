import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BrandService } from '../../../services/brand.service';
import { BrandData, SelectedUiFramework } from '../../../models/brand.model';

export interface TechOption {
  id: string;
  name: string;
  image: string;
  versions: string[];
}

export interface UiFrameworkOption {
  id: string;
  name: string;
  image: string;
  versions: string[];
}

@Component({
  selector: 'app-step-techstack',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-techstack.component.html',
  styleUrl: './step-techstack.component.scss'
})
export class StepTechStackComponent implements OnInit, OnDestroy {
  private brandService = inject(BrandService);
  private sub!: Subscription;

  brandData!: BrandData;

  technologies: TechOption[] = [
    { id: 'react', name: 'React', image: 'assets/images/teck-stack/React.svg', versions: ['v18.2.0 (Latest)', 'v18.0.0', 'v17.0.2', 'v16.14.0'] },
    { id: 'angular', name: 'Angular', image: 'assets/images/teck-stack/Angular.png', versions: ['v17.2.0 (Latest)', 'v17.0.0', 'v16.2.0', 'v15.2.0'] },
    { id: 'nextjs', name: 'Next.js', image: 'assets/images/teck-stack/nextjs.svg', versions: ['v14.1.0 (Latest)', 'v14.0.0', 'v13.5.0', 'v13.0.0', 'v12.3.0'] },
    { id: 'nuxt', name: 'Nuxt', image: 'assets/images/teck-stack/Nuxt.svg', versions: ['v3.10.0 (Latest)', 'v3.9.0', 'v3.8.0', 'v2.17.0'] },
    { id: 'svelte', name: 'SvelteKit', image: 'assets/images/teck-stack/Svelte.svg', versions: ['v4.2.0 (Latest)', 'v4.1.0', 'v4.0.0', 'v3.59.0'] },
    { id: 'astro', name: 'Astro', image: 'assets/images/teck-stack/astro.svg', versions: ['v4.4.0 (Latest)', 'v4.0.0', 'v3.6.0', 'v2.10.0'] },
    { id: 'solidjs', name: 'SolidJS', image: 'assets/images/teck-stack/solidjs.svg', versions: ['v1.8.0 (Latest)', 'v1.7.0', 'v1.6.0'] },
    { id: 'qwik', name: 'Qwik', image: 'assets/images/teck-stack/Qwik.png', versions: ['v1.5.0 (Latest)', 'v1.4.0', 'v1.3.0'] },
    { id: 'vuejs', name: 'Vue.js', image: 'assets/images/teck-stack/vuejs.svg', versions: ['v3.4.0 (Latest)', 'v3.3.0', 'v3.2.0', 'v2.7.0'] },
    { id: 'vanillajs', name: 'Vanilla JS', image: 'assets/images/teck-stack/vanillajs.svg', versions: ['ES2024 (Latest)', 'ES2023', 'ES2022', 'ES2020'] }
  ];

  uiFrameworks: UiFrameworkOption[] = [
    { id: 'tailwind', name: 'Tailwind CSS', image: 'assets/images/ui-frameworks/Tailwind-ui.svg', versions: ['v3.4.0 (Latest)', 'v3.3.0', 'v3.2.0', 'v2.2.19'] },
    { id: 'bootstrap', name: 'Bootstrap', image: 'assets/images/ui-frameworks/Bootstrap-ui.svg', versions: ['v5.3.0 (Latest)', 'v5.2.0', 'v5.0.0', 'v4.6.0'] },
    { id: 'shadcn-ui', name: 'Shadcn UI', image: 'assets/images/ui-frameworks/shadcn-ui.svg', versions: ['v0.8.0 (Latest)', 'v0.7.0', 'v0.6.0'] },
    { id: 'material-ui', name: 'Material UI', image: 'assets/images/ui-frameworks/material-ui.svg', versions: ['v5.15.0 (Latest)', 'v5.14.0', 'v5.13.0', 'v4.12.0'] },
    { id: 'chakra-ui', name: 'Chakra UI', image: 'assets/images/ui-frameworks/chakra-ui.svg', versions: ['v2.8.0 (Latest)', 'v2.7.0', 'v2.6.0', 'v1.8.0'] },
    { id: 'antd-ui', name: 'Ant Design', image: 'assets/images/ui-frameworks/Antd-ui.svg', versions: ['v5.14.0 (Latest)', 'v5.13.0', 'v5.12.0', 'v4.24.0'] },
    { id: 'mantine-ui', name: 'Mantine', image: 'assets/images/ui-frameworks/mantine-ui.svg', versions: ['v7.5.0 (Latest)', 'v7.4.0', 'v7.3.0', 'v6.0.0'] },
    { id: 'angular-material', name: 'Angular Material', image: 'assets/images/ui-frameworks/Angular-material-ui.png', versions: ['v17.2.0 (Latest)', 'v17.0.0', 'v16.2.0', 'v15.2.0'] },
    { id: 'primeng', name: 'PrimeNG', image: 'assets/images/ui-frameworks/primeng-ui.svg', versions: ['v17.6.0 (Latest)', 'v17.5.0', 'v16.9.0', 'v15.4.0'] },
    { id: 'bulma', name: 'Bulma', image: 'assets/images/ui-frameworks/Bulma-ui.svg', versions: ['v1.0.0 (Latest)', 'v0.9.4', 'v0.9.3'] },
    { id: 'pico-ui', name: 'Pico CSS', image: 'assets/images/ui-frameworks/pico-ui.svg', versions: ['v2.0.0 (Latest)', 'v1.5.11', 'v1.5.10'] }
  ];

  ngOnInit(): void {
    this.brandData = this.brandService.brandData;
    this.sub = this.brandService.brandData$.subscribe(data => {
      this.brandData = data;
    });

    // Ensure defaults if techstack section is uninitialized
    if (!this.brandData.techstack || !this.brandData.techstack.technology) {
      this.selectTechnology('react');
    }
    
    // Ensure selectedUiFrameworks has tailwind by default
    const currentList = this.brandData.techstack?.selectedUiFrameworks || [];
    if (currentList.length === 0) {
      this.brandService.updateSection('techstack', {
        uiFramework: 'tailwind',
        uiVersion: 'v3.4.0 (Latest)',
        selectedUiFrameworks: [{ id: 'tailwind', version: 'v3.4.0 (Latest)' }]
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get selectedTech(): TechOption | undefined {
    return this.technologies.find(t => t.id === this.brandData.techstack?.technology);
  }

  get selectedUiFrameworksList(): { option: UiFrameworkOption; version: string }[] {
    const list = this.brandData.techstack?.selectedUiFrameworks || [];
    return list.map(item => {
      const opt = this.uiFrameworks.find(u => u.id === item.id);
      return {
        option: opt || { id: item.id, name: item.id, image: '', versions: [item.version] },
        version: item.version
      };
    });
  }

  selectTechnology(techId: string): void {
    const tech = this.technologies.find(t => t.id === techId);
    const defaultVersion = tech ? tech.versions[0] : '';
    this.brandService.updateSection('techstack', {
      technology: techId,
      techVersion: defaultVersion
    });
  }

  onTechVersionChange(version: string): void {
    this.brandService.updateSection('techstack', {
      techVersion: version
    });
  }

  isUiSelected(uiId: string): boolean {
    const list = this.brandData.techstack?.selectedUiFrameworks || [];
    return list.some(item => item.id === uiId);
  }

  toggleUiFramework(uiId: string): void {
    let current = [...(this.brandData.techstack?.selectedUiFrameworks || [])];
    const index = current.findIndex(i => i.id === uiId);

    if (index > -1) {
      // Don't unselect if it's the only one selected
      if (current.length > 1) {
        current.splice(index, 1);
      }
    } else {
      const ui = this.uiFrameworks.find(u => u.id === uiId);
      current.push({
        id: uiId,
        version: ui ? ui.versions[0] : ''
      });
    }

    const first = current[0];
    this.brandService.updateSection('techstack', {
      uiFramework: first ? first.id : 'tailwind',
      uiVersion: first ? first.version : 'v3.4.0 (Latest)',
      selectedUiFrameworks: current
    });
  }

  onUiFrameworkVersionChange(uiId: string, version: string): void {
    let current = (this.brandData.techstack?.selectedUiFrameworks || []).map(item => {
      if (item.id === uiId) {
        return { ...item, version };
      }
      return item;
    });

    const first = current[0];
    this.brandService.updateSection('techstack', {
      uiFramework: first ? first.id : 'tailwind',
      uiVersion: first ? first.version : 'v3.4.0 (Latest)',
      selectedUiFrameworks: current
    });
  }
}
