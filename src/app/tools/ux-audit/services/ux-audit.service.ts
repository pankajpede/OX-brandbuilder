import { Injectable } from '@angular/core';
import { UxAuditReport, UxAuditSession, AuditStatus } from '../models/ux-audit.model';
import { PANKAJ_PEDE_MOCK_AUDIT } from '../data/pankaj-pede-mock.data';

const STORAGE_KEY = 'ox_ux_audits_v1';

@Injectable({ providedIn: 'root' })
export class UxAuditService {
  private sessions: UxAuditSession[] = [];

  constructor() {
    this.loadSessions();
  }

  private loadSessions(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.sessions = JSON.parse(stored);
      }
    } catch {
      this.sessions = [];
    }

    // Always ensure mock demo session is available in history
    if (!this.sessions.some(s => s.auditId === 'UXA-2026-0001')) {
      this.sessions.unshift({
        auditId: 'UXA-2026-0001',
        url: 'https://pankajpede.github.io/aboutme/',
        domain: 'pankajpede.github.io',
        createdAt: '2026-09-09T10:00:00.000Z',
        status: 'completed',
        progress: 100,
        stage: 'Completed',
        report: PANKAJ_PEDE_MOCK_AUDIT
      });
      this.saveSessions();
    }
  }

  private saveSessions(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (e) {
      console.warn('Could not save audit sessions to localStorage', e);
    }
  }

  public getAllSessions(): UxAuditSession[] {
    return [...this.sessions];
  }

  public getSessionById(auditId: string): UxAuditSession | undefined {
    return this.sessions.find(s => s.auditId === auditId);
  }

  public createSession(url: string): UxAuditSession {
    const domain = this.extractDomain(url);
    const count = this.sessions.length + 1;
    const auditId = `UXA-2026-${String(count).padStart(4, '0')}`;

    const newSession: UxAuditSession = {
      auditId,
      url,
      domain,
      createdAt: new Date().toISOString(),
      status: 'queued',
      progress: 0,
      stage: 'Initializing Audit Pipeline...'
    };

    this.sessions.unshift(newSession);
    this.saveSessions();
    return newSession;
  }

  public createFileSession(file: File, fileType: 'image' | 'pdf'): UxAuditSession {
    const count = this.sessions.length + 1;
    const auditId = `UXA-2026-${String(count).padStart(4, '0')}`;
    const fileLabel = fileType === 'image' ? `Mockup: ${file.name}` : `PDF: ${file.name}`;

    const newSession: UxAuditSession = {
      auditId,
      url: fileLabel,
      domain: file.name,
      createdAt: new Date().toISOString(),
      status: 'queued',
      progress: 0,
      stage: `Initializing ${fileType.toUpperCase()} Analysis Pipeline...`
    };

    this.sessions.unshift(newSession);
    this.saveSessions();
    return newSession;
  }

  public updateSession(auditId: string, updates: Partial<UxAuditSession>): UxAuditSession | undefined {
    const session = this.sessions.find(s => s.auditId === auditId);
    if (session) {
      Object.assign(session, updates);
      this.saveSessions();
    }
    return session;
  }

  public getMockReport(): UxAuditReport {
    return JSON.parse(JSON.stringify(PANKAJ_PEDE_MOCK_AUDIT));
  }

  public isValidUrl(urlStr: string): { valid: boolean; error?: string } {
    if (!urlStr || !urlStr.trim()) {
      return { valid: false, error: 'Please enter a website URL' };
    }

    let clean = urlStr.trim();
    
    // Disallow dangerous or non-web protocols upfront
    if (/^(javascript|data|file|vbscript|blob):/i.test(clean)) {
      return { valid: false, error: 'Invalid URL protocol. Only HTTP and HTTPS are supported.' };
    }

    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }

    try {
      const parsed = new URL(clean);
      const host = parsed.hostname.toLowerCase();
      const protocol = parsed.protocol as string;

      if (protocol !== 'http:' && protocol !== 'https:') {
        return { valid: false, error: 'Only HTTP and HTTPS URLs are supported' };
      }

      // Check if domain contains at least one dot
      if (!host.includes('.')) {
        return { valid: false, error: 'Please enter a complete domain name (e.g. example.com)' };
      }

      // Restrict private IP ranges and localhost
      const isPrivate = 
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host === '::1' ||
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        host.startsWith('169.254.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
        host.endsWith('.local') ||
        host.endsWith('.internal');

      if (isPrivate) {
        return { valid: false, error: 'Private or local network URLs are restricted for security reasons.' };
      }

      // Domain format validation
      const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);

      if (!isIp && !domainRegex.test(host)) {
        return { valid: false, error: 'Invalid domain format. Example: https://example.com' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format. Example: https://example.com' };
    }
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

  public extractDomain(urlStr: string): string {
    try {
      const norm = this.normalizeUrl(urlStr);
      return new URL(norm).hostname.replace(/^www\./i, '');
    } catch {
      return urlStr;
    }
  }
}
