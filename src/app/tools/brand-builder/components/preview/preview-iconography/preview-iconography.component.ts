import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandData } from '../../../models/brand.model';
import { VariantService } from '../../../services/variant.service';

@Component({
  selector: 'app-preview-iconography',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-iconography.component.html',
  styleUrl: './preview-iconography.component.scss'
})
export class PreviewIconographyComponent {
  @Input() data!: BrandData;

  constructor(private variantService: VariantService) {}

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }

  get libraryName(): string {
    const libId = this.data.iconography.library;
    const lib = this.variantService.getVariant('iconography', libId);
    return lib ? lib.name : 'Selected Library';
  }

  get sampleIcons(): string[] {
    return this.data.iconography.samples || [];
  }

  getIconPath(iconName: string, style: string): string {
    const library = this.data.iconography.library;
    const version = this.data.iconography.version;
    const normalizedStyle = style.toLowerCase();
    
    if (library === 'feather') {
      return `icons/feather/${iconName}.svg`;
    }
    
    if (library === 'tabler-icons') {
      return `icons/Tabler-icons/${normalizedStyle}/${iconName}.svg`;
    }
    
    if (library === 'lucide-icons') {
      return `icons/Lucid-icons/${iconName}.svg`;
    }

    if (library === 'react-icons') {
      // Map FiName to name.svg in feather folder
      const featherName = iconName.replace(/^Fi/, '').split(/(?=[A-Z0-9])/).join('-').toLowerCase();
      // Handle trash-2 specific mapping if needed
      const fileName = featherName === 'trash2' ? 'trash-2' : featherName;
      return `icons/feather/${fileName}.svg`;
    }
    
    // Handle specific filename mapping for Trash in Regular style
    let fileName = iconName;
    if (library === 'font-awesome' && normalizedStyle === 'regular' && iconName === 'trash') {
      fileName = version === '5.0' ? 'trash-alt' : 'trash-can';
    }
    
    return `icons/font-awesome/${version}/${normalizedStyle}/${fileName}.svg`;
  }

  onIconError(event: any, iconName: string, style: string) {
    const img = event.target as HTMLImageElement;
    const library = this.data.iconography.library;
    const version = this.data.iconography.version;
    const currentStyle = style.toLowerCase();

    // If we were trying regular/brands and failed, fallback to solid
    if (library === 'font-awesome' && currentStyle !== 'solid' && !img.src.includes('/solid/')) {
      img.src = `icons/font-awesome/${version}/solid/${iconName}.svg`;
    }
  }

  getAvailableStyles(): string[] {
    const libId = this.data.iconography.library;
    if (libId === 'font-awesome') {
      return ['Solid', 'Regular', 'Brands'];
    } else if (libId === 'feather') {
      return ['Regular'];
    } else if (libId === 'tabler-icons') {
      return ['Outline', 'Filled'];
    } else if (libId === 'lucide-icons') {
      return ['Regular'];
    } else if (libId === 'react-icons') {
      return ['Regular'];
    }
    return [];
  }

  getSampleIcons(style: string): string[] {
    if (style.toLowerCase() === 'brands') {
      return ['facebook', 'twitter', 'instagram', 'github', 'linkedin', 'youtube', 'whatsapp', 'google'];
    }
    return this.data.iconography.samples || [];
  }

  getLibraryLogo(): string {
    const libId = this.data.iconography.library;
    if (libId === 'react-icons') {
      return 'icons/feather/react-icon-logo.svg';
    }
    const pathMapping: Record<string, string> = {
      'tabler-icons': 'Tabler-icons',
      'lucide-icons': 'Lucid-icons'
    };
    const path = pathMapping[libId] || libId;
    return `icons/${path}/logo.svg`;
  }

  getInstallCommand(): string {
    const libId = this.data.iconography.library;
    const version = this.data.iconography.version;
    const mapping: Record<string, string> = {
      'lucide-icons': 'npm install lucide',
      'feather': 'npm install feather-icons',
      'tabler-icons': 'npm install @tabler/icons',
      'font-awesome': `npm install @fortawesome/fontawesome-free@${version || '6'}`,
      'react-icons': 'npm install react-icons'
    };
    return mapping[libId] || 'npm install icons';
  }

  getRepoUrl(): string {
    const libId = this.data.iconography.library;
    const mapping: Record<string, string> = {
      'lucide-icons': 'https://github.com/lucide-icons/lucide',
      'feather': 'https://github.com/feathericons/feather',
      'tabler-icons': 'https://github.com/tabler/tabler-icons',
      'font-awesome': 'https://github.com/FortAwesome/Font-Awesome',
      'react-icons': 'https://github.com/react-icons/react-icons'
    };
    return mapping[libId] || 'https://github.com';
  }
}
