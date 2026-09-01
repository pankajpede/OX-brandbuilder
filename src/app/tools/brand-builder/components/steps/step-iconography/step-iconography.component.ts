import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandService } from '../../../services/brand.service';
import { VariantService } from '../../../services/variant.service';
import { BrandData, VariantOption } from '../../../models/brand.model';

@Component({
  selector: 'app-step-iconography',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-iconography.component.html',
  styleUrl: './step-iconography.component.scss'
})
export class StepIconographyComponent implements OnInit {
  brandData!: BrandData;
  libraries: VariantOption[] = [];
  filteredLibraries: VariantOption[] = [];
  searchQuery: string = '';
  selectedLibrary: VariantOption | null = null;

  // Standardized icon sets for preview
  private iconMappings: Record<string, any> = {
    'font-awesome': {
      '5.0': ['user', 'bell', 'envelope', 'trash', 'bookmark', 'calendar', 'comment', 'file', 'image', 'address-card', 'copy', 'save'],
      '6.0': ['user', 'bell', 'envelope', 'trash', 'bookmark', 'calendar', 'comment', 'file', 'image', 'address-card', 'copy', 'floppy-disk'],
      '7.0': ['user', 'bell', 'envelope', 'trash', 'bookmark', 'calendar', 'comment', 'file', 'image', 'address-card', 'copy', 'floppy-disk']
    },
    'feather': ['user', 'bell', 'mail', 'trash-2', 'bookmark', 'calendar', 'message-circle', 'file', 'image', 'user', 'copy', 'save'],
    'tabler-icons': ['user', 'bell', 'mail', 'trash', 'bookmark', 'calendar', 'message', 'file', 'photo', 'copy', 'id', 'device-floppy'],
    'lucide-icons': ['user', 'bell', 'mail', 'trash', 'bookmark', 'calendar', 'message-circle', 'file', 'image', 'copy', 'id-card', 'save'],
    'react-icons': ['FiUser', 'FiBell', 'FiMail', 'FiTrash2', 'FiBookmark', 'FiCalendar', 'FiMessageCircle', 'FiFile', 'FiImage', 'FiCopy', 'FiUser', 'FiCopy', 'FiSave']
  };

  constructor(
    private brandService: BrandService,
    private variantService: VariantService
  ) {}

  ngOnInit() {
    this.brandService.brandData$.subscribe(data => {
      this.brandData = data;
      this.libraries = this.variantService.getVariants('iconography');
      this.filteredLibraries = [...this.libraries];
      
      if (this.brandData.iconography.library) {
        this.selectedLibrary = this.variantService.getVariant('iconography', this.brandData.iconography.library) || null;
        if (this.brandData.iconography.samples.length === 0) {
          this.updateSamples();
        }
      }
    });
  }

  onSearch() {
    const query = this.searchQuery.toLowerCase();
    this.filteredLibraries = this.libraries.filter(lib => 
      lib.name.toLowerCase().includes(query) || 
      lib.description.toLowerCase().includes(query)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  selectLibrary(lib: VariantOption) {
    this.selectedLibrary = lib;
    this.brandData.iconography.library = lib.id;
    
    // Auto-select first version and style if current ones aren't available in new library
    const availableVersions = lib.metadata?.versions || [];
    const availableStyles = lib.metadata?.styles || [];

    if (!availableVersions.includes(this.brandData.iconography.version)) {
      this.brandData.iconography.version = availableVersions[0] || '';
    }
    
    if (!availableStyles.includes(this.brandData.iconography.variant)) {
      this.brandData.iconography.variant = availableStyles[0] || 'regular';
    }

    this.updateSamples();
    this.brandService.updateBrandData(this.brandData);
  }

  updateVariant(variant: string) {
    this.brandData.iconography.variant = variant;
    this.updateSamples();
    this.brandService.updateBrandData(this.brandData);
  }

  updateVersion(version: string) {
    this.brandData.iconography.version = version;
    this.updateSamples();
    this.brandService.updateBrandData(this.brandData);
  }

  updateSamples() {
    const libId = this.selectedLibrary?.id;
    const style = this.brandData.iconography.variant.toLowerCase();
    let samples: string[] = [];

    if (libId === 'font-awesome') {
      if (style === 'brands') {
        samples = ['facebook', 'twitter', 'instagram', 'github', 'linkedin', 'youtube', 'whatsapp', 'google'];
      } else {
        const version = this.brandData.iconography.version;
        samples = this.iconMappings['font-awesome'][version] || this.iconMappings['font-awesome']['6.0'];
      }
    } else if (libId === 'feather') {
      samples = this.iconMappings['feather'];
    } else if (libId === 'tabler-icons') {
      samples = this.iconMappings['tabler-icons'];
    } else if (libId === 'lucide-icons') {
      samples = this.iconMappings['lucide-icons'];
    } else if (libId === 'react-icons') {
      samples = this.iconMappings['react-icons'];
    }

    this.brandData.iconography.samples = samples;
  }

  getIconPath(iconName: string): string {
    if (!this.selectedLibrary) return '';
    const library = this.selectedLibrary.id;
    let style = this.brandData.iconography.variant.toLowerCase();
    const version = this.brandData.iconography.version;
    
    if (library === 'feather') {
      return `icons/feather/${iconName}.svg`;
    }
    
    if (library === 'tabler-icons') {
      return `icons/Tabler-icons/${style}/${iconName}.svg`;
    }

    if (library === 'lucide-icons') {
      return `icons/Lucid-icons/${iconName}.svg`;
    }

    if (library === 'react-icons') {
      const featherName = iconName.replace(/^Fi/, '').split(/(?=[A-Z0-9])/).join('-').toLowerCase();
      const fileName = featherName === 'trash2' ? 'trash-2' : featherName;
      return `icons/feather/${fileName}.svg`;
    }
    
    let fileName = iconName;
    if (library === 'font-awesome' && style === 'regular' && iconName === 'trash') {
      fileName = version === '5.0' ? 'trash-alt' : 'trash-can';
    }
    
    return `icons/font-awesome/${version}/${style}/${fileName}.svg`;
  }

  onIconError(event: any, iconName: string) {
    const img = event.target as HTMLImageElement;
    const library = this.selectedLibrary?.id;
    const version = this.brandData.iconography.version;
    const currentStyle = this.brandData.iconography.variant.toLowerCase();

    if (library === 'font-awesome' && currentStyle !== 'solid' && !img.src.includes('/solid/')) {
      img.src = `icons/font-awesome/${version}/solid/${iconName}.svg`;
    }
  }

  getLibraryLogo(libId: string): string {
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

  get availableVariants(): string[] {
    return this.selectedLibrary?.metadata?.styles || [];
  }

  get availableVersions(): string[] {
    return this.selectedLibrary?.metadata?.versions || [];
  }
}
