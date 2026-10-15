import { Injectable } from '@angular/core';
import { ExtractedPageEvidence } from './evidence-collector.service';
import { UxFinding, AccessibilityCheck } from '../models/ux-audit.model';

@Injectable({ providedIn: 'root' })
export class DeterministicRuleEngineService {
  public runDeterministicChecks(pageEvidences: ExtractedPageEvidence[]): {
    findings: UxFinding[];
    accessibilityChecks: AccessibilityCheck[];
  } {
    const findings: UxFinding[] = [];
    const accessibilityChecks: AccessibilityCheck[] = [];
    let findingCounter = 1;

    const mainPage = pageEvidences[0];

    // 1. Language Attribute Check
    if (mainPage && !mainPage.language) {
      accessibilityChecks.push({
        id: 'A11Y-01',
        category: 'Language & Document',
        item: 'Document Language Attribute',
        status: 'FAIL',
        details: 'The html element does not specify a lang attribute (e.g. lang="en").'
      });
      findings.push({
        id: `UX-${String(findingCounter++).padStart(3, '0')}`,
        category: 'Accessibility',
        priority: 'P1',
        severity: 'high',
        confidence: 1.0,
        page: mainPage.url,
        element: '<html>',
        title: 'Missing document language attribute',
        description: 'The root <html> element is missing the lang attribute, which prevents screen readers from choosing correct pronunciation rules.',
        evidence: ['Attribute <html lang="..."> is not set on main page HTML'],
        uxImpact: 'Screen reader users may hear mispronounced text.',
        recommendation: ['Add lang="en" (or appropriate language code) to <html> tag.'],
        principle: 'Perceivable (WCAG 3.1.1 Language of Page)',
        evidenceType: 'automated',
        owner: 'Frontend Dev'
      });
    } else {
      accessibilityChecks.push({
        id: 'A11Y-01',
        category: 'Language & Document',
        item: 'Document Language Attribute',
        status: 'PASS',
        details: `<html lang="${mainPage?.language || 'en'}"> is set.`
      });
    }

    // 2. Viewport Tag Check
    if (mainPage && !mainPage.viewport) {
      findings.push({
        id: `UX-${String(findingCounter++).padStart(3, '0')}`,
        category: 'Mobile UX',
        priority: 'P0',
        severity: 'critical',
        confidence: 1.0,
        page: mainPage.url,
        element: '<head>',
        title: 'Missing viewport meta tag for mobile responsiveness',
        description: 'The page is missing <meta name="viewport" content="width=device-width, initial-scale=1">.',
        evidence: ['No viewport meta tag found in document head'],
        uxImpact: 'Mobile devices will render the page as a zoomed-out desktop view.',
        recommendation: ['Add <meta name="viewport" content="width=device-width, initial-scale=1.0">.'],
        principle: 'Mobile Ergonomics & Responsiveness',
        evidenceType: 'automated',
        owner: 'Frontend Lead'
      });
    }

    // 3. H1 Heading Checks across all pages
    pageEvidences.forEach((ev, idx) => {
      if (ev.h1s.length === 0) {
        findings.push({
          id: `UX-${String(findingCounter++).padStart(3, '0')}`,
          category: 'Visual Hierarchy',
          priority: 'P1',
          severity: 'medium',
          confidence: 1.0,
          page: ev.url,
          element: '<h1>',
          title: `Missing primary H1 tag on page "${ev.title}"`,
          description: `Page at ${ev.url} contains no <h1> primary heading element.`,
          evidence: ['0 <h1> tags found in page DOM'],
          uxImpact: 'Impairs document outline parsing for assistive technologies and search engine crawlers.',
          recommendation: ['Include exactly one semantic <h1> element summarizing page purpose.'],
          principle: 'Information Architecture & Structure',
          evidenceType: 'automated',
          owner: 'Content / Dev'
        });
      } else if (ev.h1s.length > 1) {
        findings.push({
          id: `UX-${String(findingCounter++).padStart(3, '0')}`,
          category: 'Visual Hierarchy',
          priority: 'P2',
          severity: 'low',
          confidence: 0.95,
          page: ev.url,
          element: '<h1>',
          title: `Multiple H1 headings detected on "${ev.title}"`,
          description: `Page at ${ev.url} contains ${ev.h1s.length} separate <h1> elements.`,
          evidence: [`${ev.h1s.length} <h1> tags found: "${ev.h1s.join('", "')}"`],
          uxImpact: 'Creates ambiguous document hierarchy for screen reader users.',
          recommendation: ['Reserve <h1> for the primary page title and use <h2> for section headers.'],
          principle: 'Structure & Hierarchy',
          evidenceType: 'automated',
          owner: 'Frontend Dev'
        });
      }
    });

    // 4. Missing Alt Text Check
    let totalImages = 0;
    let missingAltCount = 0;
    const missingAltPages: string[] = [];

    pageEvidences.forEach(ev => {
      ev.images.forEach(img => {
        totalImages++;
        if (!img.hasAlt) {
          missingAltCount++;
          if (!missingAltPages.includes(ev.title)) missingAltPages.push(ev.title);
        }
      });
    });

    if (missingAltCount > 0) {
      accessibilityChecks.push({
        id: 'A11Y-03',
        category: 'Images',
        item: 'Image Alt Text Descriptions',
        status: 'FAIL',
        details: `${missingAltCount} of ${totalImages} image(s) lack an alt attribute.`
      });

      findings.push({
        id: `UX-${String(findingCounter++).padStart(3, '0')}`,
        category: 'Accessibility',
        priority: 'P1',
        severity: 'high',
        confidence: 0.98,
        page: mainPage?.url || '/',
        element: '<img>',
        title: `${missingAltCount} image(s) missing alt text descriptions`,
        description: `Images across ${missingAltPages.join(', ')} do not supply descriptive alt text or explicit decorative alt="" tags.`,
        evidence: [`${missingAltCount} img tags missing alt attributes out of ${totalImages} total images`],
        uxImpact: 'Screen reader users cannot understand image context or meaning.',
        recommendation: [
          'Add meaningful alt text describing image context for informative images.',
          'Use alt="" for purely decorative graphics.'
        ],
        principle: 'Perceivable (WCAG 1.1.1 Non-text Content)',
        evidenceType: 'automated',
        owner: 'Content / UI Lead'
      });
    } else {
      accessibilityChecks.push({
        id: 'A11Y-03',
        category: 'Images',
        item: 'Image Alt Text Descriptions',
        status: 'PASS',
        details: 'All analyzed images include valid alt attributes.'
      });
    }

    // 5. Navigation Items Count Check
    if (mainPage && mainPage.navItems.length > 7) {
      findings.push({
        id: `UX-${String(findingCounter++).padStart(3, '0')}`,
        category: 'Navigation',
        priority: 'P1',
        severity: 'medium',
        confidence: 0.92,
        page: mainPage.url,
        element: '<nav>',
        title: 'Excessive primary navigation items increase scanning complexity',
        description: `Primary navigation bar contains ${mainPage.navItems.length} top-level links, exceeding recommended cognitive load thresholds (5-7 items).`,
        evidence: [`Navigation items parsed: ${mainPage.navItems.slice(0, 8).join(', ')}...`],
        uxImpact: 'Increases visual clutter and forces users to process too many choices simultaneously.',
        recommendation: ['Consolidate links into 4-6 primary categories and move secondary items into sub-menus or footer.'],
        principle: 'Hick\'s Law & Choice Reduction',
        evidenceType: 'automated',
        owner: 'UX Architect'
      });
    }

    // 6. Generic CTA Labels Check
    const genericCtaWords = ['click here', 'learn more', 'read more', 'submit', 'more'];
    const genericFound: string[] = [];

    pageEvidences.forEach(ev => {
      ev.buttons.concat(ev.links).forEach(item => {
        const txt = item.text.toLowerCase().trim();
        if (genericCtaWords.includes(txt) && !genericFound.includes(item.text)) {
          genericFound.push(item.text);
        }
      });
    });

    if (genericFound.length > 0) {
      findings.push({
        id: `UX-${String(findingCounter++).padStart(3, '0')}`,
        category: 'Conversion UX',
        priority: 'P2',
        severity: 'medium',
        confidence: 0.88,
        page: mainPage?.url || '/',
        element: '<button> / <a>',
        title: 'Generic CTA button labels reduce user action clarity',
        description: `Detected uninformative button text such as "${genericFound.join('", "')}".`,
        evidence: [`Generic CTA labels found: ${genericFound.join(', ')}`],
        uxImpact: 'Out-of-context screen reader scans and fast user skimming suffer from uninformative links.',
        recommendation: ['Use action-oriented, descriptive button text like "Download UX Framework", "View Project Case Study", "Book Strategy Call".'],
        principle: 'Action Clarity & Predictability',
        evidenceType: 'automated',
        owner: 'Content Strategist'
      });
    }

    // 7. Form Labels Check
    pageEvidences.forEach(ev => {
      ev.forms.forEach(form => {
        if (!form.hasLabels && form.fieldCount > 0) {
          accessibilityChecks.push({
            id: 'A11Y-06',
            category: 'Forms',
            item: 'Form Input Label Association',
            status: 'FAIL',
            details: `Form on ${ev.title} contains ${form.fieldCount} fields without associated <label> elements.`
          });
          findings.push({
            id: `UX-${String(findingCounter++).padStart(3, '0')}`,
            category: 'Accessibility',
            priority: 'P1',
            severity: 'high',
            confidence: 0.95,
            page: ev.url,
            element: '<form>',
            title: `Form fields missing explicit <label> tags on ${ev.title}`,
            description: 'Form inputs rely on placeholder text rather than dedicated <label> elements.',
            evidence: [`Form with ${form.fieldCount} input fields parsed without <label> tags`],
            uxImpact: 'Placeholders disappear when typing and fail screen reader field identification.',
            recommendation: ['Pair every <input> with a visible <label for="..."> tag.'],
            principle: 'Perceivable & Operable (WCAG 3.3.2 Labels or Instructions)',
            evidenceType: 'automated',
            owner: 'Frontend Engineer'
          });
        }
      });
    });

    return { findings, accessibilityChecks };
  }
}
