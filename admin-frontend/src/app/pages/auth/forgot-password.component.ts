import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Layers,
  LucideAngularModule,
  Mail,
  Moon,
  Sun
} from 'lucide-angular';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-forgot-password',
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

        <div class="auth-form-container animate-enter">
          <a
            routerLink="/login"
            class="btn btn-ghost btn-sm"
            style="margin: 0 0 20px -10px"
          >
            <lucide-icon [img]="ArrowLeftIcon" [size]="15" [strokeWidth]="1.5" />
            <span>Back to sign in</span>
          </a>

          @if (!sent()) {
            <div class="auth-header">
              <h1>Reset your password</h1>
              <p>Enter the email tied to your Meridian account and we will send a recovery link</p>
            </div>

            @if (errorMessage()) {
              <div class="error-banner animate-menu">{{ errorMessage() }}</div>
            }

            <form (ngSubmit)="submit()">
              <div class="field-group">
                <div class="field-label-row">
                  <label class="field-label" for="resetEmail">Work email</label>
                </div>
                <div class="input-wrap">
                  <span class="input-icon">
                    <lucide-icon [img]="MailIcon" [size]="16" [strokeWidth]="1.5" />
                  </span>
                  <input
                    id="resetEmail"
                    name="resetEmail"
                    type="email"
                    class="text-input"
                    placeholder="elena.vance@meridian.io"
                    [(ngModel)]="email"
                    autocomplete="email"
                    required
                  />
                </div>
              </div>

              <button type="submit" class="btn btn-accent btn-lg" style="width: 100%; margin-top: 8px">
                <span>Send recovery link</span>
                <lucide-icon [img]="ArrowRightIcon" [size]="16" [strokeWidth]="1.75" />
              </button>
            </form>
          } @else {
            <div class="success-card animate-enter">
              <div class="success-icon">
                <lucide-icon [img]="CheckCircleIcon" [size]="20" [strokeWidth]="1.75" />
              </div>
              <h2>Recovery link sent</h2>
              <p>
                Check <strong style="color: var(--text-primary)">{{ email }}</strong> for a one-time
                sign-in link. It expires in 15 minutes.
              </p>
            </div>

            <div style="display: grid; gap: 10px">
              <button type="button" class="btn btn-secondary btn-lg" (click)="sent.set(false)">
                Try another email
              </button>
              <a routerLink="/login" class="btn btn-primary btn-lg">Return to sign in</a>
            </div>
          }
        </div>

        <div class="auth-footer">
          <span>Meridian Account Recovery</span>
          <span class="mono">Single-use token</span>
        </div>
      </section>

      <aside class="auth-visual-pane">
        <div class="drafting-grid"></div>
        <div class="preview-card animate-enter stagger-2">
          <div class="preview-header">
            <div>
              <div class="preview-title">Account Protection</div>
              <div class="preview-figure" style="font-size: 24px">Zero-trust session recovery</div>
            </div>
            <div class="brand-glyph" style="width: 36px; height: 36px">
              <lucide-icon [img]="KeyRoundIcon" [size]="18" [strokeWidth]="1.75" />
            </div>
          </div>

          <p style="margin: 0 0 20px; color: var(--text-secondary); font-size: 13.5px; line-height: 1.6">
            Recovery links are bound to your browser fingerprint and expire automatically after first use
            or 15 minutes, keeping customer pipeline records protected.
          </p>

          <div class="preview-bars">
            <div class="preview-bar-row">
              <span style="color: var(--text-secondary)">Token TTL</span>
              <div class="preview-bar-track">
                <div class="preview-bar-fill" style="width: 100%; background: var(--accent-gradient)"></div>
              </div>
              <span class="mono" style="text-align: right">15 min</span>
            </div>
            <div class="preview-bar-row">
              <span style="color: var(--text-secondary)">Audit log</span>
              <div class="preview-bar-track">
                <div class="preview-bar-fill" style="width: 100%; background: linear-gradient(90deg, #10b981, #14b8a6)"></div>
              </div>
              <span class="mono" style="text-align: right">Enabled</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `
})
export class ForgotPasswordComponent {
  readonly themeService = inject(ThemeService);

  readonly sent = signal(false);
  readonly errorMessage = signal('');
  email = 'elena.vance@meridian.io';

  readonly LayersIcon = Layers;
  readonly MailIcon = Mail;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckCircleIcon = CheckCircle2;
  readonly KeyRoundIcon = KeyRound;
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;

  submit(): void {
    const trimmed = this.email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      this.errorMessage.set('Enter a valid work email address');
      return;
    }
    this.errorMessage.set('');
    this.sent.set(true);
  }
}
