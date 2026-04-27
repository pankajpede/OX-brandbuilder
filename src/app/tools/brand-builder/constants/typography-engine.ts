import { TypographyTone, TypographyDensity } from '../models/brand.model';

export function generateTypographyTokens(tone: TypographyTone, density: TypographyDensity) {
  // 1. Base Density Multiplier
  const sizeMultiplier = density === 'compact' ? 0.93 : 1.0;

  // 2. Base Specs per Tone (Size / Weight / Line-Height)
  const toneSpecs = {
    modern: {
      display: { size: 30, weight: '600', lh: '1.2' },
      heading: { size: 20, weight: '500', lh: '1.3' },
      body:    { size: 15, weight: '400', lh: '1.6' },
      label:   { size: 12, weight: '400', lh: '1.4' },
      caption: { size: 12, weight: '400', lh: '1.5' },
      button:  { size: 14, weight: '500', lh: '1.4' }
    },
    professional: {
      display: { size: 32, weight: '600', lh: '1.25' },
      heading: { size: 22, weight: '600', lh: '1.3' },
      body:    { size: 16, weight: '400', lh: '1.5' },
      label:   { size: 13, weight: '500', lh: '1.4' },
      caption: { size: 12, weight: '400', lh: '1.4' },
      button:  { size: 14, weight: '500', lh: '1.4' }
    },
    bold: {
      display: { size: 34, weight: '600', lh: '1.2' },
      heading: { size: 24, weight: '600', lh: '1.25' },
      body:    { size: 16, weight: '500', lh: '1.5' },
      label:   { size: 13, weight: '500', lh: '1.35' },
      caption: { size: 12, weight: '500', lh: '1.4' },
      button:  { size: 15, weight: '600', lh: '1.35' }
    }
  }[tone];

  const scale = (px: number) => `${Math.round(px * sizeMultiplier)}px`;

  return {
    // Headings (H1 = Display, H2 = Heading, H3 = Heading - 2px)
    '--h1-size': scale(toneSpecs.display.size),
    '--h1-weight': toneSpecs.display.weight,
    '--h1-lh': toneSpecs.display.lh,
    
    '--h2-size': scale(toneSpecs.heading.size),
    '--h2-weight': toneSpecs.heading.weight,
    '--h2-lh': toneSpecs.heading.lh,
    
    '--h3-size': scale(toneSpecs.heading.size - 2),
    '--h3-weight': toneSpecs.heading.weight,
    '--h3-lh': toneSpecs.heading.lh,

    // Body (L = Body + 2px, MD = Body, SM = Body - 2px)
    '--body-lg-size': scale(toneSpecs.body.size + 2),
    '--body-lg-weight': toneSpecs.body.weight,
    '--body-lg-lh': toneSpecs.body.lh,
    
    '--body-md-size': scale(toneSpecs.body.size),
    '--body-md-weight': toneSpecs.body.weight,
    '--body-md-lh': toneSpecs.body.lh,
    
    '--body-sm-size': scale(toneSpecs.body.size - 2),
    '--body-sm-weight': toneSpecs.body.weight,
    '--body-sm-lh': toneSpecs.body.lh,

    // UI
    '--ui-label-size': scale(toneSpecs.label.size),
    '--ui-label-weight': toneSpecs.label.weight,
    '--ui-label-lh': toneSpecs.label.lh,
    '--ui-label-transform': 'uppercase',
    '--ui-label-spacing': '0.08em',

    '--ui-input-size': scale(toneSpecs.body.size),
    '--ui-input-weight': toneSpecs.body.weight,
    '--ui-input-lh': '1.2',

    '--ui-helper-size': scale(toneSpecs.caption.size),
    '--ui-helper-weight': toneSpecs.caption.weight,
    '--ui-helper-lh': toneSpecs.caption.lh,

    '--ui-caption-size': scale(toneSpecs.caption.size),
    '--ui-caption-weight': toneSpecs.caption.weight,
    '--ui-caption-lh': toneSpecs.caption.lh,

    // Actions
    '--action-btn-size': scale(toneSpecs.button.size),
    '--action-btn-weight': toneSpecs.button.weight,
    '--action-btn-lh': toneSpecs.button.lh,
  };
}
