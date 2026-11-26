import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Layers,
  Lock,
  LucideAngularModule,
  Mail,
  Moon,
  Sun,
  User
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  styleUrl: './auth.styles.scss',
  template: `
    <div class="auth-shell">
      <section class="auth-form-pane">
        <div class="auth-topbar">
          <a routerLink="/login" class="brand-mark">
            <span class="brand-glyph">
              <lucide-icon [img]="LayersIcon" [size]="16" [strokeWidth]="1.75" />
            </span>
            <span>Meridian</span>
          </a>

          <div class="accent-switcher">
            @for (opt of themeService.accentOptions; track opt.id) {
              <button
                type="button"
                class="accent-dot"
                [class.active]="themeService.accent() === opt.id"
                [style.background]="opt.swatch"
                [attr.aria-label]="'Use ' + opt.label + ' accent'"
                (click)="themeService.setAccent(opt.id)"
              ></button>
            }
            <button
              type="button"
              class="btn btn-ghost btn-icon btn-sm"
              aria-label="Toggle color theme"
              (click)="themeService.toggleTheme()"
            >
              <lucide-icon
                [img]="themeService.theme() === 'dark' ? SunIcon : MoonIcon"
                [size]="16"
                [strokeWidth]="1.5"
              />
            </button>
          </div>
        </div>

        <div class="auth-form-container animate-enter">
          <div class="auth-header">
            <h1>Whatomate Super Admin</h1>
            <p>Sign in to the segregated platform control plane</p>
          </div>

          @if (errorMessage()) {
            <div class="error-banner animate-menu">{{ errorMessage() }}</div>
          }

          <form (ngSubmit)="submit()">
            @if (mode() === 'register') {
              <div class="field-group">
                <div class="field-label-row">
                  <label class="field-label" for="fullName">Full name</label>
                </div>
                <div class="input-wrap">
                  <span class="input-icon">
                    <lucide-icon [img]="UserIcon" [size]="16" [strokeWidth]="1.5" />
                  </span>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    class="text-input"
                    placeholder="Elena Vance"
                    [(ngModel)]="fullName"
                    autocomplete="name"
                  />
                </div>
              </div>
            }

            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label" for="email">Work email</label>
              </div>
              <div class="input-wrap">
                <span class="input-icon">
                  <lucide-icon [img]="MailIcon" [size]="16" [strokeWidth]="1.5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  class="text-input"
                  placeholder="elena.vance@meridian.io"
                  [(ngModel)]="email"
                  autocomplete="email"
                  required
                />
              </div>
            </div>

            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label" for="password">Password</label>
                @if (mode() === 'signin') {
                  <a routerLink="/forgot-password" class="field-link">Forgot password</a>
                }
              </div>
              <div class="input-wrap">
                <span class="input-icon">
                  <lucide-icon [img]="LockIcon" [size]="16" [strokeWidth]="1.5" />
                </span>
                <input
                  id="password"
                  name="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="text-input"
                  placeholder="Enter your password"
                  [(ngModel)]="password"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="input-action"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                  (click)="showPassword.set(!showPassword())"
                >
                  <lucide-icon
                    [img]="showPassword() ? EyeOffIcon : EyeIcon"
                    [size]="16"
                    [strokeWidth]="1.5"
                  />
                </button>
              </div>
            </div>

            <label class="checkbox-row">
              <input type="checkbox" name="remember" [(ngModel)]="remember" />
              <span>Keep me signed in for 30 days</span>
            </label>

            <button type="submit" class="btn btn-accent btn-lg" style="width: 100%" [disabled]="submitting()">
              <span>{{ submitting() ? 'Signing in...' : 'Sign in to Super Admin' }}</span>
              <lucide-icon [img]="ArrowRightIcon" [size]="16" [strokeWidth]="1.75" />
            </button>
          </form>
        </div>

        <div class="auth-footer">
          <span>Whatomate Control Plane</span>
          <span class="mono">Platform Admin · Segregated</span>
        </div>
      </section>

      <aside class="auth-visual-pane">
        <div class="drafting-grid"></div>
        <div class="preview-card animate-enter stagger-2">
          <div class="preview-header">
            <div>
              <div class="preview-title">Q4 Revenue Velocity</div>
              <div class="preview-figure tabular-nums">$896,000</div>
            </div>
            <div class="preview-delta tabular-nums">+14.2% vs Q3</div>
          </div>

          <svg class="preview-chart" viewBox="0 0 460 160" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="authAreaGrad" x1="0" y1="0" x2="460" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="var(--accent-1)" stop-opacity="0.34" />
                <stop offset="60%" stop-color="var(--accent-2)" stop-opacity="0.12" />
                <stop offset="100%" stop-color="var(--accent-1)" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="authStrokeGrad" x1="0" y1="0" x2="460" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="var(--accent-1)" />
                <stop offset="55%" stop-color="var(--accent-2)" />
                <stop offset="100%" stop-color="var(--accent-3)" />
              </linearGradient>
            </defs>

            <line x1="0" y1="36" x2="460" y2="36" stroke="var(--hairline)" stroke-dasharray="3 3" />
            <line x1="0" y1="84" x2="460" y2="84" stroke="var(--hairline)" stroke-dasharray="3 3" />
            <line x1="0" y1="132" x2="460" y2="132" stroke="var(--hairline)" />

            <path
              d="M 0 128 C 60 116, 100 102, 150 96 C 200 90, 235 64, 290 58 C 345 52, 395 26, 460 18 L 460 132 L 0 132 Z"
              fill="url(#authAreaGrad)"
            />
            <path
              d="M 0 128 C 60 116, 100 102, 150 96 C 200 90, 235 64, 290 58 C 345 52, 395 26, 460 18"
              stroke="url(#authStrokeGrad)"
              stroke-width="2.5"
              stroke-linecap="round"
            />
            <circle cx="460" cy="18" r="4.5" fill="var(--accent-2)" />
          </svg>

          <div class="preview-bars">
            <div class="preview-bar-row">
              <span style="color: var(--text-secondary)">Negotiation</span>
              <div class="preview-bar-track">
                <div class="preview-bar-fill" style="width: 82%; background: linear-gradient(90deg, #f97316, #ef4444)"></div>
              </div>
              <span class="mono" style="text-align: right">$260,000</span>
            </div>
            <div class="preview-bar-row">
              <span style="color: var(--text-secondary)">Proposal</span>
              <div class="preview-bar-track">
                <div class="preview-bar-fill" style="width: 64%; background: linear-gradient(90deg, #f59e0b, #f97316)"></div>
              </div>
              <span class="mono" style="text-align: right">$94,500</span>
            </div>
            <div class="preview-bar-row">
              <span style="color: var(--text-secondary)">Closed Won</span>
              <div class="preview-bar-track">
                <div class="preview-bar-fill" style="width: 92%; background: linear-gradient(90deg, #10b981, #14b8a6)"></div>
              </div>
              <span class="mono" style="text-align: right">$215,000</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `
})
export class LoginComponent {
  readonly auth = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly mode = signal<'signin' | 'register'>('signin');
  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  fullName = '';
  email = '';
  password = '';
  remember = true;

  readonly LayersIcon = Layers;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserIcon = User;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly ArrowRightIcon = ArrowRight;
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;

  switchMode(next: 'signin' | 'register'): void {
    this.mode.set(next);
    this.errorMessage.set('');
  }

  async submit(): Promise<void> {
    this.errorMessage.set('');
    if (!this.password || this.password.length < 4) {
      this.errorMessage.set('Password must be at least 4 characters');
      return;
    }

    this.submitting.set(true);
    const res = await this.auth.loginWithCredentials(this.email, this.password);
    this.submitting.set(false);
    if (!res.ok) {
      this.errorMessage.set(res.error || 'Unable to sign in');
      return;
    }

    void this.router.navigate(['/dashboard']);
  }
}
