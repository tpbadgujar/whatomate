import { Injectable, effect, signal } from '@angular/core';
import { AccentPalette, ThemeMode } from '../models/crm.models';

export interface AccentOption {
  id: AccentPalette;
  label: string;
  swatch: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeMode>(this.loadTheme());
  readonly accent = signal<AccentPalette>(this.loadAccent());

  readonly accentOptions: AccentOption[] = [
    { id: 'ember', label: 'Ember', swatch: 'linear-gradient(135deg, #f97316, #f59e0b)' },
    { id: 'cobalt', label: 'Cobalt', swatch: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
    { id: 'emerald', label: 'Emerald', swatch: 'linear-gradient(135deg, #10b981, #14b8a6)' },
    { id: 'rose', label: 'Rose', swatch: 'linear-gradient(135deg, #f43f5e, #f59e0b)' }
  ];

  constructor() {
    effect(() => {
      const mode = this.theme();
      const palette = this.accent();
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.setAttribute('data-accent', palette);
      localStorage.setItem('meridian.theme', mode);
      localStorage.setItem('meridian.accent', palette);
    });
  }

  toggleTheme(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
  }

  setAccent(palette: AccentPalette): void {
    this.accent.set(palette);
  }

  private loadTheme(): ThemeMode {
    const saved = localStorage.getItem('meridian.theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  }

  private loadAccent(): AccentPalette {
    const saved = localStorage.getItem('meridian.accent');
    if (saved === 'ember' || saved === 'cobalt' || saved === 'emerald' || saved === 'rose') {
      return saved;
    }
    return 'ember';
  }
}
