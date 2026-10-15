import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UxAuditService } from '../../services/ux-audit.service';
import { UxPdfService } from '../../services/ux-pdf.service';
import { UxAuditReport, PriorityLevel, VerificationStatus } from '../../models/ux-audit.model';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-ux-audit-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ux-audit-report.component.html',
  styles: [`
    :host { display: block; height: 100%; width: 100%; overflow: hidden; }
  `]
})
export class UxAuditReportComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auditService = inject(UxAuditService);
  private pdfService = inject(UxPdfService);

  report: UxAuditReport | null = null;
  activeSection: string = 'executive';
  activeTab: 'overview' | 'evidence' | 'deepdive' | 'roadmap' | 'all' = 'overview';
  priorityFilter: 'ALL' | PriorityLevel = 'ALL';

  isGeneratingPdf: boolean = false;
  pdfProgress: number = 0;
  pdfMessage: string = '';

  ngOnInit() {
    const auditId = this.route.snapshot.paramMap.get('id');
    if (auditId) {
      const session = this.auditService.getSessionById(auditId);
      if (session && session.report) {
        this.report = session.report;
        return;
      }
    }

    // Default to benchmark mock report if not found or empty
    this.report = this.auditService.getMockReport();
  }

  setActiveTab(tab: 'overview' | 'evidence' | 'deepdive' | 'roadmap' | 'all') {
    this.activeTab = tab;
    const container = document.getElementById('report-container');
    if (container) container.scrollTop = 0;
  }

  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;

    // Automatically switch to tab containing this section if needed
    if (['sec-cover', 'sec-executive', 'sec-scorecard', 'sec-findings'].includes(sectionId)) {
      if (this.activeTab !== 'all') this.activeTab = 'overview';
    } else if (['sec-evidence'].includes(sectionId)) {
      if (this.activeTab !== 'all') this.activeTab = 'evidence';
    } else if (['sec-matrix', 'sec-roadmap', 'sec-components', 'sec-methodology', 'sec-appendix'].includes(sectionId)) {
      if (this.activeTab !== 'all') this.activeTab = 'roadmap';
    } else {
      if (this.activeTab !== 'all') this.activeTab = 'deepdive';
    }

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  exportJson() {
    if (!this.report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.report, null, 2));
    const filename = `OX_UX_Audit_${this.report.audit.id}_${this.report.audit.domain}.json`;
    saveAs(dataStr, filename);
  }

  async downloadPdf() {
    if (!this.report) return;
    const currentTab = this.activeTab;
    this.activeTab = 'all';
    await new Promise(r => setTimeout(r, 100));

    this.isGeneratingPdf = true;
    this.pdfProgress = 5;
    this.pdfMessage = 'Initializing PDF generator...';

    try {
      const reportContainer = document.getElementById('report-container') || undefined;
      await this.pdfService.generatePdf(this.report, reportContainer, (pct, msg) => {
        this.pdfProgress = pct;
        this.pdfMessage = msg;
      });
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('PDF generation encountered an error. Proceeding with structured data export.');
    } finally {
      this.isGeneratingPdf = false;
      this.activeTab = currentTab;
    }
  }

  reRunAudit() {
    if (!this.report) return;
    const session = this.auditService.createSession(this.report.audit.url);
    this.router.navigate(['/ux-audit/progress', session.auditId]);
  }

  goBackHome() {
    this.router.navigate(['/ux-audit']);
  }

  getFilteredFindings() {
    if (!this.report) return [];
    if (this.priorityFilter === 'ALL') return this.report.findings;
    return this.report.findings.filter(f => f.priority === this.priorityFilter);
  }

  getScoreColorClass(score: number): string {
    if (score >= 7.5) return 'text-emerald-700 border-emerald-300 bg-emerald-50';
    if (score >= 6.0) return 'text-amber-700 border-amber-300 bg-amber-50';
    return 'text-rose-700 border-rose-300 bg-rose-50';
  }

  getPriorityBadgeClass(priority: PriorityLevel): string {
    switch (priority) {
      case 'P0': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'P1': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'P2': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'P3': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getStatusBadgeClass(status: VerificationStatus): string {
    switch (status) {
      case 'PASS': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'FAIL': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'REVIEW': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'TEST REQUIRED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  }

  getSnippetStatusClass(status: string): string {
    switch (status) {
      case 'FAIL': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'WARN': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'PASS': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  }
}
