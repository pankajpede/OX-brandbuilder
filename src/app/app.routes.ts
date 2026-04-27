import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { BrandBuilderComponent } from './tools/brand-builder/brand-builder.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'brand-builder', component: BrandBuilderComponent },
  { path: '**', redirectTo: '' }
];
