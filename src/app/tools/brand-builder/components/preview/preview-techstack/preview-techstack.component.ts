import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandData } from '../../../models/brand.model';

export interface SelectedUiPreview {
  id: string;
  name: string;
  image: string;
  version: string;
}

@Component({
  selector: 'app-preview-techstack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-techstack.component.html',
  styleUrl: './preview-techstack.component.scss'
})
export class PreviewTechStackComponent {
  @Input() data!: BrandData;
  @Input() pageNumber: string = '07';
  @Input() isPdfView: boolean = false;

  activeHoveredIndex: number | null = null;

  setHoveredIndex(idx: number | null): void {
    this.activeHoveredIndex = idx;
  }

  get techId(): string {
    return this.data?.techstack?.technology || 'react';
  }

  get techVersion(): string {
    return this.data?.techstack?.techVersion || 'v18.2.0 (Latest)';
  }

  get techImage(): string {
    const techId = this.techId;
    switch (techId) {
      case 'react': return 'assets/images/teck-stack/React.svg';
      case 'angular': return 'assets/images/teck-stack/Angular.png';
      case 'nextjs': return 'assets/images/teck-stack/nextjs.svg';
      case 'nuxt': return 'assets/images/teck-stack/Nuxt.svg';
      case 'svelte': return 'assets/images/teck-stack/Svelte.svg';
      case 'astro': return 'assets/images/teck-stack/astro.svg';
      case 'solidjs': return 'assets/images/teck-stack/solidjs.svg';
      case 'qwik': return 'assets/images/teck-stack/Qwik.png';
      case 'vuejs': return 'assets/images/teck-stack/vuejs.svg';
      case 'vanillajs': return 'assets/images/teck-stack/vanillajs.svg';
      default: return 'assets/images/teck-stack/React.svg';
    }
  }

  get techName(): string {
    const techId = this.techId;
    switch (techId) {
      case 'react': return 'React';
      case 'angular': return 'Angular';
      case 'nextjs': return 'Next.js';
      case 'nuxt': return 'Nuxt';
      case 'svelte': return 'SvelteKit';
      case 'astro': return 'Astro';
      case 'solidjs': return 'SolidJS';
      case 'qwik': return 'Qwik';
      case 'vuejs': return 'Vue.js';
      case 'vanillajs': return 'Vanilla JS';
      default: return 'React';
    }
  }

  get selectedUiItems(): SelectedUiPreview[] {
    const list = this.data?.techstack?.selectedUiFrameworks;
    if (list && list.length > 0) {
      return list.map(item => ({
        id: item.id,
        name: this.getUiNameById(item.id),
        image: this.getUiImageById(item.id),
        version: item.version
      }));
    }
    const defaultId = this.data?.techstack?.uiFramework || 'tailwind';
    return [{
      id: defaultId,
      name: this.getUiNameById(defaultId),
      image: this.getUiImageById(defaultId),
      version: this.data?.techstack?.uiVersion || 'v3.4.0 (Latest)'
    }];
  }

  public getUiImageById(uiId: string): string {
    switch (uiId) {
      case 'tailwind': return 'assets/images/ui-frameworks/Tailwind-ui.svg';
      case 'bootstrap': return 'assets/images/ui-frameworks/Bootstrap-ui.svg';
      case 'shadcn-ui': return 'assets/images/ui-frameworks/shadcn-ui.svg';
      case 'material-ui': return 'assets/images/ui-frameworks/Angular.png';
      case 'chakra-ui': return 'assets/images/ui-frameworks/chakra-ui.svg';
      case 'antd-ui': return 'assets/images/ui-frameworks/Antd-ui.svg';
      case 'mantine-ui': return 'assets/images/ui-frameworks/mantine-ui.svg';
      case 'angular-material': return 'assets/images/ui-frameworks/Angular.png';
      case 'primeng': return 'assets/images/ui-frameworks/primeng-ui.svg';
      case 'bulma': return 'assets/images/ui-frameworks/Bulma-ui.svg';
      case 'pico-ui': return 'assets/images/ui-frameworks/pico-ui.svg';
      default: return 'assets/images/ui-frameworks/Tailwind-ui.svg';
    }
  }

  public getUiNameById(uiId: string): string {
    switch (uiId) {
      case 'tailwind': return 'Tailwind CSS';
      case 'bootstrap': return 'Bootstrap';
      case 'shadcn-ui': return 'Shadcn UI';
      case 'material-ui': return 'Material UI';
      case 'chakra-ui': return 'Chakra UI';
      case 'antd-ui': return 'Ant Design';
      case 'mantine-ui': return 'Mantine';
      case 'angular-material': return 'Angular Material';
      case 'primeng': return 'PrimeNG';
      case 'bulma': return 'Bulma';
      case 'pico-ui': return 'Pico CSS';
      default: return 'Tailwind CSS';
    }
  }
}
