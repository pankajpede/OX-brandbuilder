import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  activeTool: string | null = null;

  ngOnInit() {
    // Sync activeTool with current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      if (url.includes('brand-builder')) {
        this.activeTool = 'Brand Builder';
      } else {
        this.activeTool = null;
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
