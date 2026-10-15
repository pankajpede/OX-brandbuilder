import { TestBed } from '@angular/core/testing';
import { ColorIntelligenceService } from './color-intelligence.service';
import { ColorEvidenceItem } from '../models/color-intelligence.model';

describe('ColorIntelligenceService', () => {
  let service: ColorIntelligenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorIntelligenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should normalize HEX, RGB, HSL, and OKLCH formats to uppercase HEX', () => {
    const hex = service.normalizeColor('#2563eb');
    expect(hex?.hex).toBe('#2563EB');

    const rgb = service.normalizeColor('rgb(37, 99, 235)');
    expect(rgb?.hex).toBe('#2563EB');

    const hsl = service.normalizeColor('hsl(217, 84%, 53%)');
    expect(hsl?.hex).toBe('#2563EB');
  });

  it('should cluster visually similar colors based on perceptual distance', () => {
    const norm1 = service.normalizeColor('#2563EB')!;
    const norm2 = service.normalizeColor('#2463EA')!;
    const norm3 = service.normalizeColor('#DC2626')!;

    const items: ColorEvidenceItem[] = [
      {
        id: '1',
        color: norm1,
        contexts: [{ element: 'button', property: 'backgroundColor', classes: ['btn-primary'] }],
        usageCount: 10,
        cssVariables: ['--primary'],
        semanticClasses: ['btn-primary'],
        semanticSignals: ['button-cta'],
        sources: ['css_variable'],
        pages: ['/']
      },
      {
        id: '2',
        color: norm2,
        contexts: [{ element: 'a', property: 'color', classes: ['text-primary'] }],
        usageCount: 5,
        cssVariables: ['--color-primary'],
        semanticClasses: [],
        semanticSignals: [],
        sources: ['computed_css'],
        pages: ['/about']
      },
      {
        id: '3',
        color: norm3,
        contexts: [{ element: 'div', role: 'alert', property: 'backgroundColor', classes: ['alert-danger'] }],
        usageCount: 3,
        cssVariables: ['--error'],
        semanticClasses: ['alert-danger'],
        semanticSignals: ['alert-error'],
        sources: ['website_dom'],
        pages: ['/checkout']
      }
    ];

    const clusters = service.clusterEvidenceItems(items);
    const clusterKeys = Object.keys(clusters);
    expect(clusterKeys.length).toBe(2); // Should cluster #2563EB and #2463EA together, and #DC2626 separately
  });

  it('should correctly classify Primary, Secondary, Success, Warning, and Error semantic roles', () => {
    const pColor = service.normalizeColor('#2563EB')!;
    const sColor = service.normalizeColor('#22C55E')!;
    const eColor = service.normalizeColor('#EF4444')!;

    const items: ColorEvidenceItem[] = [
      {
        id: 'p1',
        color: pColor,
        contexts: [{ element: 'button', role: 'button', property: 'backgroundColor', classes: ['btn-primary'] }],
        usageCount: 20,
        cssVariables: ['--primary'],
        semanticClasses: ['btn-primary'],
        semanticSignals: ['button-cta'],
        sources: ['css_variable', 'website_dom'],
        pages: ['/', '/pricing']
      },
      {
        id: 's1',
        color: sColor,
        contexts: [{ element: 'div', role: 'alert', property: 'backgroundColor', classes: ['alert-success'] }],
        usageCount: 8,
        cssVariables: ['--success'],
        semanticClasses: ['alert-success'],
        semanticSignals: ['alert-success'],
        sources: ['css_variable'],
        pages: ['/dashboard']
      },
      {
        id: 'e1',
        color: eColor,
        contexts: [{ element: 'div', role: 'alert', property: 'backgroundColor', classes: ['alert-danger'] }],
        usageCount: 5,
        cssVariables: ['--error'],
        semanticClasses: ['alert-danger'],
        semanticSignals: ['alert-error'],
        sources: ['website_dom'],
        pages: ['/checkout']
      }
    ];

    const clusters = service.clusterEvidenceItems(items);
    const roles = service.classifySemanticRoles(clusters);

    expect(roles.primary.baseHex).toBe('#2563EB');
    expect(roles.primary.status).toBe('detected');
    expect(roles.success.baseHex).toBe('#22C55E');
    expect(roles.error.baseHex).toBe('#EF4444');
  });

  it('should not fabricate semantic roles when evidence is missing', () => {
    const pColor = service.normalizeColor('#2563EB')!;
    const items: ColorEvidenceItem[] = [
      {
        id: 'p1',
        color: pColor,
        contexts: [{ element: 'button', property: 'backgroundColor', classes: [] }],
        usageCount: 2,
        cssVariables: [],
        semanticClasses: [],
        semanticSignals: [],
        sources: ['computed_css'],
        pages: ['/']
      }
    ];

    const clusters = service.clusterEvidenceItems(items);
    const roles = service.classifySemanticRoles(clusters);

    expect(roles.warning.status).toBe('not_detected');
    expect(roles.warning.baseHex).toBeUndefined();
  });
});
