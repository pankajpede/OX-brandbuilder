import { Injectable, inject } from '@angular/core';
import { BrandData } from '../models/brand.model';
import { PdfService } from '../../../services/pdf.service';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private pdfService = inject(PdfService);
  public isExportingPdf = false;
  public pdfCurrentStep = 0;
  public pdfTotalSteps = 0;
  public pdfOverallPercent = 0;
  public pdfProgressText = '';

  exportToJson(data: BrandData): void {
    // Helper to find colors by name or category
    const findColor = (name: string) => data.colors.palette.find((c: any) => c.name === name);
    const findNeutral = () => data.colors.palette.find((c: any) => c.category === 'Neutral' && c.name === 'Gray') 
                             || data.colors.palette.find((c: any) => c.category === 'Neutral');

    const primary = findColor('Primary');
    const secondary = findColor('Secondary');
    const accent = findColor('Accent');
    const success = findColor('Success');
    const error = findColor('Error');
    const warning = findColor('Warning');
    const info = findColor('Info');
    const neutral = findNeutral();

    // Map 10 tones to keys 50-900
    const tonesToMap = (tones: string[] | undefined) => {
      if (!tones || tones.length === 0) return {};
      const map: any = {};
      const keys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      tones.forEach((t, i) => {
        if (i < keys.length) map[keys[i]] = t;
      });
      return map;
    };

    const output = {
      meta: {
        brandName: data.cover.name || "Brand Name",
        description: data.cover.description || "",
        industry: data.cover.industry || [],
        audience: data.cover.audience || [],
        personality: data.cover.personality || [],
        version: "1.0.0",
        theme: "light",
        source: "ox-brand-builder",
        layoutVariant: data.summary.variant
      },
      foundations: {
        color: {
          brand: {
            primary: tonesToMap(primary?.tones),
            secondary: tonesToMap(secondary?.tones),
            accent: tonesToMap(accent?.tones)
          },
          theme: {
            success: tonesToMap(success?.tones),
            error: tonesToMap(error?.tones),
            warning: tonesToMap(warning?.tones),
            info: tonesToMap(info?.tones),
            neutral: tonesToMap(neutral?.tones)
          }
        },
        typography: {
          fontFamily: data.typography.primaryFont,
          scale: {
            h1: { size: "40px", weight: 700, lineHeight: "48px" },
            h2: { size: "32px", weight: 600, lineHeight: "40px" },
            h3: { size: "24px", weight: 600, lineHeight: "32px" },
            body: { size: "14px", weight: 400, lineHeight: "20px" },
            caption: { size: "12px", weight: 400, lineHeight: "16px" }
          }
        },
        spacing: {
          xs: "4px",
          sm: "8px",
          md: "16px",
          lg: "24px",
          xl: "32px"
        },
        radius: {
          sm: "4px",
          md: "8px",
          lg: "12px"
        }
      },
      iconography: {
        library: data.iconography.library,
        style: {
          strokeWidth: 1.5,
          size: 20,
          variant: data.iconography.variant
        },
        installCommand: this.getInstallCommand(data.iconography.library, data.iconography.version),
        repoUrl: this.getRepoUrl(data.iconography.library)
      },
      assets: {
        logoAvailable: !!data.logo.primary,
        logos: {
          primary: !!data.logo.primary,
          secondary: !!data.logo.secondary,
          horizontal: !!data.logo.horizontal,
          vertical: !!data.logo.vertical,
          icon: !!data.logo.icon,
          monoBlack: !!data.logo.monoBlack,
          monoWhite: !!data.logo.monoWhite
        },
        logoUrl: data.logo.primary || null
      },
      _builder_state: data
    };

    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = (data.cover.name || 'brand').toLowerCase().replace(/\s+/g, '-');
    a.href = url;
    a.download = `${fileName}-foundations.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async exportToPdf(data: BrandData): Promise<void> {
    const pdfContainer = (document.querySelector('#pdf-export-container') || document.querySelector('.preview-scroll') || document.querySelector('.preview-container')) as HTMLElement;
    const pages = pdfContainer ? pdfContainer.querySelectorAll('.pdf-page, .preview-page') : document.querySelectorAll('.preview-page');

    if (!pages || pages.length === 0) {
      alert('PDF export template not ready. Please try again.');
      return;
    }

    this.isExportingPdf = true;
    this.pdfCurrentStep = 1;
    this.pdfTotalSteps = pages.length;
    this.pdfOverallPercent = 0;
    this.pdfProgressText = 'Initializing PDF exporter...';

    try {
      await this.pdfService.generatePDF(data, pdfContainer, (currentStep, totalSteps, overallPercent, pageTitle) => {
        this.pdfCurrentStep = currentStep;
        this.pdfTotalSteps = totalSteps;
        this.pdfOverallPercent = overallPercent;
        this.pdfProgressText = pageTitle;
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      this.isExportingPdf = false;
      this.pdfCurrentStep = 0;
      this.pdfTotalSteps = 0;
      this.pdfOverallPercent = 0;
      this.pdfProgressText = '';
    }
  }

  private getInstallCommand(libId: string, version?: string): string {
    const mapping: Record<string, string> = {
      'lucide-icons': 'npm install lucide',
      'feather': 'npm install feather-icons',
      'tabler-icons': 'npm install @tabler/icons',
      'font-awesome': `npm install @fortawesome/fontawesome-free@${version || '6'}`,
      'react-icons': 'npm install react-icons'
    };
    return mapping[libId] || 'npm install icons';
  }

  private getRepoUrl(libId: string): string {
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
