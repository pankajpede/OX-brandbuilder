import { Injectable, inject } from '@angular/core';
import { BrandData } from '../models/brand.model';
import { PdfService } from '../../../services/pdf.service';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export interface ExportBundleOptions {
  json: boolean;
  pdf: boolean;
  fonts: boolean;
}

export type ExportStage = 'init' | 'json' | 'pdf' | 'fonts' | 'zip';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private pdfService = inject(PdfService);

  public isExportingPdf = false;
  public isExportingFonts = false;
  public isExportingBundle = false;

  public bundleProgressText = '';
  public bundlePercent = 0;
  public currentStage: ExportStage = 'init';
  public bundleOptions: ExportBundleOptions = { json: true, pdf: true, fonts: true };

  public pdfCurrentStep = 0;
  public pdfTotalSteps = 0;
  public pdfOverallPercent = 0;
  public pdfProgressText = '';

  /** Build JSON foundations payload */
  buildJsonContent(data: BrandData): any {
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

    const tonesToMap = (tones: string[] | undefined) => {
      if (!tones || tones.length === 0) return {};
      const map: any = {};
      const keys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      tones.forEach((t, i) => {
        if (i < keys.length) map[keys[i]] = t;
      });
      return map;
    };

    return {
      meta: {
        brandName: data.cover.name || "Brand Name",
        description: data.cover.description || "",
        industry: data.cover.industry || [],
        audience: data.cover.audience || [],
        personality: data.cover.personality || [],
        version: "1.0.0",
        theme: "light",
        source: "ufx-studio-brandbuilder",
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
          tone: data.typography.tone,
          density: data.typography.density,
          scale: {
            h1: { size: "40px", weight: 700, lineHeight: "48px" },
            h2: { size: "32px", weight: 600, lineHeight: "40px" },
            h3: { size: "24px", weight: 600, lineHeight: "32px" },
            body: { size: "14px", weight: 400, lineHeight: "20px" },
            caption: { size: "12px", weight: 400, lineHeight: "16px" }
          }
        },
        spacing: {
          xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px"
        },
        radius: {
          sm: "4px", md: "8px", lg: "12px"
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
  }

  exportToJson(data: BrandData): void {
    const output = this.buildJsonContent(data);
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const fileName = (data.cover.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
    saveAs(blob, `${fileName}-foundations.json`);
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

  async exportFonts(data: BrandData): Promise<void> {
    const fontName = data.typography?.primaryFont || 'Inter';
    const tone = (data.typography?.tone || 'professional').toLowerCase();
    const brandName = data.cover?.name || 'Brand';
    const cleanBrandName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanFontName = fontName.replace(/\s+/g, '');

    let weights = [400, 600, 700];
    if (tone.includes('professional') || tone.includes('corporate') || tone.includes('clean')) {
      weights = [400, 500, 600, 700];
    } else if (tone.includes('playful') || tone.includes('expressive')) {
      weights = [400, 600, 800];
    } else if (tone.includes('minimal') || tone.includes('modern')) {
      weights = [300, 400, 600];
    } else if (tone.includes('technical') || tone.includes('developer')) {
      weights = [400, 500, 700];
    }

    const weightLabels: Record<number, string> = {
      300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black'
    };

    this.isExportingFonts = true;
    const zip = new JSZip();
    let downloadedCount = 0;
    const downloadedFilesInfo: string[] = [];

    try {
      for (const weight of weights) {
        const url = await this.getTtfUrl(fontName, weight);
        if (url) {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            const label = weightLabels[weight] || `${weight}`;
            const fileName = `${cleanFontName}-${label}.ttf`;
            zip.file(fileName, blob);
            downloadedCount++;
            downloadedFilesInfo.push(`  - ${fileName} (${weight} ${label})`);
          }
        }
      }

      if (downloadedCount > 0) {
        const googleSpecimenUrl = `https://fonts.google.com/specimen/${encodeURIComponent(fontName)}`;
        const readmeContent = `========================================================================
  ${brandName.toUpperCase()} — TYPOGRAPHY FONT PACKAGE (.TTF)
  Generated via UFX Studio (Universal Framework & Xecution)
========================================================================

PRIMARY FONT FAMILY: ${fontName}
TYPOGRAPHIC TONE:   ${data.typography?.tone || 'Professional'}
SYSTEM DENSITY:     ${data.typography?.density || 'Comfortable'}

INCLUDED FONT FILES (.TTF):
${downloadedFilesInfo.join('\n')}

------------------------------------------------------------------------
OPEN SOURCE & LICENSING ACKNOWLEDGMENT
------------------------------------------------------------------------
These font files are open-source assets provided freely by Google Fonts
(https://fonts.google.com).

Font Specimen Page: ${googleSpecimenUrl}
Google Fonts Home:  https://fonts.google.com

LICENSE INFORMATION:
The fonts in this package are licensed under open-source software
licenses (such as SIL Open Font License 1.1 or Apache License 2.0).

You are free to use, modify, and distribute these fonts in your personal,
commercial, web, mobile, and print projects.

Special thanks and credit to Google Fonts and open-source designers.

------------------------------------------------------------------------
HOW TO INSTALL THE TTF FONTS:
------------------------------------------------------------------------
• Windows: Right-click each .ttf file and select "Install".
• macOS: Double-click each .ttf file and click "Install Font" in Font Book.
• Linux: Copy .ttf files to ~/.local/share/fonts/ or /usr/share/fonts/.

Generated with UFX Studio — Free-Hand Design-to-Code Platform
========================================================================
`;
        zip.file('README.txt', readmeContent);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${cleanBrandName}-${cleanFontName}-fonts.zip`);
      } else {
        alert(`Could not fetch TTF font files directly for "${fontName}". You can access them at https://fonts.google.com/specimen/${encodeURIComponent(fontName)}`);
      }
    } catch (err) {
      console.error('Error creating font zip package:', err);
      alert(`Error creating font ZIP package for ${fontName}. Please try again.`);
    } finally {
      this.isExportingFonts = false;
    }
  }

  /** Export customized single ZIP package holding selected subfolders with stage progress */
  async exportBundleZip(data: BrandData, options: ExportBundleOptions): Promise<void> {
    if (!options.json && !options.pdf && !options.fonts) {
      alert('Please select at least one export option.');
      return;
    }

    const brandName = data.cover?.name || 'Brand';
    const cleanBrandName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const fontName = data.typography?.primaryFont || 'Inter';
    const cleanFontName = fontName.replace(/\s+/g, '');
    const tone = (data.typography?.tone || 'professional').toLowerCase();

    this.isExportingBundle = true;
    this.bundleOptions = { ...options };
    this.bundlePercent = 5;
    this.currentStage = 'init';
    this.bundleProgressText = 'Creating export package container...';

    const masterZip = new JSZip();
    const manifestItems: string[] = [];

    try {
      // 1. JSON Foundations Export (if selected)
      if (options.json) {
        this.currentStage = 'json';
        this.bundlePercent = 15;
        this.bundleProgressText = 'Generating JSON design tokens & schema...';
        await new Promise(r => setTimeout(r, 120));

        const jsonContent = this.buildJsonContent(data);
        const jsonFolder = masterZip.folder('json');
        if (jsonFolder) {
          jsonFolder.file(`${cleanBrandName}-foundations.json`, JSON.stringify(jsonContent, null, 2));
        }
        manifestItems.push(`  - /json/ ${cleanBrandName}-foundations.json (Design tokens & builder state)`);
      }

      // 2. Brand Guide PDF Export (if selected)
      if (options.pdf) {
        this.currentStage = 'pdf';
        this.bundlePercent = options.json ? 30 : 15;
        this.bundleProgressText = 'Compiling Brand Guide PDF pages...';
        const pdfContainer = (document.querySelector('#pdf-export-container') || document.querySelector('.preview-scroll') || document.querySelector('.preview-container')) as HTMLElement;
        
        if (pdfContainer) {
          const pdfBlob = await this.pdfService.generatePdfBlob(data, pdfContainer, (currentStep, totalSteps, overallPercent, pageTitle) => {
            const startPct = options.json ? 30 : 15;
            const endPct = options.fonts ? 75 : 85;
            this.bundlePercent = startPct + Math.round((overallPercent / 100) * (endPct - startPct));
            this.bundleProgressText = `Rendering PDF Page ${currentStep}/${totalSteps}: ${pageTitle}`;
          });
          const brandGuideFolder = masterZip.folder('brand-guide');
          if (brandGuideFolder) {
            brandGuideFolder.file(`${cleanBrandName}-brand-guide.pdf`, pdfBlob);
          }
          manifestItems.push(`  - /brand-guide/ ${cleanBrandName}-brand-guide.pdf (Complete brand guideline document)`);
        }
      }

      // 3. TTF Fonts Package (if selected)
      if (options.fonts) {
        this.currentStage = 'fonts';
        this.bundlePercent = options.pdf ? 80 : (options.json ? 50 : 20);
        this.bundleProgressText = `Fetching Google Fonts for ${fontName}...`;
        
        let weights = [400, 600, 700];
        if (tone.includes('professional') || tone.includes('corporate') || tone.includes('clean')) {
          weights = [400, 500, 600, 700];
        } else if (tone.includes('playful') || tone.includes('expressive')) {
          weights = [400, 600, 800];
        } else if (tone.includes('minimal') || tone.includes('modern')) {
          weights = [300, 400, 600];
        } else if (tone.includes('technical') || tone.includes('developer')) {
          weights = [400, 500, 700];
        }

        const weightLabels: Record<number, string> = {
          300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black'
        };

        const fontsFolder = masterZip.folder('fonts');
        let fontCount = 0;
        const downloadedFilesInfo: string[] = [];

        for (let i = 0; i < weights.length; i++) {
          const weight = weights[i];
          const label = weightLabels[weight] || `${weight}`;
          this.bundleProgressText = `Downloading font file: ${fontName} ${label} (${i + 1}/${weights.length})...`;

          const url = await this.getTtfUrl(fontName, weight);
          if (url) {
            const res = await fetch(url);
            if (res.ok) {
              const blob = await res.blob();
              const fileName = `${cleanFontName}-${label}.ttf`;
              if (fontsFolder) {
                fontsFolder.file(fileName, blob);
              }
              fontCount++;
              downloadedFilesInfo.push(`    - ${fileName} (${weight} ${label})`);
            }
          }
        }

        if (fontCount > 0 && fontsFolder) {
          const googleSpecimenUrl = `https://fonts.google.com/specimen/${encodeURIComponent(fontName)}`;
          const readmeContent = `========================================================================
  ${brandName.toUpperCase()} — TYPOGRAPHY FONT PACKAGE (.TTF)
  Generated via UFX Studio (Universal Framework & Xecution)
========================================================================

PRIMARY FONT FAMILY: ${fontName}
TYPOGRAPHIC TONE:   ${data.typography?.tone || 'Professional'}
SYSTEM DENSITY:     ${data.typography?.density || 'Comfortable'}

INCLUDED FONT FILES (.TTF):
${downloadedFilesInfo.join('\n')}

------------------------------------------------------------------------
OPEN SOURCE & LICENSING ACKNOWLEDGMENT
------------------------------------------------------------------------
These font files are open-source assets provided freely by Google Fonts
(https://fonts.google.com).

Font Specimen Page: ${googleSpecimenUrl}
Google Fonts Home:  https://fonts.google.com

LICENSE INFORMATION:
The fonts in this package are licensed under open-source software
licenses (such as SIL Open Font License 1.1 or Apache License 2.0).

You are free to use, modify, and distribute these fonts in your personal,
commercial, web, mobile, and print projects.

Special thanks and credit to Google Fonts and open-source designers.

------------------------------------------------------------------------
HOW TO INSTALL THE TTF FONTS:
------------------------------------------------------------------------
• Windows: Right-click each .ttf file and select "Install".
• macOS: Double-click each .ttf file and click "Install Font" in Font Book.
• Linux: Copy .ttf files to ~/.local/share/fonts/ or /usr/share/fonts/.

Generated with UFX Studio — Free-Hand Design-to-Code Platform
========================================================================
`;
          fontsFolder.file('README.txt', readmeContent);
          manifestItems.push(`  - /fonts/ ${fontCount} TTF files + README.txt (Google Fonts package for ${fontName})`);
        }
      }

      // 4. Root MANIFEST.txt & ZIP Compression
      this.currentStage = 'zip';
      this.bundlePercent = 95;
      this.bundleProgressText = 'Creating MANIFEST.txt & compressing ZIP archive...';
      const manifestContent = `========================================================================
  ${brandName.toUpperCase()} — BRAND ASSET BUNDLE (.ZIP)
  Generated via UFX Studio (Universal Framework & Xecution)
========================================================================

BRAND NAME:       ${brandName}
TAGLINE:          ${data.cover?.tagline || 'N/A'}
EXPORT DATE:      ${new Date().toLocaleString()}
GENERATED BY:     UFX Studio (Universal Framework & Xecution Suite)

EXPORTED DIRECTORIES & FILES:
${manifestItems.join('\n')}

------------------------------------------------------------------------
DIRECTORY STRUCTURE OVERVIEW:
------------------------------------------------------------------------
• /json/        - Holds raw JSON tokens for developer import & theme engines.
• /brand-guide/ - Holds multi-page PDF guideline document for stakeholders.
• /fonts/       - Holds raw .ttf font files & Google Fonts licensing README.

Thank you for building your design system with UFX Studio!
========================================================================
`;
      masterZip.file('MANIFEST.txt', manifestContent);

      // 5. Download zip
      this.bundlePercent = 99;
      this.bundleProgressText = 'Finalizing package download...';
      await new Promise(r => setTimeout(r, 100));

      const zipBlob = await masterZip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${cleanBrandName}-brand-package.zip`);
    } catch (err) {
      console.error('Error generating brand package ZIP:', err);
      alert('Failed to generate export ZIP package. Please try again.');
    } finally {
      this.bundlePercent = 100;
      await new Promise(r => setTimeout(r, 200));
      this.isExportingBundle = false;
      this.bundlePercent = 0;
      this.bundleProgressText = '';
      this.currentStage = 'init';
    }
  }

  private async getTtfUrl(fontName: string, weight: number): Promise<string | null> {
    try {
      const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@${weight}`;
      const res = await fetch(cssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0'
        }
      });
      if (res.ok) {
        const cssText = await res.text();
        const match = cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.(?:ttf|otf|woff2|woff))\)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch (err) {
      console.warn(`CSS query failed for ${fontName}:${weight}`, err);
    }
    return null;
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
