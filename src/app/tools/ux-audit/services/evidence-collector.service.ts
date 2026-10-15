import { Injectable } from '@angular/core';

export interface ExtractedPageEvidence {
  url: string;
  title: string;
  metaDescription: string;
  language: string;
  viewport: string;
  h1s: string[];
  h2s: string[];
  h3s: string[];
  navItems: string[];
  buttons: Array<{ text: string; role?: string; class?: string }>;
  links: Array<{ text: string; href: string; isExternal: boolean }>;
  images: Array<{ src: string; alt: string; hasAlt: boolean }>;
  forms: Array<{ fieldCount: number; hasLabels: boolean; buttonText: string }>;
  colors: string[];
  wordCount: number;
}

@Injectable({ providedIn: 'root' })
export class EvidenceCollectorService {
  public collectPageEvidence(url: string, html: string, pageTitle: string): ExtractedPageEvidence {
    if (!html) {
      return {
        url,
        title: pageTitle || url,
        metaDescription: '',
        language: '',
        viewport: '',
        h1s: [],
        h2s: [],
        h3s: [],
        navItems: [],
        buttons: [],
        links: [],
        images: [],
        forms: [],
        colors: [],
        wordCount: 0
      };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Language & Viewport
    const htmlLang = doc.documentElement.getAttribute('lang') || '';
    const viewportMeta = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';

    // Meta Description
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // Headings
    const h1s = Array.from(doc.querySelectorAll('h1')).map(el => el.textContent?.trim() || '').filter(Boolean);
    const h2s = Array.from(doc.querySelectorAll('h2')).map(el => el.textContent?.trim() || '').filter(Boolean);
    const h3s = Array.from(doc.querySelectorAll('h3')).map(el => el.textContent?.trim() || '').filter(Boolean);

    // Nav Items
    const navItems: string[] = [];
    doc.querySelectorAll('nav a, header a').forEach(el => {
      const txt = el.textContent?.trim();
      if (txt && txt.length < 30 && !navItems.includes(txt)) {
        navItems.push(txt);
      }
    });

    // Buttons
    const buttons: Array<{ text: string; role?: string; class?: string }> = [];
    doc.querySelectorAll('button, a.btn, a.cta, a.button, input[type="submit"]').forEach(el => {
      const txt = el.textContent?.trim() || el.getAttribute('value') || '';
      if (txt) {
        buttons.push({
          text: txt,
          class: el.getAttribute('class') || '',
          role: el.getAttribute('role') || el.tagName.toLowerCase()
        });
      }
    });

    // Links
    const links: Array<{ text: string; href: string; isExternal: boolean }> = [];
    doc.querySelectorAll('a[href]').forEach(el => {
      const txt = el.textContent?.trim() || '';
      const href = el.getAttribute('href') || '';
      if (href) {
        const isExternal = href.startsWith('http') && !href.includes(url);
        links.push({ text: txt, href, isExternal });
      }
    });

    // Images
    const images: Array<{ src: string; alt: string; hasAlt: boolean }> = [];
    doc.querySelectorAll('img').forEach(el => {
      const src = el.getAttribute('src') || '';
      const alt = el.getAttribute('alt');
      images.push({
        src,
        alt: alt || '',
        hasAlt: alt !== null && alt.trim().length > 0
      });
    });

    // Forms
    const forms: Array<{ fieldCount: number; hasLabels: boolean; buttonText: string }> = [];
    doc.querySelectorAll('form').forEach(formEl => {
      const inputs = formEl.querySelectorAll('input, select, textarea');
      const labels = formEl.querySelectorAll('label');
      const submitBtn = formEl.querySelector('button, input[type="submit"]')?.textContent?.trim() || 'Submit';

      forms.push({
        fieldCount: inputs.length,
        hasLabels: labels.length >= inputs.length * 0.8,
        buttonText: submitBtn
      });
    });

    // Hex & Color extractions from CSS
    const rawHexes = html.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || [];
    const colors = Array.from(new Set(rawHexes)).slice(0, 10);

    // Word count calculation
    const bodyText = doc.body?.textContent || '';
    const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length;

    return {
      url,
      title: doc.title?.trim() || pageTitle || url,
      metaDescription: metaDesc,
      language: htmlLang,
      viewport: viewportMeta,
      h1s,
      h2s,
      h3s,
      navItems,
      buttons,
      links,
      images,
      forms,
      colors,
      wordCount
    };
  }
}
