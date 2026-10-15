import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { BrandBuilderComponent } from './tools/brand-builder/brand-builder.component';
import { UxAuditHomeComponent } from './tools/ux-audit/components/ux-audit-home/ux-audit-home.component';
import { UxAuditProgressComponent } from './tools/ux-audit/components/ux-audit-progress/ux-audit-progress.component';
import { UxAuditReportComponent } from './tools/ux-audit/components/ux-audit-report/ux-audit-report.component';
import { UxAuditHistoryComponent } from './tools/ux-audit/components/ux-audit-history/ux-audit-history.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'brand-builder', component: BrandBuilderComponent },
  { path: 'ux-audit', component: UxAuditHomeComponent },
  { path: 'ux-audit/new', component: UxAuditHomeComponent },
  { path: 'ux-audit/progress/:id', component: UxAuditProgressComponent },
  { path: 'ux-audit/report/:id', component: UxAuditReportComponent },
  { path: 'ux-audit/history', component: UxAuditHistoryComponent },
  { path: '**', redirectTo: '' }
];

