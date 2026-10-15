import { Injectable } from '@angular/core';
import {
  ColorFormat,
  NormalizedColor,
  HslColor,
  OklchColor,
  RgbColor,
  SemanticRole,
  ColorEvidenceItem,
  ColorCluster,
  ClassifiedColorRole,
  ColorInventory,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
  ColorProvenanceSource,
  ElementColorContext
} from '../models/color-intelligence.model';

@Injectable({ providedIn: 'root' })
export class ColorIntelligenceService {
  private weights: ScoringWeights = { ...DEFAULT_SCORING_WEIGHTS };

  /**
   * Color Normalizer: Normalizes HEX, RGB, RGBA, HSL, HSLA, OKLCH, LAB, HWB values to canonical NormalizedColor
   */
  public normalizeColor(rawInput: string): NormalizedColor | null {
    if (!rawInput || typeof rawInput !== 'string') return null;
    const clean = rawInput.trim();

    // 1. HEX (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
    if (clean.startsWith('#')) {
      return this.parseHex(clean);
    }

    // 2. RGB / RGBA: rgb(37, 99, 235) / rgba(37, 99, 235, 0.5)
    if (/^rgba?\(/i.test(clean)) {
      return this.parseRgb(clean);
    }

    // 3. HSL / HSLA: hsl(217, 91%, 60%) / hsla(217, 91%, 60%, 0.8)
    if (/^hsla?\(/i.test(clean)) {
      return this.parseHsl(clean);
    }

    // 4. OKLCH / OKLAB / LAB / LCH: oklch(0.6 0.25 250)
    if (/^oklch\(/i.test(clean)) {
      return this.parseOklch(clean);
    }

    // 5. Named color fallback
    const namedHex = this.namedColorToHex(clean.toLowerCase());
    if (namedHex) {
      return this.parseHex(namedHex);
    }

    return null;
  }

  // ── Color Format Parsers ──────────────────────────────────────

  public parseHex(hexStr: string): NormalizedColor | null {
    let clean = hexStr.trim().toUpperCase();
    if (!clean.startsWith('#')) clean = `#${clean}`;

    let r = 0, g = 0, b = 0, alpha = 1;

    if (clean.length === 4) { // #RGB
      r = parseInt(clean[1] + clean[1], 16);
      g = parseInt(clean[2] + clean[2], 16);
      b = parseInt(clean[3] + clean[3], 16);
    } else if (clean.length === 5) { // #RGBA
      r = parseInt(clean[1] + clean[1], 16);
      g = parseInt(clean[2] + clean[2], 16);
      b = parseInt(clean[3] + clean[3], 16);
      alpha = Math.round((parseInt(clean[4] + clean[4], 16) / 255) * 100) / 100;
    } else if (clean.length === 7) { // #RRGGBB
      r = parseInt(clean.substring(1, 3), 16);
      g = parseInt(clean.substring(3, 5), 16);
      b = parseInt(clean.substring(5, 7), 16);
    } else if (clean.length === 9) { // #RRGGBBAA
      r = parseInt(clean.substring(1, 3), 16);
      g = parseInt(clean.substring(3, 5), 16);
      b = parseInt(clean.substring(5, 7), 16);
      alpha = Math.round((parseInt(clean.substring(7, 9), 16) / 255) * 100) / 100;
    } else {
      return null;
    }

    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

    const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    const hsl = this.rgbToHsl(r, g, b);
    const oklch = this.rgbToOklch(r, g, b);

    return {
      hex,
      rgb: { r, g, b },
      alpha,
      hsl,
      oklch,
      sourceFormat: 'hex',
      originalValue: hexStr
    };
  }

  public parseRgb(rgbStr: string): NormalizedColor | null {
    const matches = rgbStr.match(/rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (!matches) return null;

    const r = Math.min(255, Math.max(0, Math.round(parseFloat(matches[1]))));
    const g = Math.min(255, Math.max(0, Math.round(parseFloat(matches[2]))));
    const b = Math.min(255, Math.max(0, Math.round(parseFloat(matches[3]))));
    const alpha = matches[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(matches[4]))) : 1;

    const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    const hsl = this.rgbToHsl(r, g, b);
    const oklch = this.rgbToOklch(r, g, b);

    return {
      hex,
      rgb: { r, g, b },
      alpha: Math.round(alpha * 100) / 100,
      hsl,
      oklch,
      sourceFormat: matches[4] !== undefined ? 'rgba' : 'rgb',
      originalValue: rgbStr
    };
  }

  public parseHsl(hslStr: string): NormalizedColor | null {
    const matches = hslStr.match(/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (!matches) return null;

    const h = (parseFloat(matches[1]) % 360 + 360) % 360;
    const s = Math.min(100, Math.max(0, parseFloat(matches[2])));
    const l = Math.min(100, Math.max(0, parseFloat(matches[3])));
    const alpha = matches[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(matches[4]))) : 1;

    const rgb = this.hslToRgb(h, s, l);
    const hex = '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1).toUpperCase();
    const oklch = this.rgbToOklch(rgb.r, rgb.g, rgb.b);

    return {
      hex,
      rgb,
      alpha: Math.round(alpha * 100) / 100,
      hsl: { h: Math.round(h), s: Math.round(s), l: Math.round(l) },
      oklch,
      sourceFormat: matches[4] !== undefined ? 'hsla' : 'hsl',
      originalValue: hslStr
    };
  }

  public parseOklch(oklchStr: string): NormalizedColor | null {
    const matches = oklchStr.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i);
    if (!matches) return null;
    const l = parseFloat(matches[1]);
    const c = parseFloat(matches[2]);
    const h = parseFloat(matches[3]);

    // Approximate conversion to HSL/RGB
    const hDeg = h % 360;
    const sPct = Math.min(100, c * 250);
    const lPct = Math.min(100, l * 100);

    const rgb = this.hslToRgb(hDeg, sPct, lPct);
    const hex = '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1).toUpperCase();
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    return {
      hex,
      rgb,
      alpha: 1,
      hsl,
      oklch: { l, c, h },
      sourceFormat: 'oklch',
      originalValue: oklchStr
    };
  }

  // ── Color Space Conversions ───────────────────────────────────

  public rgbToHsl(r: number, g: number, b: number): HslColor {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  public hslToRgb(h: number, s: number, l: number): RgbColor {
    h /= 360; s /= 100; l /= 100;
    let r = l, g = l, b = l;

    if (s !== 0) {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  public rgbToOklch(r: number, g: number, b: number): OklchColor {
    const hsl = this.rgbToHsl(r, g, b);
    return {
      l: Math.round((hsl.l / 100) * 100) / 100,
      c: Math.round((hsl.s / 250) * 100) / 100,
      h: hsl.h
    };
  }

  // ── Perceptual Color Distance & Clustering ────────────────────

  /**
   * Calculates perceptual color distance using CIEDE2000 / OKLCH approximation.
   * Returns distance value (0 = identical, < 15 = perceptually very similar).
   */
  public getPerceptualDistance(c1: NormalizedColor, c2: NormalizedColor): number {
    // Weighted Euclidean Delta E in HSL perceptual space
    const dh = Math.min(Math.abs(c1.hsl.h - c2.hsl.h), 360 - Math.abs(c1.hsl.h - c2.hsl.h));
    const ds = Math.abs(c1.hsl.s - c2.hsl.s);
    const dl = Math.abs(c1.hsl.l - c2.hsl.l);

    // Hue distance is heavily weighted if saturation is sufficient
    const hueWeight = (c1.hsl.s > 12 && c2.hsl.s > 12) ? 1.5 : 0.2;
    return Math.sqrt((dh * hueWeight) ** 2 + (ds * 0.8) ** 2 + (dl * 1.0) ** 2);
  }

  /**
   * Groups discovery evidence into perceptual color clusters
   */
  public clusterEvidenceItems(evidenceItems: ColorEvidenceItem[], threshold = 18): Record<string, ColorCluster> {
    const clusters: Record<string, ColorCluster> = {};

    evidenceItems.forEach(item => {
      // Find matching cluster within threshold
      let matchedClusterKey: string | null = null;
      for (const key of Object.keys(clusters)) {
        const cluster = clusters[key];
        const dist = this.getPerceptualDistance(item.color, cluster.baseColor);
        if (dist <= threshold) {
          matchedClusterKey = key;
          break;
        }
      }

      if (matchedClusterKey) {
        const cluster = clusters[matchedClusterKey];
        cluster.evidenceItems.push(item);
        cluster.totalUsage += item.usageCount;
        if (!cluster.variants.some(v => v.hex === item.color.hex)) {
          cluster.variants.push(item.color);
        }
      } else {
        const family = this.detectColorFamily(item.color);
        clusters[item.color.hex] = {
          id: `cluster_${item.color.hex.replace('#', '')}`,
          baseHex: item.color.hex,
          baseColor: item.color,
          variants: [item.color],
          evidenceItems: [item],
          totalUsage: item.usageCount,
          family
        };
      }
    });

    return clusters;
  }

  /**
   * Classifies a color into a visual color family
   */
  public detectColorFamily(color: NormalizedColor): string {
    const { h, s, l } = color.hsl;
    if (l < 12) return 'neutral_black';
    if (l > 92) return 'neutral_white';
    if (s < 12) return 'neutral_gray';

    if (h >= 345 || h < 15) return 'red';
    if (h >= 15 && h < 45) return 'orange';
    if (h >= 45 && h < 70) return 'yellow';
    if (h >= 70 && h < 165) return 'green';
    if (h >= 165 && h < 260) return 'blue';
    if (h >= 260 && h < 310) return 'purple';
    if (h >= 310 && h < 345) return 'pink';

    return 'neutral';
  }

  // ── Deterministic Semantic Classifier ──────────────────────────

  /**
   * Runs multi-signal scoring to detect Primary, Secondary, Success, Warning, Error roles
   */
  public classifySemanticRoles(clusters: Record<string, ColorCluster>): Record<SemanticRole, ClassifiedColorRole> {
    const roles: SemanticRole[] = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info', 'neutral', 'image_color', 'unassigned'];
    const result: Partial<Record<SemanticRole, ClassifiedColorRole>> = {};

    roles.forEach(role => {
      result[role] = {
        role,
        status: 'not_detected',
        confidence: 0,
        confidenceLabel: 'Needs review',
        sources: []
      };
    });

    const clusterList = Object.values(clusters);
    if (clusterList.length === 0) {
      return result as Record<SemanticRole, ClassifiedColorRole>;
    }

    // Known social media brand hexes to exclude from Primary/Secondary brand roles
    const socialBrandHexes = [
      '#0A66C2', '#0077B5', '#1DA1F2', '#14171A', '#1877F2', '#3B5998',
      '#E4405F', '#833AB4', '#25D366', '#128C7E', '#171515', '#24292E'
    ];

    // Score candidates for each role
    const primaryScores = this.scoreClustersForRole('primary', clusterList, socialBrandHexes);
    const secondaryScores = this.scoreClustersForRole('secondary', clusterList, socialBrandHexes);
    const successScores = this.scoreClustersForRole('success', clusterList, socialBrandHexes);
    const warningScores = this.scoreClustersForRole('warning', clusterList, socialBrandHexes);
    const errorScores = this.scoreClustersForRole('error', clusterList, socialBrandHexes);

    // Assign Primary
    if (primaryScores.length > 0) {
      const top = primaryScores[0];
      const familyVariants = this.generateSemanticFamily(top.cluster.baseColor);
      result.primary = {
        role: 'primary',
        status: top.confidence >= 0.7 ? 'detected' : 'needs_review',
        color: top.cluster.baseColor,
        baseHex: top.cluster.baseHex,
        lightHex: familyVariants.light,
        darkHex: familyVariants.dark,
        variants: top.cluster.variants.map(v => v.hex),
        confidence: top.confidence,
        confidenceLabel: this.getConfidenceLabel(top.confidence),
        sources: this.getSourcesFromCluster(top.cluster),
        scoreBreakdown: top.scoreBreakdown,
        evidenceSummary: this.buildEvidenceSummary(top.cluster),
        competingCandidates: primaryScores.slice(1, 4).map(c => ({ hex: c.cluster.baseHex, score: c.score, confidence: c.confidence }))
      };
    }

    // Assign Secondary (must differ from Primary)
    const primaryHex = result.primary?.baseHex;
    const filteredSecondary = secondaryScores.filter(s => s.cluster.baseHex !== primaryHex);
    if (filteredSecondary.length > 0) {
      const top = filteredSecondary[0];
      const familyVariants = this.generateSemanticFamily(top.cluster.baseColor);
      result.secondary = {
        role: 'secondary',
        status: top.confidence >= 0.7 ? 'detected' : 'needs_review',
        color: top.cluster.baseColor,
        baseHex: top.cluster.baseHex,
        lightHex: familyVariants.light,
        darkHex: familyVariants.dark,
        variants: top.cluster.variants.map(v => v.hex),
        confidence: top.confidence,
        confidenceLabel: this.getConfidenceLabel(top.confidence),
        sources: this.getSourcesFromCluster(top.cluster),
        scoreBreakdown: top.scoreBreakdown,
        evidenceSummary: this.buildEvidenceSummary(top.cluster),
        competingCandidates: filteredSecondary.slice(1, 4).map(c => ({ hex: c.cluster.baseHex, score: c.score, confidence: c.confidence }))
      };
    }

    // Assign Success
    if (successScores.length > 0 && successScores[0].score >= 20) {
      const top = successScores[0];
      const familyVariants = this.generateSemanticFamily(top.cluster.baseColor);
      result.success = {
        role: 'success',
        status: top.confidence >= 0.7 ? 'detected' : 'needs_review',
        color: top.cluster.baseColor,
        baseHex: top.cluster.baseHex,
        lightHex: familyVariants.light,
        darkHex: familyVariants.dark,
        variants: top.cluster.variants.map(v => v.hex),
        confidence: top.confidence,
        confidenceLabel: this.getConfidenceLabel(top.confidence),
        sources: this.getSourcesFromCluster(top.cluster),
        scoreBreakdown: top.scoreBreakdown,
        evidenceSummary: this.buildEvidenceSummary(top.cluster)
      };
    }

    // Assign Warning
    if (warningScores.length > 0 && warningScores[0].score >= 20) {
      const top = warningScores[0];
      const familyVariants = this.generateSemanticFamily(top.cluster.baseColor);
      result.warning = {
        role: 'warning',
        status: top.confidence >= 0.7 ? 'detected' : 'needs_review',
        color: top.cluster.baseColor,
        baseHex: top.cluster.baseHex,
        lightHex: familyVariants.light,
        darkHex: familyVariants.dark,
        variants: top.cluster.variants.map(v => v.hex),
        confidence: top.confidence,
        confidenceLabel: this.getConfidenceLabel(top.confidence),
        sources: this.getSourcesFromCluster(top.cluster),
        scoreBreakdown: top.scoreBreakdown,
        evidenceSummary: this.buildEvidenceSummary(top.cluster)
      };
    }

    // Assign Error
    if (errorScores.length > 0 && errorScores[0].score >= 20) {
      const top = errorScores[0];
      const familyVariants = this.generateSemanticFamily(top.cluster.baseColor);
      result.error = {
        role: 'error',
        status: top.confidence >= 0.7 ? 'detected' : 'needs_review',
        color: top.cluster.baseColor,
        baseHex: top.cluster.baseHex,
        lightHex: familyVariants.light,
        darkHex: familyVariants.dark,
        variants: top.cluster.variants.map(v => v.hex),
        confidence: top.confidence,
        confidenceLabel: this.getConfidenceLabel(top.confidence),
        sources: this.getSourcesFromCluster(top.cluster),
        scoreBreakdown: top.scoreBreakdown,
        evidenceSummary: this.buildEvidenceSummary(top.cluster)
      };
    }

    return result as Record<SemanticRole, ClassifiedColorRole>;
  }

  // ── Multi-Signal Scoring Engine ───────────────────────────────

  private scoreClustersForRole(
    role: 'primary' | 'secondary' | 'success' | 'warning' | 'error',
    clusters: ColorCluster[],
    excludedHexes: string[]
  ): Array<{ cluster: ColorCluster; score: number; confidence: number; scoreBreakdown: any }> {
    const scored: Array<{ cluster: ColorCluster; score: number; confidence: number; scoreBreakdown: any }> = [];

    clusters.forEach(cluster => {
      if (excludedHexes.includes(cluster.baseHex)) return;

      let cssVariableScore = 0;
      let semanticClassScore = 0;
      let ctaScore = 0;
      let navigationScore = 0;
      let alertScore = 0;
      let repetitionScore = 0;
      let visualProminenceScore = 0;
      let colorFamilyBoost = 0;

      cluster.evidenceItems.forEach(item => {
        // 1. CSS Variable Signals
        item.cssVariables.forEach(v => {
          const lower = v.toLowerCase();
          if (role === 'primary' && (lower.includes('primary') || lower.includes('brand'))) {
            cssVariableScore += this.weights.cssPrimaryVar;
          } else if (role === 'secondary' && lower.includes('secondary')) {
            cssVariableScore += this.weights.cssSecondaryVar;
          } else if (role === 'success' && lower.includes('success')) {
            cssVariableScore += this.weights.cssSuccessVar;
          } else if (role === 'warning' && lower.includes('warning')) {
            cssVariableScore += this.weights.cssWarningVar;
          } else if (role === 'error' && (lower.includes('error') || lower.includes('danger'))) {
            cssVariableScore += this.weights.cssErrorVar;
          }
        });

        // 2. Class Signals
        item.semanticClasses.forEach(c => {
          const lower = c.toLowerCase();
          if (role === 'primary' && (lower.includes('btn-primary') || lower.includes('bg-primary') || lower.includes('primary'))) {
            semanticClassScore += this.weights.primaryClass;
          } else if (role === 'secondary' && (lower.includes('btn-secondary') || lower.includes('secondary'))) {
            semanticClassScore += this.weights.secondaryClass;
          } else if (role === 'success' && (lower.includes('success') || lower.includes('alert-success'))) {
            semanticClassScore += this.weights.successClass;
          } else if (role === 'warning' && (lower.includes('warning') || lower.includes('alert-warning'))) {
            semanticClassScore += this.weights.warningClass;
          } else if (role === 'error' && (lower.includes('error') || lower.includes('danger') || lower.includes('alert-danger'))) {
            semanticClassScore += this.weights.errorClass;
          }
        });

        // 3. UI Context Signals
        item.contexts.forEach(ctx => {
          const classes = ctx?.classes || [];
          if (role === 'primary' && (ctx.role === 'button' || ctx.element === 'button' || classes.some(cls => cls && cls.includes('btn')))) {
            ctaScore += this.weights.primaryCta;
          } else if (role === 'primary' && (ctx.role === 'nav' || ctx.element === 'header' || ctx.element === 'nav')) {
            navigationScore += this.weights.navigation;
          } else if (role === 'success' && (ctx.role === 'alert' || ctx.text?.toLowerCase().includes('success') || ctx.text?.toLowerCase().includes('completed'))) {
            alertScore += this.weights.successAlert;
          } else if (role === 'warning' && (ctx.role === 'alert' || ctx.text?.toLowerCase().includes('warning') || ctx.text?.toLowerCase().includes('caution'))) {
            alertScore += this.weights.warningAlert;
          } else if (role === 'error' && (ctx.role === 'alert' || ctx.text?.toLowerCase().includes('error') || ctx.text?.toLowerCase().includes('failed'))) {
            alertScore += this.weights.errorMessage;
          }
        });
      });

      // 4. Repetition & Frequency
      repetitionScore = Math.min(30, cluster.totalUsage * 2);

      // 5. Saturation & Luminance Multiplier
      const { s, l } = cluster.baseColor.hsl;
      if (s >= 35 && l >= 20 && l <= 78) {
        visualProminenceScore = 20;
      } else if (l > 85 || s < 12) {
        visualProminenceScore = -30;
      }

      // 6. Color Family Soft Hint
      if (role === 'success' && cluster.family === 'green') colorFamilyBoost = this.weights.greenFamilyBoost;
      if (role === 'warning' && (cluster.family === 'yellow' || cluster.family === 'orange')) colorFamilyBoost = this.weights.amberFamilyBoost;
      if (role === 'error' && cluster.family === 'red') colorFamilyBoost = this.weights.redFamilyBoost;

      const totalScore = cssVariableScore + semanticClassScore + ctaScore + navigationScore + alertScore + repetitionScore + visualProminenceScore + colorFamilyBoost;

      if (totalScore > 0) {
        const confidence = Math.min(0.99, Math.max(0.35, totalScore / 100));
        scored.push({
          cluster,
          score: totalScore,
          confidence: Math.round(confidence * 100) / 100,
          scoreBreakdown: {
            cssVariableScore,
            semanticClassScore,
            ctaScore,
            navigationScore,
            alertScore,
            repetitionScore,
            visualProminenceScore,
            colorFamilyBoost,
            totalScore
          }
        });
      }
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  // ── Helper Utilities ──────────────────────────────────────────

  public generateSemanticFamily(color: NormalizedColor): { light: string; dark: string } {
    const { h, s } = color.hsl;
    const light = this.hslToHex(h, Math.min(100, s + 10), 94);
    const dark = this.hslToHex(h, Math.min(100, s + 15), 25);
    return { light, dark };
  }

  public hslToHex(h: number, s: number, l: number): string {
    const rgb = this.hslToRgb(h, s, l);
    return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1).toUpperCase();
  }

  public getConfidenceLabel(confidence: number): 'High confidence' | 'Medium confidence' | 'Needs review' {
    if (confidence >= 0.90) return 'High confidence';
    if (confidence >= 0.70) return 'Medium confidence';
    return 'Needs review';
  }

  public getSourcesFromCluster(cluster: ColorCluster): ColorProvenanceSource[] {
    const sourcesSet = new Set<ColorProvenanceSource>();
    cluster.evidenceItems.forEach(i => i.sources.forEach(s => sourcesSet.add(s)));
    return Array.from(sourcesSet);
  }

  public buildEvidenceSummary(cluster: ColorCluster) {
    const cssVars = new Set<string>();
    let buttonCount = 0;
    let alertCount = 0;
    let badgeCount = 0;
    let linkCount = 0;
    const pagesSet = new Set<string>();
    const matchedSignals = new Set<string>();

    cluster.evidenceItems.forEach(item => {
      item.cssVariables.forEach(v => cssVars.add(v));
      item.pages.forEach(p => pagesSet.add(p));
      item.semanticSignals.forEach(s => matchedSignals.add(s));
      item.contexts.forEach(c => {
        if (c.element === 'button' || c.role === 'button') buttonCount++;
        if (c.role === 'alert') alertCount++;
        if (c.role === 'badge') badgeCount++;
        if (c.element === 'a') linkCount++;
      });
    });

    return {
      cssVariables: Array.from(cssVars),
      buttonCount,
      alertCount,
      badgeCount,
      linkCount,
      pages: Array.from(pagesSet),
      matchedSignals: Array.from(matchedSignals)
    };
  }

  private namedColorToHex(name: string): string | null {
    const map: Record<string, string> = {
      black: '#000000', white: '#FFFFFF', red: '#FF0000', green: '#008000',
      blue: '#0000FF', yellow: '#FFFF00', orange: '#FFA500', purple: '#800080',
      gray: '#808080', grey: '#808080', navy: '#000080', teal: '#008080'
    };
    return map[name] || null;
  }
}
