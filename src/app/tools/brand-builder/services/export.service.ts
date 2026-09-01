import { Injectable, inject } from '@angular/core';
import { BrandData } from '../models/brand.model';
import { PdfService } from '../../../services/pdf.service';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export interface ExportBundleOptions {
  json: boolean;
  pdf: boolean;
  fonts: boolean;
  logos?: boolean;
}

export type ExportStage = 'init' | 'json' | 'pdf' | 'fonts' | 'logos' | 'zip';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private pdfService = inject(PdfService);

  public isExportingPdf = false;
  public isExportingFonts = false;
  public isExportingBundle = false;

  public bundleProgressText = '';
  public bundlePercent = 0;
  public currentStage: ExportStage = 'init';
  public bundleOptions: ExportBundleOptions = { json: true, pdf: true, fonts: true, logos: true };

  public pdfCurrentStep = 0;
  public pdfTotalSteps = 0;
  public pdfOverallPercent = 0;
  public pdfProgressText = '';

  public toggleBundleOption(option: 'json' | 'pdf' | 'logos' | 'fonts'): void {
    if (option === 'json') this.bundleOptions.json = !this.bundleOptions.json;
    if (option === 'pdf') this.bundleOptions.pdf = !this.bundleOptions.pdf;
    if (option === 'logos') this.bundleOptions.logos = !this.bundleOptions.logos;
    if (option === 'fonts') this.bundleOptions.fonts = !this.bundleOptions.fonts;
  }

  public get canExport(): boolean {
    return !!(this.bundleOptions.json || this.bundleOptions.pdf || this.bundleOptions.logos !== false || this.bundleOptions.fonts);
  }

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

  /** Convert base64 Data URL or fetch URL to Blob */
  private dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } | null {
    if (!dataUrl || typeof dataUrl !== 'string') return null;
    if (dataUrl.startsWith('data:')) {
      const parts = dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      let ext = 'png';
      if (mime.includes('svg')) ext = 'svg';
      else if (mime.includes('jpg') || mime.includes('jpeg')) ext = 'jpg';
      else if (mime.includes('webp')) ext = 'webp';

      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return { blob: new Blob([u8arr], { type: mime }), ext };
    }
    return null;
  }

  /** Export customized single ZIP package holding selected subfolders with stage progress */
  async exportBundleZip(data: BrandData, options?: ExportBundleOptions): Promise<void> {
    const opts = options || this.bundleOptions;
    if (!opts.json && !opts.pdf && !opts.fonts && !opts.logos) {
      alert('Please select at least one export option.');
      return;
    }

    const brandName = data.cover?.name || 'Brand';
    const cleanBrandName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const fontName = data.typography?.primaryFont || 'Inter';
    const cleanFontName = fontName.replace(/\s+/g, '');
    const tone = (data.typography?.tone || 'professional').toLowerCase();

    this.isExportingBundle = true;
    this.bundleOptions = { ...opts };
    this.bundlePercent = 5;
    this.currentStage = 'init';
    this.bundleProgressText = 'Creating export package container...';

    const masterZip = new JSZip();
    const manifestItems: string[] = [];

    try {
      // 1. JSON Foundations Export (if selected)
      if (opts.json) {
        this.currentStage = 'json';
        this.bundlePercent = 15;
        this.bundleProgressText = 'Generating JSON design tokens & schema...';
        await new Promise(r => setTimeout(r, 100));

        const jsonContent = this.buildJsonContent(data);
        const jsonFolder = masterZip.folder('json');
        if (jsonFolder) {
          jsonFolder.file(`${cleanBrandName}-foundations.json`, JSON.stringify(jsonContent, null, 2));
        }
        manifestItems.push(`  - /json/ ${cleanBrandName}-foundations.json (Design tokens & builder state)`);
      }

      // 2. Brand Guide PDF Export (if selected)
      if (opts.pdf) {
        this.currentStage = 'pdf';
        this.bundlePercent = opts.json ? 30 : 15;
        this.bundleProgressText = 'Compiling Brand Guide PDF pages...';
        const pdfContainer = (document.querySelector('#pdf-export-container') || document.querySelector('.preview-scroll') || document.querySelector('.preview-container')) as HTMLElement;
        
        if (pdfContainer) {
          const pdfBlob = await this.pdfService.generatePdfBlob(data, pdfContainer, (currentStep, totalSteps, overallPercent, pageTitle) => {
            const startPct = opts.json ? 30 : 15;
            const endPct = opts.fonts || opts.logos ? 65 : 85;
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

      // 3. Logo Assets Folder (if selected)
      if (opts.logos !== false) {
        this.currentStage = 'logos';
        this.bundlePercent = 70;
        this.bundleProgressText = 'Packaging uploaded logo asset files...';
        const logosFolder = masterZip.folder('logos');

        const logoKeys: { key: keyof typeof data.logo; name: string }[] = [
          { key: 'primary', name: 'primary-logo' },
          { key: 'secondary', name: 'secondary-logo' },
          { key: 'horizontal', name: 'horizontal-logo' },
          { key: 'vertical', name: 'vertical-logo' },
          { key: 'icon', name: 'icon-favicon' },
          { key: 'monoBlack', name: 'mono-black-logo' },
          { key: 'monoWhite', name: 'mono-white-logo' }
        ];

        let logoCount = 0;
        const logoFilesInfo: string[] = [];

        for (const item of logoKeys) {
          const val = data.logo?.[item.key];
          if (val && typeof val === 'string') {
            const converted = this.dataUrlToBlob(val);
            if (converted && logosFolder) {
              const filename = `${item.name}.${converted.ext}`;
              logosFolder.file(filename, converted.blob);
              logoCount++;
              logoFilesInfo.push(`    - ${filename}`);
            } else if (val.startsWith('http') && logosFolder) {
              try {
                const res = await fetch(val);
                if (res.ok) {
                  const blob = await res.blob();
                  const ext = val.includes('.svg') ? 'svg' : 'png';
                  const filename = `${item.name}.${ext}`;
                  logosFolder.file(filename, blob);
                  logoCount++;
                  logoFilesInfo.push(`    - ${filename}`);
                }
              } catch (e) {
                console.warn('Failed to fetch logo URL:', val, e);
              }
            }
          }
        }

        if (logoCount > 0) {
          manifestItems.push(`  - /logos/ ${logoCount} logo asset files (${cleanBrandName} approved logo variants)\n${logoFilesInfo.join('\n')}`);
        }
      }

      // 4. TTF Fonts Package (if selected)
      if (opts.fonts) {
        this.currentStage = 'fonts';
        this.bundlePercent = 82;
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

      // 5. Root MANIFEST.txt & ZIP Compression
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
• /logos/       - Holds approved brand logo variant files (primary, secondary, etc).
• /fonts/       - Holds raw .ttf font files & Google Fonts licensing README.

Thank you for building your design system with UFX Studio!
========================================================================
`;
      masterZip.file('MANIFEST.txt', manifestContent);

      // 6. Download zip
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
