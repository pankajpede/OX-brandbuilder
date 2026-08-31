import { Injectable } from '@angular/core';
import { VariantOption } from '../models/brand.model';

@Injectable({ providedIn: 'root' })
export class VariantService {

  private variants: Record<string, VariantOption[]> = {
    cover: [
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean and understated with centered typography',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#000" rx="4"/>
          <rect x="30" y="25" width="60" height="4" fill="#fff" rx="2"/>
          <rect x="40" y="35" width="40" height="2" fill="#666" rx="1"/>
          <rect x="45" y="42" width="30" height="2" fill="#444" rx="1"/>
        `),
      },
      {
        id: 'bold',
        name: 'Bold',
        description: 'Large display type with strong contrast',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#111" rx="4"/>
          <rect x="10" y="15" width="80" height="8" fill="#fff" rx="2"/>
          <rect x="10" y="30" width="50" height="3" fill="#666" rx="1"/>
          <rect x="10" y="55" width="25" height="25" fill="#333" rx="3"/>
          <rect x="10" y="38" width="35" height="2" fill="#444" rx="1"/>
        `),
      },
      {
        id: 'editorial',
        name: 'Editorial',
        description: 'Magazine-style layout with image background',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#222" rx="4"/>
          <rect x="0" y="0" width="60" height="80" fill="#333" rx="4"/>
          <rect x="70" y="20" width="40" height="6" fill="#fff" rx="2"/>
          <rect x="70" y="32" width="30" height="2" fill="#888" rx="1"/>
          <rect x="70" y="38" width="35" height="2" fill="#666" rx="1"/>
          <rect x="70" y="55" width="20" height="8" fill="#fff" rx="3"/>
        `),
      },
    ],

    logo: [
      {
        id: 'grid',
        name: 'Grid Layout',
        description: 'Organized grid showcasing all logo versions',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#fff" rx="4" stroke="#e5e5e5"/>
          <rect x="8" y="8" width="46" height="28" fill="#f5f5f5" rx="3"/>
          <rect x="62" y="8" width="46" height="28" fill="#f5f5f5" rx="3"/>
          <rect x="8" y="44" width="46" height="28" fill="#f5f5f5" rx="3"/>
          <rect x="62" y="44" width="46" height="28" fill="#000" rx="3"/>
          <rect x="20" y="18" width="22" height="8" fill="#d4d4d4" rx="2"/>
          <rect x="74" y="18" width="22" height="8" fill="#d4d4d4" rx="2"/>
          <rect x="20" y="54" width="22" height="8" fill="#d4d4d4" rx="2"/>
          <rect x="74" y="54" width="22" height="8" fill="#fff" rx="2"/>
        `),
      },
      {
        id: 'centered',
        name: 'Centered',
        description: 'Hero-style with primary logo front and center',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#fff" rx="4" stroke="#e5e5e5"/>
          <rect x="30" y="15" width="60" height="30" fill="#f5f5f5" rx="4"/>
          <rect x="42" y="23" width="36" height="14" fill="#d4d4d4" rx="3"/>
          <rect x="20" y="55" width="24" height="16" fill="#f5f5f5" rx="2"/>
          <rect x="48" y="55" width="24" height="16" fill="#f5f5f5" rx="2"/>
          <rect x="76" y="55" width="24" height="16" fill="#f5f5f5" rx="2"/>
        `),
      },
      {
        id: 'documented',
        name: 'Documented',
        description: 'Detailed specifications with measurements',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#fff" rx="4" stroke="#e5e5e5"/>
          <rect x="8" y="8" width="60" height="64" fill="#f5f5f5" rx="3"/>
          <rect x="20" y="25" width="36" height="20" fill="#d4d4d4" rx="3"/>
          <line x1="20" y1="20" x2="20" y2="50" stroke="#a3a3a3" stroke-dasharray="2"/>
          <line x1="56" y1="20" x2="56" y2="50" stroke="#a3a3a3" stroke-dasharray="2"/>
          <rect x="76" y="12" width="36" height="3" fill="#d4d4d4" rx="1"/>
          <rect x="76" y="20" width="28" height="2" fill="#e5e5e5" rx="1"/>
          <rect x="76" y="28" width="36" height="3" fill="#d4d4d4" rx="1"/>
          <rect x="76" y="36" width="28" height="2" fill="#e5e5e5" rx="1"/>
          <rect x="76" y="44" width="36" height="3" fill="#d4d4d4" rx="1"/>
          <rect x="76" y="52" width="28" height="2" fill="#e5e5e5" rx="1"/>
        `),
      },
    ],

    colors: [
      {
        id: 'tonal-palette',
        name: 'Tonal Palette',
        description: 'Professional tonal scale with key colors and adjustable palettes',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#fff" rx="4" stroke="#e5e5e5"/>
          <rect x="8" y="8" width="30" height="30" fill="#000000" rx="4"/>
          <rect x="42" y="10" width="10" height="10" fill="#171717" rx="1"/>
          <rect x="54" y="10" width="10" height="10" fill="#404040" rx="1"/>
          <rect x="66" y="10" width="10" height="10" fill="#737373" rx="1"/>
          <rect x="78" y="10" width="10" height="10" fill="#a3a3a3" rx="1"/>
          <rect x="90" y="10" width="10" height="10" fill="#e5e5e5" rx="1"/>
          <rect x="8" y="44" width="30" height="30" fill="#404040" rx="4"/>
          <rect x="42" y="46" width="10" height="10" fill="#171717" rx="1"/>
          <rect x="54" y="46" width="10" height="10" fill="#404040" rx="1"/>
          <rect x="66" y="46" width="10" height="10" fill="#737373" rx="1"/>
          <rect x="78" y="46" width="10" height="10" fill="#a3a3a3" rx="1"/>
          <rect x="90" y="46" width="10" height="10" fill="#e5e5e5" rx="1"/>
        `),
      },
      {
        id: 'strips',
        name: 'Color Strips',
        description: 'Horizontal strip layout with values',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#fff" rx="4" stroke="#e5e5e5"/>
          <rect x="8" y="8" width="104" height="16" fill="#000" rx="3"/>
          <rect x="8" y="30" width="104" height="16" fill="#525252" rx="3"/>
          <rect x="8" y="52" width="104" height="16" fill="#d4d4d4" rx="3"/>
          <rect x="14" y="13" width="30" height="6" fill="#fff" rx="2"/>
          <rect x="14" y="35" width="30" height="6" fill="#fff" rx="2"/>
          <rect x="14" y="57" width="30" height="6" fill="#fff" rx="2"/>
        `),
      },
      {
        id: 'palette-grid',
        name: 'Palette Grid',
        description: 'Compact grid with large swatches',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#fff" rx="4" stroke="#e5e5e5"/>
          <rect x="8" y="8" width="50" height="30" fill="#000" rx="3"/>
          <rect x="62" y="8" width="50" height="30" fill="#333" rx="3"/>
          <rect x="8" y="42" width="33" height="30" fill="#666" rx="3"/>
          <rect x="44" y="42" width="33" height="30" fill="#999" rx="3"/>
          <rect x="80" y="42" width="33" height="30" fill="#ccc" rx="3"/>
        `),
      },
    ],

    typography: [
      {
        id: 'core',
        name: 'Core Typography',
        description: 'Comprehensive overview of atomic text styles and UI context',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#fff" rx="4" stroke="#e5e5e5"/>
          <text x="12" y="30" font-family="sans-serif" font-weight="900" font-size="24" fill="#111">Aa</text>
          <rect x="50" y="16" width="50" height="4" fill="#333" rx="2"/>
          <rect x="50" y="24" width="30" height="2" fill="#666" rx="1"/>
          <line x1="12" y1="45" x2="108" y2="45" stroke="#eee" stroke-width="1"/>
          <rect x="12" y="55" width="20" height="8" fill="#16a34a" rx="2"/>
          <rect x="36" y="55" width="35" height="8" fill="#f3f4f6" rx="2"/>
          <rect x="75" y="55" width="20" height="8" fill="#f3f4f6" rx="2"/>
        `),
      },
      {
        id: 'content',
        name: 'Content Layout',
        description: 'Editorial article with title and body text',
        thumbnail: this.createSvg(`
          <rect width="120" height="80" fill="#fff" rx="4" stroke="#e5e5e5"/>
          <rect x="10" y="15" width="80" height="8" fill="#000" rx="2"/>
          <rect x="10" y="28" width="60" height="2" fill="#666" rx="1"/>
          <rect x="10" y="34" width="100" height="2" fill="#999" rx="0.5"/>
          <rect x="10" y="38" width="100" height="2" fill="#999" rx="0.5"/>
          <rect x="10" y="42" width="90" height="2" fill="#999" rx="0.5"/>
        `),
      },
    ],

    iconography: [
      { 
        id: 'react-icons', 
        name: 'React Icons', 
        description: 'Include popular icons in your React projects easily', 
        thumbnail: '⚛',
        metadata: {
          versions: ['4.12.0'],
          styles: ['regular']
        }
      },
      { 
        id: 'font-awesome', 
        name: 'Font Awesome', 
        description: 'The world\'s most popular icon set', 
        thumbnail: '',
        metadata: {
          versions: ['5.0', '6.0', '7.0'],
          styles: ['solid', 'regular', 'brands']
        }
      },
      { 
        id: 'feather', 
        name: 'Feather Icons', 
        description: 'Simply beautiful open source icons', 
        thumbnail: '✒',
        metadata: {
          versions: ['4.29'],
          styles: ['regular']
        }
      },
      { 
        id: 'tabler-icons', 
        name: 'Tabler Icons', 
        description: 'A set of over 5200 free high-quality SVG icons', 
        thumbnail: '⊞',
        metadata: {
          versions: ['1.0'],
          styles: ['outline', 'filled']
        }
      },
      { 
        id: 'lucide-icons', 
        name: 'Lucide Icons', 
        description: 'Beautiful & consistent icons made by the community', 
        thumbnail: '✦',
        metadata: {
          versions: ['latest'],
          styles: ['regular']
        }
      },
    ],

    printables: [],
  };

  /** Get available variants for a section */
  getVariants(section: string): VariantOption[] {
    return this.variants[section] || [];
  }

  /** Get a specific variant by section and id */
  getVariant(section: string, id: string): VariantOption | undefined {
    return this.variants[section]?.find(v => v.id === id);
  }

  /** Create SVG data URI from inline SVG content */
  private createSvg(content: string): string {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">${content}</svg>`)}`;
  }
}
