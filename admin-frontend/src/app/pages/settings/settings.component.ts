import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  styles: [
    `
      .settings-page {
        display: grid;
        gap: 20px;
        max-width: 760px;
      }

      .page-meta {
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 4px;
      }

      .page-title {
        margin: 0;
        font-size: 28px;
        font-weight: 500;
        letter-spacing: -0.02em;
      }

      .panel {
        padding: 22px;
        border-radius: var(--radius-xl);
        background: var(--bg-card);
        border: 1px solid var(--hairline);
        display: grid;
        gap: 16px;

        h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding-top: 14px;
        border-top: 1px solid var(--hairline);
      }

      .row-title {
        font-size: 14px;
        font-weight: 500;
      }

      .row-desc {
        font-size: 13px;
        color: var(--text-muted);
      }

      .palette-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .palette-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 36px;
        padding: 0 12px;
        border-radius: var(--radius-md);
        border: 1px solid var(--hairline-strong);
        background: var(--bg-raised);
        color: var(--text-secondary);
        font-size: 13px;
        cursor: pointer;

        &.active {
          border-color: var(--accent-1);
          color: var(--text-primary);
        }
      }

      .swatch {
        width: 14px;
        height: 14px;
        border-radius: 50%;
      }
    `
  ],
  template: `
    <div class="settings-page">
      <div class="animate-enter">
        <div class="page-meta mono">Workspace preferences</div>
        <h1 class="page-title">Settings</h1>
      </div>

      <section class="panel animate-enter stagger-1">
        <h2>Appearance & Multi-Color Gradients</h2>

        <div class="row">
          <div>
            <div class="row-title">Surface theme</div>
            <div class="row-desc">Switch between dark graphite and light studio surfaces</div>
          </div>
          <div style="display: flex; gap: 8px">
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="themeService.theme() === 'dark'"
              [class.btn-secondary]="themeService.theme() !== 'dark'"
              (click)="themeService.setTheme('dark')"
            >
              Dark
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="themeService.theme() === 'light'"
              [class.btn-secondary]="themeService.theme() !== 'light'"
              (click)="themeService.setTheme('light')"
            >
              Light
            </button>
          </div>
        </div>

        <div class="row">
          <div>
            <div class="row-title">Gradient accent palette</div>
            <div class="row-desc">Applies across charts, primary CTAs, and active indicators</div>
          </div>
          <div class="palette-grid">
            @for (opt of themeService.accentOptions; track opt.id) {
              <button
                type="button"
                class="palette-btn"
                [class.active]="themeService.accent() === opt.id"
                (click)="themeService.setAccent(opt.id)"
              >
                <span class="swatch" [style.background]="opt.swatch"></span>
                <span>{{ opt.label }}</span>
              </button>
            }
          </div>
        </div>
      </section>

      <section class="panel animate-enter stagger-2">
        <h2>Account Session</h2>
        <div class="row" style="border-top: 0; padding-top: 0">
          <div>
            <div class="row-title">{{ auth.user()?.name }}</div>
            <div class="row-desc">{{ auth.user()?.email }} · {{ auth.user()?.workspace }}</div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" (click)="auth.logout()">
            Sign out
          </button>
        </div>
      </section>
    </div>
  `
})
export class SettingsComponent {
  readonly themeService = inject(ThemeService);
  readonly auth = inject(AuthService);
}
