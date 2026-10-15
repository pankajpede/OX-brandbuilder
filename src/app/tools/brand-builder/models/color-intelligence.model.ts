/* ============================================================
   COLOR INTELLIGENCE ENGINE — Data Models & Types
   ============================================================ */

export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hwb' | 'oklch' | 'oklab' | 'lab' | 'lch';

export type SemanticRole = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'image_color' | 'unassigned';

export type ColorProvenanceSource =
  | 'website_dom'
  | 'computed_css'
  | 'css_variable'
  | 'svg'
  | 'asset'
  | 'screenshot'
  | 'technology_detector'
  | 'ai_inference'
  | 'generated'
  | 'user';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

export interface NormalizedColor {
  hex: string;           // Canonical uppercase #RRGGBB
  rgb: RgbColor;
  alpha: number;         // 0 to 1
  hsl: HslColor;
  oklch: OklchColor;
  sourceFormat: ColorFormat;
  originalValue: string;
}

export interface ElementColorContext {
  element: string;       // e.g. "button", "a", "div", "svg"
  role?: string;         // e.g. "button", "alert", "nav", "badge", "header"
  text?: string;         // E.g. "Payment completed", "Get Started"
  property: string;      // E.g. "backgroundColor", "color", "fill", "borderTopColor"
  classes: string[];     // E.g. ["btn", "btn-primary", "alert-success"]
  cssVariables?: string[]; // E.g. ["--color-primary", "--success"]
  pageUrl?: string;      // E.g. "https://example.com/pricing"
}

export interface ColorEvidenceItem {
  id: string;            // Unique hash/id for color
  color: NormalizedColor;
  contexts: ElementColorContext[];
  usageCount: number;
  cssVariables: string[];
  semanticClasses: string[];
  semanticSignals: string[];
  sources: ColorProvenanceSource[];
  pages: string[];
}

export interface ColorCluster {
  id: string;
  baseHex: string;
  baseColor: NormalizedColor;
  variants: NormalizedColor[];
  evidenceItems: ColorEvidenceItem[];
  totalUsage: number;
  family: string;        // E.g. "blue", "green", "red", "purple", "amber", "neutral"
  detectedSemanticRole?: SemanticRole;
}

export interface SemanticScoreBreakdown {
  cssVariableScore: number;
  semanticClassScore: number;
  ctaScore: number;
  navigationScore: number;
  alertScore: number;
  repetitionScore: number;
  visualProminenceScore: number;
  colorFamilyBoost: number;
  totalScore: number;
}

export interface ClassifiedColorRole {
  role: SemanticRole;
  status: 'detected' | 'needs_review' | 'not_detected';
  color?: NormalizedColor;
  baseHex?: string;
  lightHex?: string;
  darkHex?: string;
  variants?: string[];
  confidence: number;    // 0 to 1
  confidenceLabel: 'High confidence' | 'Medium confidence' | 'Needs review';
  sources: ColorProvenanceSource[];
  scoreBreakdown?: SemanticScoreBreakdown;
  evidenceSummary?: {
    cssVariables: string[];
    buttonCount: number;
    alertCount: number;
    badgeCount: number;
    linkCount: number;
    pages: string[];
    matchedSignals: string[];
  };
  competingCandidates?: Array<{ hex: string; score: number; confidence: number }>;
}

export interface ColorInventory {
  semanticRoles: Record<SemanticRole, ClassifiedColorRole>;
  colorFamilies: Record<string, ColorCluster>;
  allDiscoveredColors: NormalizedColor[];
  additionalColors: Array<{
    name: string;
    hex: string;
    category: string;
    usage: string;
    sources: ColorProvenanceSource[];
  }>;
  pagesAnalyzedCount: number;
  totalColorsCount: number;
  totalEvidenceItemsCount: number;
  analysisTimestamp: string;
}

export interface ScoringWeights {
  cssPrimaryVar: number;
  primaryClass: number;
  primaryCta: number;
  navigation: number;
  repetition: number;
  visualProminence: number;

  cssSecondaryVar: number;
  secondaryClass: number;
  secondaryCta: number;
  supportingUi: number;

  cssSuccessVar: number;
  successClass: number;
  successAlert: number;
  successBadge: number;
  completedState: number;
  validState: number;
  successSemanticText: number;
  greenFamilyBoost: number;

  cssWarningVar: number;
  warningClass: number;
  warningAlert: number;
  warningBadge: number;
  pendingState: number;
  cautionState: number;
  warningSemanticText: number;
  amberFamilyBoost: number;

  cssErrorVar: number;
  errorVar: number;
  errorClass: number;
  dangerClass: number;
  errorMessage: number;
  destructiveButton: number;
  invalidField: number;
  failedState: number;
  errorSemanticText: number;
  redFamilyBoost: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  cssPrimaryVar: 50,
  primaryClass: 40,
  primaryCta: 35,
  navigation: 20,
  repetition: 15,
  visualProminence: 10,

  cssSecondaryVar: 50,
  secondaryClass: 40,
  secondaryCta: 35,
  supportingUi: 20,

  cssSuccessVar: 60,
  successClass: 50,
  successAlert: 45,
  successBadge: 30,
  completedState: 25,
  validState: 25,
  successSemanticText: 25,
  greenFamilyBoost: 15,

  cssWarningVar: 60,
  warningClass: 50,
  warningAlert: 45,
  warningBadge: 30,
  pendingState: 25,
  cautionState: 25,
  warningSemanticText: 25,
  amberFamilyBoost: 15,

  cssErrorVar: 60,
  errorVar: 55,
  errorClass: 50,
  dangerClass: 50,
  errorMessage: 45,
  destructiveButton: 35,
  invalidField: 30,
  failedState: 30,
  errorSemanticText: 30,
  redFamilyBoost: 15,
};
