import { Component, OnInit, inject, signal } from '@angular/core';
import {
  Building2,
  LucideAngularModule,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Users
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { PlatformApiService, PlatformOverview } from '../../core/services/platform-api.service';

@Component({
  selector: 'app-platform-overview',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:20px; font-weight:600; margin:0;">Platform Overview</h1>
          <p style="margin:4px 0 0; opacity:.7; font-size:13px;">
            Global control plane metrics & Redis feature toggle
          </p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" (click)="load()" [disabled]="loading()">
          <lucide-icon [img]="RefreshIcon" [size]="15" />
          <span>Refresh</span>
        </button>
      </div>

      @if (error()) {
        <div class="card" style="padding:14px; border-color:var(--danger, #ef4444); color:var(--danger, #ef4444);">
          {{ error() }}
        </div>
      }

      <!-- Redis Feature Flag Card -->
      <div class="card" style="padding:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="display:flex; align-items:flex-start; gap:12px;">
          <lucide-icon [img]="ShieldIcon" [size]="22" />
          <div>
            <div style="font-weight:600; font-size:15px;">
              Segregated Super Admin Mode
              <span
                class="badge"
                [style.background]="segregated() ? '#16a34a22' : '#eab30822'"
                [style.color]="segregated() ? '#16a34a' : '#ca8a04'"
                style="margin-left:8px; padding:2px 8px; border-radius:999px; font-size:11px;"
              >
                {{ segregated() ? 'ENABLED (New Mode)' : 'DISABLED (Legacy Mode)' }}
              </span>
            </div>
            <div style="font-size:13px; opacity:.75; margin-top:4px;">
              Redis key: <code>whatomate:feature:segregated_superadmin</code>. When enabled, cross-org Super Admin
              switching is disabled in the Vue tenant panel and managed exclusively here.
            </div>
          </div>
        </div>

        <button
          type="button"
          class="btn"
          [class.btn-primary]="!segregated()"
          [class.btn-secondary]="segregated()"
          (click)="toggleSegregated()"
          [disabled]="toggling()"
        >
          <lucide-icon [img]="segregated() ? ToggleRightIcon : ToggleLeftIcon" [size]="18" />
          <span>{{ segregated() ? 'Switch to Legacy Mode' : 'Enable Segregated Mode' }}</span>
        </button>
      </div>

      <!-- KPI Grid -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
        <div class="card" style="padding:16px;">
          <div style="display:flex; justify-content:space-between; opacity:.7; font-size:12px;">
            <span>Organizations</span>
            <lucide-icon [img]="BuildingIcon" [size]="16" />
          </div>
          <div class="mono" style="font-size:26px; font-weight:600; margin-top:8px;">
            {{ overview()?.total_organizations ?? '—' }}
          </div>
        </div>

        <div class="card" style="padding:16px;">
          <div style="display:flex; justify-content:space-between; opacity:.7; font-size:12px;">
            <span>Total Users</span>
            <lucide-icon [img]="UsersIcon" [size]="16" />
          </div>
          <div class="mono" style="font-size:26px; font-weight:600; margin-top:8px;">
            {{ overview()?.total_users ?? '—' }}
          </div>
          <div style="font-size:12px; opacity:.65; margin-top:4px;">
            Active: {{ overview()?.active_users ?? '—' }}
          </div>
        </div>

        <div class="card" style="padding:16px;">
          <div style="display:flex; justify-content:space-between; opacity:.7; font-size:12px;">
            <span>Super Admins</span>
            <lucide-icon [img]="ShieldIcon" [size]="16" />
          </div>
          <div class="mono" style="font-size:26px; font-weight:600; margin-top:8px;">
            {{ overview()?.super_admins ?? '—' }}
          </div>
        </div>

        <div class="card" style="padding:16px;">
          <div style="display:flex; justify-content:space-between; opacity:.7; font-size:12px;">
            <span>WhatsApp Accounts</span>
            <lucide-icon [img]="MessageIcon" [size]="16" />
          </div>
          <div class="mono" style="font-size:26px; font-weight:600; margin-top:8px;">
            {{ overview()?.total_accounts ?? '—' }}
          </div>
          <div style="font-size:12px; opacity:.65; margin-top:4px;">
            Contacts: {{ overview()?.total_contacts ?? '—' }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class PlatformOverviewComponent implements OnInit {
  private readonly api = inject(PlatformApiService);
  private readonly auth = inject(AuthService);

  readonly overview = signal<PlatformOverview | null>(null);
  readonly segregated = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly toggling = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly RefreshIcon = RefreshCw;
  readonly ShieldIcon = ShieldCheck;
  readonly BuildingIcon = Building2;
  readonly UsersIcon = Users;
  readonly MessageIcon = MessageSquare;
  readonly ToggleLeftIcon = ToggleLeft;
  readonly ToggleRightIcon = ToggleRight;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getOverview().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.segregated.set(!!data.segregated_superadmin);
        this.auth.segregatedSuperAdmin.set(!!data.segregated_superadmin);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load platform overview');
        this.loading.set(false);
      }
    });
  }

  toggleSegregated(): void {
    const next = !this.segregated();
    this.toggling.set(true);
    this.api.setSegregatedSuperAdmin(next).subscribe({
      next: (res) => {
        this.segregated.set(res.segregated_superadmin);
        this.auth.segregatedSuperAdmin.set(res.segregated_superadmin);
        this.toggling.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to update Redis feature flag');
        this.toggling.set(false);
      }
    });
  }
}
