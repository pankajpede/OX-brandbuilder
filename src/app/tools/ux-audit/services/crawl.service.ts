import { Injectable } from '@angular/core';

export interface CrawledPage {
  url: string;
  title: string;
  html: string;
  status: number;
  pageType: 'homepage' | 'about' | 'services' | 'contact' | 'portfolio' | 'case-study' | 'product' | 'pricing' | 'generic';
}

@Injectable({ providedIn: 'root' })
export class CrawlService {
  private readonly PROXIES = [
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  public async discoverAndCrawlPages(
    primaryUrl: string,
    crawlLimit: number = 10,
    onProgress?: (msg: string, current: number, total: number) => void
  ): Promise<CrawledPage[]> {
    const results: CrawledPage[] = [];
    const origin = new URL(primaryUrl).origin;
    const visited = new Set<string>();

    const normalize = (u: string) => {
      try {
        const p = new URL(u, origin);
        p.hash = ''; // strip hash for crawling uniqueness
        p.search = ''; // strip query params
        return p.href.replace(/\/$/, '');
      } catch {
        return u;
      }
    };

    const homeNormalized = normalize(primaryUrl);
    visited.add(homeNormalized);

    if (onProgress) onProgress(`Fetching home page: ${primaryUrl}`, 1, crawlLimit);

    const homeHtml = await this.fetchHtmlContent(primaryUrl);
    const homeTitle = this.extractTitle(homeHtml) || 'Home Page';
    
    results.push({
      url: primaryUrl,
      title: homeTitle,
      html: homeHtml,
      status: homeHtml ? 200 : 0,
      pageType: 'homepage'
    });

    if (!homeHtml || results.length >= crawlLimit) {
      return results;
    }

    // Parse discovered internal links from DOM
    const links = this.extractInternalLinks(homeHtml, origin);
    const linksToFetch: Array<{ url: string; type: CrawledPage['pageType'] }> = [];

    for (const link of links) {
      const normLink = normalize(link);
      if (!visited.has(normLink) && this.shouldCrawlUrl(normLink, origin)) {
        visited.add(normLink);
        const type = this.classifyPageType(normLink);
        linksToFetch.push({ url: link, type });
        if (linksToFetch.length >= crawlLimit - 1) break;
      }
    }

    let currentCount = 1;
    for (const item of linksToFetch) {
      currentCount++;
      if (onProgress) onProgress(`Crawling discovered page ${currentCount}/${crawlLimit}: ${item.url}`, currentCount, crawlLimit);
      
      const pageHtml = await this.fetchHtmlContent(item.url);
      const pageTitle = this.extractTitle(pageHtml) || item.url;
      
      results.push({
        url: item.url,
        title: pageTitle,
        html: pageHtml,
        status: pageHtml ? 200 : 0,
        pageType: item.type
      });

      if (results.length >= crawlLimit) break;
    }

    return results;
  }

  private shouldCrawlUrl(url: string, origin: string): boolean {
    try {
      const parsed = new URL(url);
      if (parsed.origin !== origin) return false;

      const path = parsed.pathname.toLowerCase();

      // Exclude non-HTML assets & external paths
      if (/\.(png|jpg|jpeg|gif|svg|pdf|zip|css|js|woff|woff2|ttf|mp4|webm)$/i.test(path)) return false;

      // Exclude login, signup, cart, payment, admin, auth, social, logout
      const blacklistedKeywords = [
        'login', 'signin', 'signup', 'register', 'auth', 'cart', 'checkout', 
        'payment', 'stripe', 'paypal', 'logout', 'account/settings', 'admin'
      ];

      for (const kw of blacklistedKeywords) {
        if (path.includes(kw)) return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private classifyPageType(url: string): CrawledPage['pageType'] {
    const l = url.toLowerCase();
    if (l.includes('about')) return 'about';
    if (l.includes('service') || l.includes('work') || l.includes('feature')) return 'services';
    if (l.includes('contact') || l.includes('hire') || l.includes('touch')) return 'contact';
    if (l.includes('portfolio') || l.includes('project')) return 'portfolio';
    if (l.includes('case-study') || l.includes('case_study')) return 'case-study';
    if (l.includes('price') || l.includes('pricing') || l.includes('plan')) return 'pricing';
    if (l.includes('product')) return 'product';
    return 'generic';
  }

  private extractInternalLinks(html: string, origin: string): string[] {
    const links: string[] = [];
    const hrefRegex = /href=["']([^"']+)["']/gi;
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      const rawHref = match[1];
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        continue;
      }

      try {
        const full = new URL(rawHref, origin).href;
        if (full.startsWith(origin) && !links.includes(full)) {
          links.push(full);
        }
      } catch {
        // invalid link
      }
    }
    return links;
  }

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    }
    return '';
  }

  private async fetchHtmlContent(url: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { mode: 'cors', signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);
      if (res && res.ok) {
        return await res.text();
      }
    } catch {
      // proxy fallback
    }

    for (const proxyFn of this.PROXIES) {
      try {
        const proxyUrl = proxyFn(url);
        const ctrl = new AbortController();
        const pTimeout = setTimeout(() => ctrl.abort(), 4000);
        const proxyRes = await fetch(proxyUrl, { signal: ctrl.signal }).catch(() => null);
        clearTimeout(pTimeout);

        if (proxyRes && proxyRes.ok) {
          const contentType = proxyRes.headers.get('content-type') || '';
          if (contentType.includes('json')) {
            const json = await proxyRes.json();
            if (json && json.contents) return json.contents;
          } else {
            const text = await proxyRes.text();
            if (text && text.length > 100) return text;
          }
        }
      } catch {
        // try next
      }
    }

    return '';
  }
}
