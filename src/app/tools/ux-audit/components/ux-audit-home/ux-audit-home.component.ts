import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UxAuditService } from '../../services/ux-audit.service';
import { UxAuditSession } from '../../models/ux-audit.model';

@Component({
  selector: 'app-ux-audit-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ux-audit-home.component.html',
  styles: [`
    :host { display: block; height: 100%; width: 100%; overflow: hidden; }
  `]
})
export class UxAuditHomeComponent {
  private auditService = inject(UxAuditService);
  private router = inject(Router);

  targetUrl: string = '';
  attachedFile: File | null = null;
  attachedFileType: 'image' | 'pdf' | null = null;

  errorMessage: string | null = null;
  recentSessions: UxAuditSession[] = [];

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.recentSessions = this.auditService.getAllSessions();
  }

  onUrlInput() {
    if (this.attachedFile) return;

    if (this.targetUrl.trim().length > 3) {
      const validation = this.auditService.isValidUrl(this.targetUrl);
      if (!validation.valid && this.targetUrl.includes('.')) {
        this.errorMessage = validation.error || 'Invalid URL';
      } else {
        this.errorMessage = null;
      }
    } else {
      this.errorMessage = null;
    }
  }

  onFileAttached(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (!isImg && !isPdf) {
      this.errorMessage = 'Please select a valid image (PNG, JPG, WebP) or PDF document (.pdf).';
      return;
    }

    this.attachedFile = file;
    this.attachedFileType = isImg ? 'image' : 'pdf';
    this.errorMessage = null;
  }

  clearAttachedFile() {
    this.attachedFile = null;
    this.attachedFileType = null;
    this.errorMessage = null;
  }

  startAudit(urlToAudit?: string) {
    this.errorMessage = null;

    if (this.attachedFile && this.attachedFileType) {
      const session = this.auditService.createFileSession(this.attachedFile, this.attachedFileType);
      this.router.navigate(['/ux-audit/progress', session.auditId]);
      return;
    }

    const raw = urlToAudit || this.targetUrl;
    if (!raw || !raw.trim()) {
      this.errorMessage = 'Please enter a website URL or attach an image/PDF file.';
      return;
    }

    const validation = this.auditService.isValidUrl(raw);
    if (!validation.valid) {
      this.errorMessage = validation.error || 'Invalid URL';
      return;
    }

    const session = this.auditService.createSession(raw);
    this.router.navigate(['/ux-audit/progress', session.auditId]);
  }

  useDemoUrl() {
    this.clearAttachedFile();
    this.targetUrl = 'https://pankajpede.github.io/aboutme/';
    this.startAudit(this.targetUrl);
  }

  viewReport(auditId: string) {
    this.router.navigate(['/ux-audit/report', auditId]);
  }
}
