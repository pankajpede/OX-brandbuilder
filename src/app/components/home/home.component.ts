import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ToolCard {
  id: string;
  route: string;
  title: string;
  description: string;
  icon: string;
  status: 'ready' | 'beta' | 'upcoming';
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styles: [`
    :host { display: block; height: 100%; overflow: hidden; }
  `]
})
export class HomeComponent {
  currentYear = new Date().getFullYear();
  activeModal: 'credits' | 'privacy' | 'faq' | null = null;

  tools: ToolCard[] = [
    {
      id: 'brand-builder',
      route: '/brand-builder',
      title: 'Brand Builder',
      description: 'Extract foundations from mockups or build manual guides with AI-powered color & type analysis.',
      icon: '◈',
      status: 'ready',
      color: '#000000'
    },
    {
      id: 'semantic-builder',
      route: '/semantic-builder',
      title: 'Semantic UI',
      description: 'Map foundations to semantic tokens and component variables for multi-theme systems.',
      icon: '❖',
      status: 'beta',
      color: '#4A6E7A'
    },
    {
      id: 'prompt-gen',
      route: '/prompt-gen',
      title: 'Prompt Engine',
      description: 'Generate high-fidelity design prompts for Midjourney & DALL-E based on brand voice.',
      icon: '✨',
      status: 'upcoming',
      color: '#AE2D24'
    }
  ];

  openModal(type: 'credits' | 'privacy' | 'faq'): void {
    this.activeModal = type;
  }

  closeModal(): void {
    this.activeModal = null;
  }
}
