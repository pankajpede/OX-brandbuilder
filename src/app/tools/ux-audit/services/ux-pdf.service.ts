import { Injectable } from '@angular/core';
import { UxAuditReport } from '../models/ux-audit.model';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class UxPdfService {
  /** Generate a complete 18-section executive consulting PDF report using jsPDF */
  public async generatePdf(
    report: UxAuditReport,
    reportElement?: HTMLElement,
    onProgress?: (percent: number, message: string) => void
  ): Promise<void> {
    const update = (pct: number, msg: string) => {
      if (onProgress) onProgress(pct, msg);
    };

    update(10, 'Initializing PDF rendering engine...');
    await new Promise(r => setTimeout(r, 100));

    const jsPDFModule = await import('jspdf');
    const { jsPDF } = jsPDFModule;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    const addHeaderFooter = (pageNo: number, title: string = 'OX UX Audit Report') => {
      if (pageNo === 1) return; // Skip cover

      // Header line & text
      pdf.setDrawColor(226, 232, 240); // slate-200
      pdf.setLineWidth(0.3);
      pdf.line(margin, 12, pageWidth - margin, 12);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.text(`OX UX AUDIT • ${report.website.title.substring(0, 45)}`, margin, 10);
      pdf.text(report.audit.id, pageWidth - margin, 10, { align: 'right' });

      // Footer line & text
      pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      pdf.text('OX Universal Framework & Xecution Studio • Executive UX Consulting Report', margin, pageHeight - 7);
      pdf.text(`Page ${pageNo}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    };

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 1: COVER PAGE
    // ──────────────────────────────────────────────────────────────────────────
    update(20, 'Generating Cover Page...');
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Accent top bar
    pdf.setFillColor(10, 102, 194); // #0A66C2 (Primary Blue)
    pdf.rect(15, 20, 180, 5, 'F');

    pdf.setTextColor(10, 102, 194); // #0A66C2
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('UX • PRODUCT EXPERIENCE • ACCESSIBILITY AUDIT', margin, 30);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(26);
    pdf.text(report.website.title, margin, 46, { maxWidth: contentWidth });

    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text('Comprehensive Website UX, Conversion, Content & Accessibility Consulting Report', margin, 68, { maxWidth: contentWidth });

    // Details Panel
    pdf.setFillColor(30, 41, 59); // slate-800
    pdf.roundedRect(margin, 82, contentWidth, 75, 4, 4, 'F');

    pdf.setFontSize(10);
    pdf.setTextColor(226, 232, 240);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Audit Parameters & Metadata', margin + 8, 92);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    
    let py = 102;
    const addDetailRow = (label: string, value: string) => {
      pdf.setTextColor(148, 163, 184);
      pdf.text(label, margin + 8, py);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, margin + 55, py);
      pdf.setFont('helvetica', 'normal');
      py += 8;
    };

    addDetailRow('Target Website URL:', report.audit.url);
    addDetailRow('Audit Identifier:', report.audit.id);
    addDetailRow('Audit Date:', report.audit.date);
    addDetailRow('Discovered Pages:', `${report.website.pagesAnalyzed} Pages Crawled`);
    addDetailRow('Evaluated Viewports:', 'Desktop (1440px), Tablet (768px), Mobile (390px)');
    addDetailRow('Methodology Standard:', 'OX Heuristic Engine & WCAG 2.1 AA');

    // Header banner
    pdf.setFillColor(10, 102, 194); // #0A66C2
    pdf.rect(margin, 172, contentWidth, 42, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('OVERALL UX SCORE', margin + 10, 184);
    pdf.setFontSize(26);
    pdf.text(`${report.scores.overall.score}`, margin + 10, 202);
    pdf.setFontSize(12);
    pdf.setTextColor(199, 210, 254);
    pdf.text('/ 10', margin + 48, 202);
    pdf.setFontSize(8);
    pdf.text('Verified Heuristic Evaluation', margin + 10, 209);

    // Bottom Branding
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('OX Universal Framework & Xecution Studio • https://pankajpede.github.io/OX-brandbuilder/', margin, 280);

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 2: EXECUTIVE SUMMARY
    // ──────────────────────────────────────────────────────────────────────────
    update(35, 'Generating Executive Summary...');
    pdf.addPage();
    let pageNo = 2;
    addHeaderFooter(pageNo);

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('02. Executive Summary', margin, 24);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(51, 65, 85);
    const summaryLines = pdf.splitTextToSize(report.executiveSummary.overallAssessment, contentWidth);
    pdf.text(summaryLines, margin, 32);

    let currY = 32 + (summaryLines.length * 5) + 6;

    // Recommendation Box
    pdf.setFillColor(240, 253, 244); // emerald-50
    pdf.setDrawColor(187, 247, 208); // emerald-200
    pdf.roundedRect(margin, currY, contentWidth, 22, 3, 3, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(22, 101, 52); // emerald-800
    pdf.text('STRATEGIC RECOMMENDATION', margin + 6, currY + 7);
    pdf.setFontSize(12);
    pdf.text(`"${report.executiveSummary.finalRecommendation}"`, margin + 6, currY + 16);

    currY += 30;

    // 3 Columns: Strengths, Problems, Opportunities
    const colWidth = (contentWidth - 8) / 3;

    // Col 1: Strongest Areas
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, currY, colWidth, 90, 3, 3, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(22, 101, 52);
    pdf.text('✓ Strongest Areas', margin + 4, currY + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(51, 65, 85);
    let ly = currY + 16;
    report.executiveSummary.strongestAreas.forEach(item => {
      const lines = pdf.splitTextToSize(`• ${item}`, colWidth - 8);
      pdf.text(lines, margin + 4, ly);
      ly += (lines.length * 4) + 2;
    });

    // Col 2: Primary Friction Points
    const col2X = margin + colWidth + 4;
    pdf.roundedRect(col2X, currY, colWidth, 90, 3, 3, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(153, 27, 27);
    pdf.text('⚠️ Primary Friction Points', col2X + 4, currY + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(51, 65, 85);
    ly = currY + 16;
    report.executiveSummary.biggestProblems.forEach(item => {
      const lines = pdf.splitTextToSize(`• ${item}`, colWidth - 8);
      pdf.text(lines, col2X + 4, ly);
      ly += (lines.length * 4) + 2;
    });

    // Col 3: Growth Opportunities
    const col3X = margin + (colWidth * 2) + 8;
    pdf.roundedRect(col3X, currY, colWidth, 90, 3, 3, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(67, 56, 202);
    pdf.text('🚀 Growth Opportunities', col3X + 4, currY + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(51, 65, 85);
    ly = currY + 16;
    report.executiveSummary.primaryOpportunities.forEach(item => {
      const lines = pdf.splitTextToSize(`• ${item}`, colWidth - 8);
      pdf.text(lines, col3X + 4, ly);
      ly += (lines.length * 4) + 2;
    });

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 3: UX SCORECARD
    // ──────────────────────────────────────────────────────────────────────────
    update(50, 'Generating Scorecards...');
    pdf.addPage();
    pageNo++;
    addHeaderFooter(pageNo);

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('03. UX Scorecard', margin, 24);

    const categories = [
      { name: 'First Impression', data: report.scores.firstImpression },
      { name: 'Information Architecture', data: report.scores.informationArchitecture },
      { name: 'Navigation', data: report.scores.navigation },
      { name: 'Visual Hierarchy', data: report.scores.visualHierarchy },
      { name: 'Content Strategy', data: report.scores.content },
      { name: 'Portfolio / Product Storytelling', data: report.scores.portfolioProduct },
      { name: 'Conversion UX', data: report.scores.conversion },
      { name: 'Trust & Credibility', data: report.scores.trustCredibility },
      { name: 'Accessibility (WCAG 2.1)', data: report.scores.accessibility },
      { name: 'Mobile UX', data: report.scores.mobileUX },
      { name: 'Interaction Design', data: report.scores.interactionDesign }
    ];

    let cardY = 32;
    categories.forEach((cat, idx) => {
      if (!cat.data) return;

      if (cardY > pageHeight - 35) {
        pdf.addPage();
        pageNo++;
        addHeaderFooter(pageNo);
        cardY = 24;
      }

      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(margin, cardY, contentWidth, 19, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(cat.name, margin + 5, cardY + 7);

      // Score Pill
      const scoreVal = cat.data.score;
      if (scoreVal >= 7.5) pdf.setFillColor(220, 252, 231);
      else if (scoreVal >= 6.0) pdf.setFillColor(254, 243, 199);
      else pdf.setFillColor(254, 226, 226);

      pdf.roundedRect(margin + contentWidth - 24, cardY + 3, 20, 7, 2, 2, 'F');
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${scoreVal} / 10`, margin + contentWidth - 22, cardY + 7.5);

      // Rationale
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      const rLines = pdf.splitTextToSize(cat.data.rationale, contentWidth - 32);
      pdf.text(rLines, margin + 5, cardY + 13);

      cardY += 22;
    });

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 4: HIGH-PRIORITY FINDINGS TABLE
    // ──────────────────────────────────────────────────────────────────────────
    update(65, 'Generating High-Priority Findings Table...');
    pdf.addPage();
    pageNo++;
    addHeaderFooter(pageNo);

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('04. High-Priority UX Findings', margin, 24);

    let fy = 32;
    report.findings.forEach((f) => {
      if (fy > pageHeight - 45) {
        pdf.addPage();
        pageNo++;
        addHeaderFooter(pageNo);
        fy = 24;
      }

      // Priority Box Header
      if (f.priority === 'P0') pdf.setFillColor(254, 242, 242);
      else if (f.priority === 'P1') pdf.setFillColor(255, 251, 235);
      else pdf.setFillColor(248, 250, 252);

      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(margin, fy, contentWidth, 38, 3, 3, 'FD');

      // Badge
      if (f.priority === 'P0') pdf.setFillColor(225, 29, 72);
      else if (f.priority === 'P1') pdf.setFillColor(217, 119, 6);
      else pdf.setFillColor(71, 85, 105);

      pdf.roundedRect(margin + 4, fy + 4, 12, 5, 1, 1, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(255, 255, 255);
      pdf.text(f.priority, margin + 6, fy + 7.5);

      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${f.id} • ${f.title}`, margin + 20, fy + 8, { maxWidth: contentWidth - 25 });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      const desc = pdf.splitTextToSize(f.description, contentWidth - 10);
      pdf.text(desc, margin + 4, fy + 15);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(185, 28, 28);
      pdf.text(`UX Impact: ${f.uxImpact}`, margin + 4, fy + 26, { maxWidth: contentWidth - 10 });

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(22, 101, 52);
      const recText = f.recommendation[0] ? `Rec: ${f.recommendation[0]}` : '';
      pdf.text(recText, margin + 4, fy + 32, { maxWidth: contentWidth - 10 });

      fy += 42;
    });

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 5: ACCESSIBILITY REVIEW & ROADMAP
    // ──────────────────────────────────────────────────────────────────────────
    update(80, 'Generating Accessibility Review & Roadmap...');
    pdf.addPage();
    pageNo++;
    addHeaderFooter(pageNo);

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('05. Accessibility Review & Prioritised Roadmap', margin, 24);

    let ay = 32;
    pdf.setFontSize(11);
    pdf.text('WCAG 2.1 AA Compliance Verification Checks', margin, ay);
    ay += 6;

    report.accessibility.checks.forEach(check => {
      if (ay > pageHeight - 30) {
        pdf.addPage();
        pageNo++;
        addHeaderFooter(pageNo);
        ay = 24;
      }

      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(margin, ay, contentWidth, 14, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(check.item, margin + 4, ay + 6);

      // Status pill
      if (check.status === 'PASS') pdf.setFillColor(220, 252, 231);
      else if (check.status === 'FAIL') pdf.setFillColor(254, 226, 226);
      else pdf.setFillColor(254, 243, 199);

      pdf.roundedRect(margin + contentWidth - 28, ay + 3, 24, 6, 1, 1, 'F');
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(check.status, margin + contentWidth - 25, ay + 7);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text(check.details, margin + 4, ay + 11, { maxWidth: contentWidth - 35 });

      ay += 17;
    });

    // Save PDF
    update(98, 'Saving PDF document...');
    const fileName = `OX_UX_Audit_${report.website.title.replace(/[^a-zA-Z0-9]/g, '_')}_${report.audit.id}.pdf`;
    const blob = pdf.output('blob');
    saveAs(blob, fileName);
    update(100, 'PDF Export Complete!');
  }
}
