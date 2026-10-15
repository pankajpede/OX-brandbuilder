import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UxAuditService } from '../../services/ux-audit.service';
import { AiAnalysisService } from '../../services/ai-analysis.service';
import { UxAuditSession } from '../../models/ux-audit.model';

@Component({
  selector: 'app-ux-audit-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ux-audit-progress.component.html',
  styles: [`
    :host { display: block; height: 100%; width: 100%; overflow: hidden; }
  `]
})
export class UxAuditProgressComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auditService = inject(UxAuditService);
  private aiService = inject(AiAnalysisService);

  session: UxAuditSession | null = null;
  completedStages: string[] = [];
  logs: string[] = [];

  ngOnInit() {
    const auditId = this.route.snapshot.paramMap.get('id');
    if (!auditId) {
      this.router.navigate(['/ux-audit']);
      return;
    }

    const sess = this.auditService.getSessionById(auditId);
    if (!sess) {
      this.router.navigate(['/ux-audit']);
      return;
    }

    this.session = sess;
    if (sess.status === 'completed' && sess.report) {
      this.router.navigate(['/ux-audit/report', auditId]);
      return;
    }

    this.runAuditPipeline();
  }

  async runAuditPipeline() {
    if (!this.session) return;

    this.addLog(`Audit session initialized: ${this.session.auditId}`);
    this.addLog(`Target: ${this.session.url}`);

    try {
      this.auditService.updateSession(this.session.auditId, {
        status: 'crawling',
        progress: 10,
        stage: 'Initializing Audit Pipeline...'
      });

      const isFileSession = this.session.url.startsWith('Mockup:') || this.session.url.startsWith('PDF:');
      const fileType: 'image' | 'pdf' = this.session.url.startsWith('Mockup:') ? 'image' : 'pdf';

      const report = isFileSession
        ? await this.aiService.runFileAudit(
            new File([], this.session.domain),
            fileType,
            this.session.auditId,
            (progress, stage) => this.onProgressUpdate(progress, stage)
          )
        : await this.aiService.runFullAudit(
            this.session.url,
            this.session.auditId,
            (progress, stage) => this.onProgressUpdate(progress, stage)
          );

      this.completedStages.push('Audit JSON Assembly');

      this.auditService.updateSession(this.session.auditId, {
        status: 'completed',
        progress: 100,
        stage: 'Audit Completed',
        report
      });

      this.addLog('Audit pipeline completed successfully!');
      setTimeout(() => {
        this.router.navigate(['/ux-audit/report', this.session?.auditId]);
      }, 600);

    } catch (err: any) {
      this.addLog(`[ERROR] Audit pipeline failed: ${err?.message || 'Unknown error'}`);
      this.auditService.updateSession(this.session.auditId, {
        status: 'failed',
        error: err?.message || 'Audit execution failed'
      });
    }
  }

  onProgressUpdate(progress: number, stage: string) {
    if (this.session) {
      this.session.progress = progress;
      this.session.stage = stage;
      this.addLog(`[${progress}%] ${stage}`);

      if (progress >= 30 && !this.completedStages.includes('URL Validation')) {
        this.completedStages.push('URL Validation');
      }
      if (progress >= 55 && !this.completedStages.includes('Page Discovery')) {
        this.completedStages.push('Page Discovery');
      }
      if (progress >= 70 && !this.completedStages.includes('Evidence Collection')) {
        this.completedStages.push('Evidence Collection');
      }
      if (progress >= 85 && !this.completedStages.includes('Deterministic UX Checks')) {
        this.completedStages.push('Deterministic UX Checks');
      }
      if (progress >= 95 && !this.completedStages.includes('AI Heuristic Synthesis')) {
        this.completedStages.push('AI Heuristic Synthesis');
      }
    }
  }

  addLog(msg: string) {
    const time = new Date().toLocaleTimeString();
    this.logs.push(`[${time}] ${msg}`);
  }

  cancelAudit() {
    this.router.navigate(['/ux-audit']);
  }
}
