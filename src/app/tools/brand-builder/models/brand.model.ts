/* ============================================================
   OX BRAND BUILDER — Data Models
   ============================================================ */

// ── Color Entry ───────────────────────────────────────────────
export interface ColorEntry {
  name: string;
  category: string;
  token: string;
  hex: string;
  rgb: string;
  cmyk: string;
  usage: string;
  tones?: string[];
}

// ── Section Interfaces ────────────────────────────────────────
export interface TocItem {
  id: string;
  num: string;
  label: string;
  sub: string;
  page: string;
  icon: string;
}

export interface BrandCover {
  variant: string;
  name: string;
  tagline: string;
  description: string;
  industry: string[];
  audience: string[];
  personality: string[];
  year: number;
  shortLogo: string;
  primaryLogo: string;
  background: string;
  theme: 'light' | 'dark';
}

export interface BrandLogo {
  variant: string;
  primary: string;
  secondary: string;
  horizontal: string;
  vertical: string;
  icon: string;
  monoBlack: string;
  monoWhite: string;

  // Per-logo specs
  primaryClearSpace: number;
  primaryMinSize: number;
  secondaryClearSpace: number;
  secondaryMinSize: number;
  horizontalClearSpace: number;
  horizontalMinSize: number;
  verticalClearSpace: number;
  verticalMinSize: number;
  iconClearSpace: number;
  iconMinSize: number;
  monoBlackClearSpace: number;
  monoBlackMinSize: number;
  monoWhiteClearSpace: number;
  monoWhiteMinSize: number;

  clearSpace: number;
  minSize: number;
}

export interface BrandColors {
  variant: string;
  palette: ColorEntry[];
  numTones: number;
}

export type TypographyTone = 'professional' | 'modern' | 'bold';
export type TypographyDensity = 'compact' | 'comfortable';

export interface BrandTypography {
  variant: string; // Preview template variant
  primaryFont: string;
  tone: TypographyTone;
  density: TypographyDensity;
}

export interface BrandIconography {
  library: string;
  variant: string;
  version: string;
  samples: string[];
}

export interface BrandVoice {
  tone: string[];
  dos: string;
  donts: string;
  examples: string;
}

export interface BrandPrintables {
  variant: string;
  businessCard: string;
  letterhead: string;
  socialMedia: string;
}

export interface BrandSummary {
  variant: string;
  tocItems: TocItem[];
  enabledSections: string[];
}

// ── Master Data Interface ─────────────────────────────────────
export interface BrandData {
  brandMode: 'ai' | 'custom' | 'import';
  aiMockups: string[];
  cover: BrandCover;
  summary: BrandSummary;
  logo: BrandLogo;
  colors: BrandColors;
  typography: BrandTypography;
  iconography: BrandIconography;
  voice: BrandVoice;
  printables: BrandPrintables;
}

// ── Variant Option ────────────────────────────────────────────
export interface VariantOption {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  metadata?: {
    versions?: string[];
    styles?: string[];
  };
}

// ── Step Configuration ────────────────────────────────────────
export interface StepConfig {
  index: number;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  hasVariants: boolean;
}

// ── All Steps ─────────────────────────────────────────────────
export const STEPS: StepConfig[] = [
  { index: 0, id: 'selection', title: 'Builder Type', subtitle: 'AI vs Custom', icon: '⎈', hasVariants: false },
  { index: 1, id: 'cover', title: 'Brand Cover', subtitle: 'Title & brand identity', icon: '◈', hasVariants: true },
  { index: 2, id: 'summary', title: 'Guide Summary', subtitle: 'Table of contents', icon: '▤', hasVariants: true },
  { index: 3, id: 'logo', title: 'Logo System', subtitle: 'Primary, secondary & icon', icon: '◎', hasVariants: true },
  { index: 4, id: 'colors', title: 'Color System', subtitle: 'Primary & secondary colors', icon: '◐', hasVariants: true },
  { index: 5, id: 'typography', title: 'Typography', subtitle: 'Font families & scale', icon: 'Aa', hasVariants: true },
  { index: 6, id: 'iconography', title: 'Iconography', subtitle: 'Icon set & visual style', icon: '✦', hasVariants: true },
  { index: 7, id: 'review', title: 'Review', subtitle: 'Export and finalize', icon: '✓', hasVariants: false },
];

// ── Default Brand Data Factory ────────────────────────────────
export function createDefaultBrandData(): BrandData {
  return {
    brandMode: 'custom',
    aiMockups: [],
    cover: {
      variant: 't1',
      name: '',
      tagline: '',
      description: '',
      industry: [],
      audience: [],
      personality: [],
      year: new Date().getFullYear(),
      shortLogo: '',
      primaryLogo: '',
      background: '',
      theme: 'dark',
    },
    summary: {
      variant: 's1',
      enabledSections: ['selection', 'cover', 'summary', 'logo', 'colors', 'typography', 'iconography', 'review'],
      tocItems: [
        { id: 'cover', num: '01', label: 'Cover Page', sub: 'Title & brand identity', page: '01', icon: '◈' },
        { id: 'logo', num: '02', label: 'Logo System', sub: 'Primary, secondary & icon', page: '03', icon: '◎' },
        { id: 'colors', num: '03', label: 'Color Palette', sub: 'Primary & secondary colors', page: '04', icon: '◐' },
        { id: 'typography', num: '04', label: 'Typography', sub: 'Font families & scale', page: '05', icon: 'Aa' },
        { id: 'iconography', num: '05', label: 'Iconography', sub: 'Icon set & visual style', page: '06', icon: '✦' },
      ],
    },
    logo: {
      variant: 'grid',
      primary: '',
      secondary: '',
      horizontal: '',
      vertical: '',
      icon: '',
      monoBlack: '',
      monoWhite: '',
      clearSpace: 24,
      minSize: 32,
      primaryClearSpace: 24,
      primaryMinSize: 32,
      secondaryClearSpace: 24,
      secondaryMinSize: 32,
      horizontalClearSpace: 24,
      horizontalMinSize: 32,
      verticalClearSpace: 24,
      verticalMinSize: 32,
      iconClearSpace: 24,
      iconMinSize: 32,
      monoBlackClearSpace: 24,
      monoBlackMinSize: 32,
      monoWhiteClearSpace: 24,
      monoWhiteMinSize: 32,
    },
    colors: {
      variant: 'tonal-palette',
      numTones: 10,
      palette: [
        {
          name: 'Primary', category: 'Brand', token: '--color-primary-500', hex: '#4A6E7A', rgb: '74, 110, 122', cmyk: '39, 10, 0, 52', usage: 'Main CTA, key actions, active elements',
          tones: ["#f2f7f9", "#e3eef2", "#c6dce3", "#9fbfc9", "#7fa9b5", "#4a6e7a", "#3c5b66", "#2e474f", "#203438", "#121f20"]
        },
        {
          name: 'Secondary', category: 'Brand', token: '--color-secondary-500', hex: '#AE2D24', rgb: '174, 45, 36', cmyk: '0, 74, 79, 32', usage: 'Secondary actions, less emphasis elements',
          tones: ["#fef3f2", "#fde3e1", "#f9c7c3", "#f29a94", "#e5736b", "#ae2d24", "#93261f", "#7a1f19", "#5c1712", "#3d0f0c"]
        },
        {
          name: 'Accent', category: 'Brand', token: '--color-accent-500', hex: '#6B7A8C', rgb: '107, 122, 140', cmyk: '24, 13, 0, 45', usage: 'Highlights, badges, visual emphasis',
          tones: ["#f5f7fa", "#e6ebf2", "#cfd8e3", "#aab8c8", "#8899aa", "#6b7a8c", "#556272", "#3e4a59", "#2c3744", "#1a232e"]
        },
        {
          name: 'Success', category: 'Semantic', token: '--color-success-500', hex: '#22C55E', rgb: '34, 197, 94', cmyk: '83, 0, 52, 23', usage: 'Success states, confirmations',
          tones: ["#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"]
        },
        {
          name: 'Error', category: 'Semantic', token: '--color-error-500', hex: '#EF4444', rgb: '239, 68, 68', cmyk: '0, 72, 72, 6', usage: 'Errors, destructive actions',
          tones: ["#fef2f2", "#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"]
        },
        {
          name: 'Warning', category: 'Semantic', token: '--color-warning-500', hex: '#F59E0B', rgb: '245, 158, 11', cmyk: '0, 35, 96, 4', usage: 'Alerts, caution',
          tones: ["#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"]
        },
        {
          name: 'Info', category: 'Semantic', token: '--color-info-500', hex: '#3B82F6', rgb: '59, 130, 246', cmyk: '76, 47, 0, 4', usage: 'Informational messages',
          tones: ["#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"]
        },
        {
          name: 'White', category: 'Neutral', token: '--color-neutral-white', hex: '#FFFFFF', rgb: '255, 255, 255', cmyk: '0, 0, 0, 0', usage: 'Base background',
          tones: ["#ffffff", "#fafafa", "#f5f5f5", "#eeeeee", "#e0e0e0", "#cccccc", "#b3b3b3", "#999999", "#666666", "#333333"]
        },
        {
          name: 'Gray', category: 'Neutral', token: '--color-neutral-gray', hex: '#6B7280', rgb: '107, 114, 128', cmyk: '16, 11, 0, 50', usage: 'Neutral elements',
          tones: ["#f9fafb", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151", "#1f2937", "#111827"]
        },
        {
          name: 'Black', category: 'Neutral', token: '--color-neutral-black', hex: '#333333', rgb: '51, 51, 51', cmyk: '0, 0, 0, 80', usage: 'High emphasis text',
          tones: ["#e5e5e5", "#cccccc", "#999999", "#666666", "#4d4d4d", "#333333", "#262626", "#1a1a1a", "#0d0d0d", "#000000"]
        }
      ],
    },
    typography: {
      variant: 'core',
      primaryFont: 'Inter',
      tone: 'professional',
      density: 'comfortable',
    },
    iconography: {
      library: 'react-icons',
      variant: 'regular',
      version: '4.12.0',
      samples: ['FiUser', 'FiBell', 'FiMail', 'FiTrash2', 'FiBookmark', 'FiCalendar', 'FiMessageCircle', 'FiFile', 'FiImage', 'FiCopy', 'FiUser', 'FiCopy', 'FiSave'],
    },
    voice: {
      tone: [],
      dos: '',
      donts: '',
      examples: '',
    },
    printables: {
      variant: 'professional',
      businessCard: '',
      letterhead: '',
      socialMedia: '',
    },
  };
}

// ── Section keys type ─────────────────────────────────────────
export type BrandSection = keyof BrandData;
