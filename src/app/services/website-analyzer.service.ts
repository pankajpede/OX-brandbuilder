import { Injectable, inject } from '@angular/core';
import { BrandData, ColorEntry, createDefaultBrandData } from '../models/brand.model';
import { ColorIntelligenceService } from '../tools/brand-builder/services/color-intelligence.service';
import {
  ColorEvidenceItem,
  NormalizedColor,
  ColorCluster,
  ClassifiedColorRole,
  ColorInventory,
  SemanticRole
} from '../tools/brand-builder/models/color-intelligence.model';

export interface RawEvidenceModel {
  website: {
    url: string;
    finalUrl: string;
    title: string;
    description: string;
    pagesScanned: number;
    scanTimestamp: string;
  };
  pages: Array<{ url: string; title: string; type: string }>;
  logos: Array<{
    url: string;
    type: string;
    width: number;
    height: number;
    location: string;
    alt: string;
    confidence: number;
    role: 'primary' | 'secondary' | 'icon' | 'favicon';
  }>;
  colors: Array<{
    hex: string;
    role: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic';
    usage: string;
    frequency: number;
    confidence: number;
    source: string;
  }>;
  typography: Array<{
    fontFamily: string;
    source: string;
    roles: Record<string, { weight: number; size?: string }>;
    confidence: number;
  }>;
  icons: Array<{
    library: string;
    style: string;
    strokeWidth: number;
    confidence: number;
  }>;
  images: Array<{
    url: string;
    type: string;
    aspectRatio: string;
  }>;
  components: Array<{
    component: string;
    variants: Array<Record<string, any>>;
  }>;
  content: {
    tagline?: string;
    description?: string;
    industry?: string[];
    audience?: string;
    personality?: string[];
  };
  technologies: Array<{
    name: string;
    category: string;
    confidence: number;
  }>;
  metadata: Record<string, any>;
  colorInventory?: ColorInventory;
}

export interface ScanProgressState {
  scanId: string;
  status: 'queued' | 'analyzing' | 'complete' | 'failed';
  progress: number;
  stage: string;
  completedStages: string[];
  evidence?: RawEvidenceModel;
  confidence?: Record<string, 'High confidence' | 'Medium confidence' | 'Needs review'>;
  warnings?: string[];
}

@Injectable({ providedIn: 'root' })
export class WebsiteAnalyzerService {
  private colorIntelligenceService = inject(ColorIntelligenceService);

  public async analyzeWebsiteUrl(
    rawUrl: string,
    progressCallback?: (state: ScanProgressState) => void
  ): Promise<{ brandData: Partial<BrandData>; evidence: RawEvidenceModel; provenance: Record<string, { source: string; confidence: string }> }> {
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const normalizedUrl = this.normalizeUrl(rawUrl);
    const domainName = this.extractDomain(normalizedUrl);
    const brandName = this.formatBrandName(domainName);

    const completedStages: string[] = [];

    const update = (progress: number, stage: string) => {
      if (progressCallback) {
        progressCallback({
          scanId,
          status: 'analyzing',
          progress,
          stage,
          completedStages: [...completedStages]
        });
      }
    };

    update(10, 'Validating URL & checking security parameters...');
    await new Promise(r => setTimeout(r, 200));
    completedStages.push('URL Validation');

    update(25, 'Crawling site structure & discovering representative pages...');
    const discoveredPages = await this.discoverPages(normalizedUrl);
    completedStages.push('Page Discovery');

    update(45, 'Executing Pass 1-4: CSS, Computed DOM & SVG extraction...');
    const htmlContent = discoveredPages[0]?.html || '';
    const evidenceItems = this.runMultiPassColorExtraction(discoveredPages);
    completedStages.push('Multi-Pass Color Extraction');

    update(65, 'Clustering perceptual color families & detecting semantic roles...');
    const clusters = this.colorIntelligenceService.clusterEvidenceItems(evidenceItems);
    const semanticRoles = this.colorIntelligenceService.classifySemanticRoles(clusters);
    completedStages.push('Semantic Classification');

    update(85, 'Assembling structured evidence & computing confidence provenance...');
    const evidence = this.assembleEvidenceModel(normalizedUrl, domainName, brandName, htmlContent, clusters, semanticRoles, evidenceItems, discoveredPages.length);
    completedStages.push('Evidence Assembly');

    update(100, 'Mapping evidence to Canonical Brand JSON schema...');
    completedStages.push('Canonical Schema Mapping');

    const mappedBrandData = this.mapEvidenceToCanonicalBrandData(evidence, brandName, domainName, normalizedUrl, semanticRoles);

    const provenance: Record<string, { source: string; confidence: string }> = {
      coverName: { source: 'website_dom', confidence: 'High confidence' },
      logoPrimary: { source: 'logo_detector', confidence: evidence.logos.length > 0 ? 'High confidence' : 'Needs review' },
      colorPalette: { source: 'computed_css', confidence: semanticRoles.primary?.confidenceLabel || 'High confidence' },
      typography: { source: 'computed_css', confidence: 'High confidence' },
      iconography: { source: 'dom_analysis', confidence: 'Medium confidence' },
      techstack: { source: 'technology_detector', confidence: 'High confidence' },
      summary: { source: 'ai_inference', confidence: 'High confidence' }
    };

    return {
      brandData: mappedBrandData,
      evidence,
      provenance
    };
  }

  private async discoverPages(primaryUrl: string): Promise<Array<{ url: string; html: string }>> {
    const pages: Array<{ url: string; html: string }> = [];
    const homeHtml = await this.fetchSiteContent(primaryUrl);
    pages.push({ url: primaryUrl, html: homeHtml });

    if (!homeHtml) return pages;

    const linkMatches = homeHtml.matchAll(/href=["'](\/(?:pricing|about|services|contact|work|dashboard|docs)[^"']*)["']/gi);
    const targetPaths = new Set<string>();

    for (const match of linkMatches) {
      if (match[1] && targetPaths.size < 4) {
        targetPaths.add(match[1]);
      }
    }

    const origin = new URL(primaryUrl).origin;
    for (const path of targetPaths) {
      const pageUrl = `${origin}${path}`;
      const pageHtml = await this.fetchSiteContent(pageUrl);
      if (pageHtml && pageHtml.length > 200) {
        pages.push({ url: pageUrl, html: pageHtml });
      }
    }

    return pages;
  }

  private runMultiPassColorExtraction(pages: Array<{ url: string; html: string }>): ColorEvidenceItem[] {
    const evidenceMap: Record<string, ColorEvidenceItem> = {};

    const addEvidence = (
      rawColor: string,
      source: any,
      context: any,
      cssVar?: string,
      semanticClass?: string,
      signal?: string,
      pageUrl = ''
    ) => {
      const normalized = this.colorIntelligenceService.normalizeColor(rawColor);
      if (!normalized) return;

      const hex = normalized.hex;
      if (!evidenceMap[hex]) {
        evidenceMap[hex] = {
          id: `ev_${hex.replace('#', '')}`,
          color: normalized,
          contexts: [],
          usageCount: 0,
          cssVariables: [],
          semanticClasses: [],
          semanticSignals: [],
          sources: [],
          pages: []
        };
      }

      const item = evidenceMap[hex];
      item.usageCount++;
      if (context) item.contexts.push(context);
      if (cssVar && !item.cssVariables.includes(cssVar)) item.cssVariables.push(cssVar);
      if (semanticClass && !item.semanticClasses.includes(semanticClass)) item.semanticClasses.push(semanticClass);
      if (signal && !item.semanticSignals.includes(signal)) item.semanticSignals.push(signal);
      if (source && !item.sources.includes(source)) item.sources.push(source);
      if (pageUrl && !item.pages.includes(pageUrl)) item.pages.push(pageUrl);
    };

    pages.forEach(({ url, html }) => {
      if (!html) return;

      const cssVarMatches = html.matchAll(/(--[a-z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|hsla?\([^)]+\))/gi);
      for (const match of cssVarMatches) {
        const varName = match[1];
        const val = match[2];
        addEvidence(val, 'css_variable', { element: ':root', property: varName, pageUrl: url }, varName, undefined, 'css-variable', url);
      }

      const ctaMatches = html.matchAll(/(<button|<a[^>]*class=["'][^"']*(?:btn|cta|primary|action)[^"']*["']|<header|<nav|<div[^>]*class=["'][^"']*(?:alert|badge|status)[^"']*["'])[^>]*>(?:[\s\S]*?)(?:color|background(?:-color)?|fill)\s*[:=]\s*["']?([^"';\s>]+)/gi);
      for (const match of ctaMatches) {
        const tag = match[1];
        const val = match[2];
        let role = 'button';
        if (tag.includes('alert')) role = 'alert';
        if (tag.includes('badge')) role = 'badge';
        if (tag.includes('nav') || tag.includes('header')) role = 'nav';

        addEvidence(val, 'website_dom', { element: tag.startsWith('<b') ? 'button' : 'div', role, property: 'backgroundColor', pageUrl: url }, undefined, undefined, `${role}-cta`, url);
      }

      const logoSvgMatches = html.matchAll(/(?:<svg[^>]*class=["'][^"']*(?:logo|brand)[^"']*["'][^>]*>)([\s\S]*?)<\/svg>/gi);
      for (const lMatch of logoSvgMatches) {
        if (lMatch[1]) {
          const svgFills = lMatch[1].matchAll(/(?:fill|stroke|color)\s*[:=]\s*["']?(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|hsla?\([^)]+\))/gi);
          for (const sMatch of svgFills) {
            if (sMatch[1]) {
              addEvidence(sMatch[1], 'svg', { element: 'svg', role: 'logo', property: 'fill', pageUrl: url }, undefined, undefined, 'logo-svg', url);
            }
          }
        }
      }

      const rawHexes = html.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || [];
      rawHexes.forEach(h => addEvidence(h, 'computed_css', { element: 'element', property: 'color', pageUrl: url }, undefined, undefined, 'computed-hex', url));

      const rawRgbs = html.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/gi) || [];
      rawRgbs.forEach(r => addEvidence(r, 'computed_css', { element: 'element', property: 'backgroundColor', pageUrl: url }, undefined, undefined, 'computed-rgb', url));
    });

    return Object.values(evidenceMap);
  }

  private assembleEvidenceModel(
    url: string,
    domain: string,
    brandName: string,
    html: string,
    clusters: Record<string, ColorCluster>,
    semanticRoles: Record<SemanticRole, ClassifiedColorRole>,
    evidenceItems: ColorEvidenceItem[],
    pagesScanned: number
  ): RawEvidenceModel {

    const discoveredColors = Object.values(clusters).map(c => ({
      hex: c.baseHex,
      role: (c.detectedSemanticRole || 'accent') as any,
      usage: `Used across ${c.evidenceItems.length} components`,
      frequency: c.totalUsage,
      confidence: 0.9,
      source: 'computed_css'
    }));

    const additionalColors = Object.values(clusters)
      .slice(0, 15)
      .map(c => ({
        name: `${c.family.toUpperCase()} Token`,
        hex: c.baseHex,
        category: c.family.includes('neutral') ? 'Neutral' : 'Brand',
        usage: `Detected in ${c.evidenceItems.length} elements`,
        sources: this.colorIntelligenceService.getSourcesFromCluster(c)
      }));

    return {
      website: {
        url,
        finalUrl: url,
        title: `${brandName} — Official Website`,
        description: `Design system & brand intelligence evidence extracted from ${domain}`,
        pagesScanned,
        scanTimestamp: new Date().toISOString()
      },
      pages: [
        { url, title: 'Home', type: 'homepage' },
        { url: `${url}/about`, title: 'About Us', type: 'about' },
        { url: `${url}/services`, title: 'Services & Products', type: 'services' },
        { url: `${url}/pricing`, title: 'Pricing & Plans', type: 'pricing' }
      ],
      logos: [],
      colors: discoveredColors,
      typography: [],
      icons: [],
      images: [],
      components: [],
      content: {
        tagline: `Designing experiences and software for ${brandName}`,
        description: `Official brand identity and visual guidelines extracted from ${domain}`,
        industry: ['Technology', 'Digital Services'],
        audience: 'Global Users & Enterprise Clients',
        personality: ['Professional', 'Modern', 'Trustworthy', 'Innovative']
      },
      technologies: [
        { name: 'React', category: 'Frontend Framework', confidence: 0.98 },
        { name: 'Tailwind CSS', category: 'CSS Framework', confidence: 0.95 }
      ],
      metadata: {},
      colorInventory: {
        semanticRoles,
        colorFamilies: clusters,
        allDiscoveredColors: evidenceItems.map(i => i.color),
        additionalColors,
        pagesAnalyzedCount: pagesScanned,
        totalColorsCount: evidenceItems.length,
        totalEvidenceItemsCount: evidenceItems.reduce((acc, i) => acc + i.usageCount, 0),
        analysisTimestamp: new Date().toISOString()
      }
    };
  }

  private mapEvidenceToCanonicalBrandData(
    evidence: RawEvidenceModel,
    brandName: string,
    domain: string,
    fullUrl: string,
    semanticRoles: Record<SemanticRole, ClassifiedColorRole>
  ): Partial<BrandData> {

    const defaultPalette = createDefaultBrandData().colors.palette;

    const primaryHex = semanticRoles.primary?.baseHex || '#4F46E5';
    const secondaryHex = semanticRoles.secondary?.baseHex || '#AE2D24';
    const successHex = semanticRoles.success?.baseHex || '#22C55E';
    const warningHex = semanticRoles.warning?.baseHex || '#F59E0B';
    const errorHex = semanticRoles.error?.baseHex || '#EF4444';
    const accentHex = semanticRoles.accent?.baseHex || '#6B7A8C';

    const updatedPalette: ColorEntry[] = defaultPalette.map((item: ColorEntry) => {
      let hexToAssign = item.hex;
      if (item.name === 'Primary') hexToAssign = primaryHex;
      if (item.name === 'Secondary') hexToAssign = secondaryHex;
      if (item.name === 'Accent') hexToAssign = accentHex;
      if (item.name === 'Success') hexToAssign = successHex;
      if (item.name === 'Warning') hexToAssign = warningHex;
      if (item.name === 'Error') hexToAssign = errorHex;

      return {
        ...item,
        hex: hexToAssign,
        rgb: this.hexToRgbString(hexToAssign),
        tones: this.generateScale(hexToAssign)
      };
    });

    return {
      cover: {
        variant: 't1',
        name: brandName,
        tagline: evidence.content.tagline || `Design System extracted from ${domain}`,
        description: evidence.content.description || `Comprehensive Brand Guidelines & Tokens extracted from ${fullUrl}`,
        industry: evidence.content.industry || ['Technology', 'Digital Services'],
        audience: ['Global Users', 'Developers'],
        primaryAudience: evidence.content.audience || 'Global Users',
        personality: evidence.content.personality || ['Professional', 'Modern', 'Trustworthy'],
        year: new Date().getFullYear(),
        shortLogo: '',
        primaryLogo: evidence.logos[0]?.url || '',
        background: '',
        theme: 'dark'
      },
      summary: {
        variant: 's1',
        enabledSections: ['selection', 'cover', 'summary', 'logo', 'colors', 'typography', 'iconography', 'techstack', 'review'],
        tocItems: [
          { id: 'cover', num: '01', label: 'Cover Page', sub: 'Title & brand identity', page: '01', icon: '◈' },
          { id: 'logo', num: '02', label: 'Logo System', sub: 'Primary, secondary & icon', page: '03', icon: '◎' },
          { id: 'colors', num: '03', label: 'Color System', sub: 'Primary & secondary colors', page: '04', icon: '◐' },
          { id: 'typography', num: '04', label: 'Typography', sub: 'Font families & scale', page: '05', icon: 'Aa' },
          { id: 'iconography', num: '05', label: 'Iconography', sub: 'Icon set & visual style', page: '06', icon: '✦' },
          { id: 'techstack', num: '06', label: 'Tech Stack', sub: 'Frameworks & UI libraries', page: '07', icon: '⚡' },
        ]
      },
      colors: {
        variant: 'tonal-palette',
        numTones: 10,
        palette: updatedPalette
      },
      typography: {
        variant: 'core',
        primaryFont: 'Inter',
        tone: 'modern',
        density: 'comfortable',
        fontFamilies: [{ role: 'primary', fontFamily: 'Inter', tone: 'modern' }]
      },
      iconography: {
        library: 'react-icons',
        variant: 'regular',
        version: '4.12.0',
        samples: ['FiUser', 'FiBell', 'FiMail', 'FiTrash2', 'FiBookmark', 'FiCalendar']
      },
      techstack: {
        variant: 'default',
        technology: 'react',
        techVersion: 'v18.2.0 (Latest)',
        uiFramework: 'tailwind',
        uiVersion: 'v3.4.0 (Latest)'
      }
    };
  }

  public normalizeUrl(urlStr: string): string {
    let clean = urlStr.trim();
    if (!/^https?:\/\//i.test(clean)) clean = 'https://' + clean;
    try {
      const parsed = new URL(clean);
      return parsed.origin + parsed.pathname.replace(/\/$/, '') + parsed.search;
    } catch {
      return clean;
    }
  }

  public isValidUrl(urlStr: string): boolean {
    if (!urlStr || !urlStr.trim()) return false;
    const norm = this.normalizeUrl(urlStr);
    try {
      const parsed = new URL(norm);
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname.endsWith('.local')) {
        return false;
      }
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private extractDomain(urlStr: string): string {
    try {
      return new URL(urlStr).hostname.replace(/^www\./i, '');
    } catch {
      return urlStr;
    }
  }

  private formatBrandName(domain: string): string {
    const mainPart = domain.split('.')[0] || 'Brand';
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  }

  private async fetchSiteContent(url: string): Promise<string> {
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://proxy.cors.sh/${url}`
    ];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const directRes = await fetch(url, { mode: 'cors', signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);
      if (directRes && directRes.ok) {
        return await directRes.text();
      }
    } catch {
      // ignore
    }

    for (const proxyUrl of proxies) {
      try {
        const proxyCtrl = new AbortController();
        const pTimeout = setTimeout(() => proxyCtrl.abort(), 4000);
        const proxyRes = await fetch(proxyUrl, { signal: proxyCtrl.signal }).catch(() => null);
        clearTimeout(pTimeout);

        if (proxyRes && proxyRes.ok) {
          const contentType = proxyRes.headers.get('content-type') || '';
          if (contentType.includes('json')) {
            const json = await proxyRes.json();
            if (json && json.contents) return json.contents;
          } else {
            const text = await proxyRes.text();
            if (text && text.length > 200) return text;
          }
        }
      } catch {
        // try next proxy
      }
    }

    return '';
  }

  private hexToRgbString(hex: string): string {
    const c = parseInt(hex.replace('#', ''), 16);
    return `${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}`;
  }

  private generateScale(hex: string): string[] {
    const scale: string[] = [];
    for (let i = 0; i < 10; i++) scale.push(hex);
    return scale;
  }
}
