import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UxAuditService } from '../../services/ux-audit.service';
import { UxAuditSession } from '../../models/ux-audit.model';
import { UxPdfService } from '../../services/ux-pdf.service';

@Component({
  selector: 'app-ux-audit-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ux-audit-history.component.html',
  styles: [`
    :host { display: block; height: 100%; width: 100%; overflow: hidden; }
  `]
})
export class UxAuditHistoryComponent implements OnInit {
  private auditService = inject(UxAuditService);
  private pdfService = inject(UxPdfService);
  private router = inject(Router);

  sessions: UxAuditSession[] = [];

  ngOnInit() {
    this.sessions = this.auditService.getAllSessions();
  }

  viewReport(auditId: string) {
    this.router.navigate(['/ux-audit/report', auditId]);
  }

  async downloadPdf(session: UxAuditSession) {
    if (session.report) {
      await this.pdfService.generatePdf(session.report);
    } else {
      this.viewReport(session.auditId);
    }
  }

  newAudit() {
    this.router.navigate(['/ux-audit']);
  }
}
