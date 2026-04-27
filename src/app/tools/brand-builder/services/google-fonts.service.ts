import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';

export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
  kind: string;
  lastModified: string;
}

export interface GoogleFontsResponse {
  kind: string;
  items: GoogleFont[];
}

@Injectable({
  providedIn: 'root'
})
export class GoogleFontsService {
  private http = inject(HttpClient);

  // ==========================================
  // ENTER YOUR GOOGLE FONTS API KEY HERE
  // ==========================================
  private readonly API_KEY = 'AIzaSyCHHQvxLtmg62KF65CStFPaNH71y0BTM94';
  private readonly BASE_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';

  private fontsSubject = new BehaviorSubject<GoogleFont[]>([]);
  public fonts$ = this.fontsSubject.asObservable();

  private loadedFonts = new Set<string>();

  constructor() {
    this.fetchFonts();
  }

  /**
   * Fetches the list of all Google Fonts
   */
  private fetchFonts(): void {
    // If we have a dummy key, we might want to return some fallbacks for local dev
    // but for now we try the API.
    if (!this.API_KEY || this.API_KEY.includes('YOUR_GOOGLE_FONTS')) {
      console.warn('Google Fonts API Key is not set. Using local fallbacks.');
      this.getFallbacks().subscribe(f => this.fontsSubject.next(f));
      return;
    }

    const url = `${this.BASE_URL}?key=${this.API_KEY}&sort=popularity`;
    this.http.get<GoogleFontsResponse>(url).pipe(
      map(res => res.items)
    ).subscribe({
      next: (fonts) => this.fontsSubject.next(fonts),
      error: (err) => {
        console.error('Failed to fetch Google Fonts', err);
        this.getFallbacks().subscribe(f => this.fontsSubject.next(f));
      }
    });
  }

  /**
   * Injects a font-face link into the head
   */
  public loadFont(family: string): void {
    if (!family || this.loadedFonts.has(family)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
    this.loadedFonts.add(family);
  }

  /**
   * Returns a small set of common fonts if API key is missing
   */
  private getFallbacks(): Observable<GoogleFont[]> {
    const fallbacks: GoogleFont[] = [
      { family: 'Inter', category: 'sans-serif', variants: [], subsets: [], kind: '', lastModified: '' },
      { family: 'Roboto', category: 'sans-serif', variants: [], subsets: [], kind: '', lastModified: '' },
      { family: 'Open Sans', category: 'sans-serif', variants: [], subsets: [], kind: '', lastModified: '' },
      { family: 'Montserrat', category: 'sans-serif', variants: [], subsets: [], kind: '', lastModified: '' },
      { family: 'Playfair Display', category: 'serif', variants: [], subsets: [], kind: '', lastModified: '' },
      { family: 'Merriweather', category: 'serif', variants: [], subsets: [], kind: '', lastModified: '' },
      { family: 'EB Garamond', category: 'serif', variants: [], subsets: [], kind: '', lastModified: '' },
      { family: 'Oswald', category: 'sans-serif', variants: [], subsets: [], kind: '', lastModified: '' },
      { family: 'Poppins', category: 'sans-serif', variants: [], subsets: [], kind: '', lastModified: '' },
      { family: 'Lora', category: 'serif', variants: [], subsets: [], kind: '', lastModified: '' },
    ];
    return of(fallbacks);
  }
}
