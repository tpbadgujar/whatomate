import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, ShieldCheck } from 'lucide-angular';
import { PlatformApiService, PlatformUser } from '../../core/services/platform-api.service';

@Component({
  selector: 'app-platform-users',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div style="display:flex; flex-direction:column; gap:18px;">
      <div>
        <h1 style="font-size:20px; font-weight:600; margin:0;">Users & Super Admins</h1>
        <p style="margin:4px 0 0; opacity:.7; font-size:13px;">
          Manage global Super Admin privileges and account activation across all organizations
        </p>
      </div>

      @if (error()) {
        <div class="card" style="padding:12px; color:#ef4444;">{{ error() }}</div>
      }

      <div class="card" style="padding:16px;">
        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:8px; flex:1; max-width:340px;">
            <lucide-icon [img]="SearchIcon" [size]="15" />
            <input
              type="search"
              class="text-input"
              placeholder="Search name, email, or org..."
              [ngModel]="query()"
              (ngModelChange)="query.set($event)"
            />
          </div>
          <label style="display:inline-flex; align-items:center; gap:6px; font-size:13px; cursor:pointer;">
            <input type="checkbox" [ngModel]="onlySuperAdmins()" (ngModelChange)="onlySuperAdmins.set($event)" />
            <span>Super Admins only</span>
          </label>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="text-align:left; border-bottom:1px solid var(--border, #e5e7eb); opacity:.7;">
                <th style="padding:10px 8px;">User</th>
                <th style="padding:10px 8px;">Home Organization</th>
                <th style="padding:10px 8px;">Status</th>
                <th style="padding:10px 8px;">Super Admin</th>
                <th style="padding:10px 8px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of filtered(); track u.id) {
                <tr style="border-bottom:1px solid var(--border, #e5e7eb);">
                  <td style="padding:10px 8px;">
                    <div style="font-weight:500;">{{ u.full_name || '—' }}</div>
                    <div style="font-size:12px; opacity:.7;">{{ u.email }}</div>
                  </td>
                  <td style="padding:10px 8px;">{{ u.organization_name || u.organization_id }}</td>
                  <td style="padding:10px 8px;">
                    <span
                      style="padding:2px 8px; border-radius:999px; font-size:11px;"
                      [style.background]="u.is_active ? '#16a34a22' : '#ef444422'"
                      [style.color]="u.is_active ? '#16a34a' : '#ef4444'"
                    >
                      {{ u.is_active ? 'Active' : 'Disabled' }}
                    </span>
                  </td>
                  <td style="padding:10px 8px;">
                    @if (u.is_super_admin) {
                      <span style="display:inline-flex; align-items:center; gap:4px; color:#2563eb; font-weight:500;">
                        <lucide-icon [img]="ShieldIcon" [size]="14" />
                        Super Admin
                      </span>
                    } @else {
                      <span style="opacity:.6;">Tenant User</span>
                    }
                  </td>
                  <td style="padding:10px 8px; display:flex; gap:8px;">
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      (click)="toggleSuperAdmin(u)"
                    >
                      {{ u.is_super_admin ? 'Revoke Super Admin' : 'Make Super Admin' }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm"
                      (click)="toggleActive(u)"
                    >
                      {{ u.is_active ? 'Disable' : 'Enable' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" style="padding:20px; text-align:center; opacity:.65;">
                    No users found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PlatformUsersComponent implements OnInit {
  private readonly api = inject(PlatformApiService);

  readonly users = signal<PlatformUser[]>([]);
  readonly query = signal('');
  readonly onlySuperAdmins = signal(false);
  readonly error = signal<string | null>(null);

  readonly SearchIcon = Search;
  readonly ShieldIcon = ShieldCheck;

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.users().filter((u) => {
      if (this.onlySuperAdmins() && !u.is_super_admin) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.organization_name || '').toLowerCase().includes(q)
      );
    });
  });

  ngOnInit(): void {
    this.api.listUsers().subscribe({
      next: (list) => this.users.set(list),
      error: (err) => this.error.set(err?.error?.message || 'Failed to load users')
    });
  }

  toggleSuperAdmin(u: PlatformUser): void {
    this.error.set(null);
    this.api.updateUser(u.id, { is_super_admin: !u.is_super_admin }).subscribe({
      next: (updated) => {
        this.users.update((list) =>
          list.map((item) => (item.id === u.id ? { ...item, is_super_admin: updated.is_super_admin } : item))
        );
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to update super admin status')
    });
  }

  toggleActive(u: PlatformUser): void {
    this.error.set(null);
    this.api.updateUser(u.id, { is_active: !u.is_active }).subscribe({
      next: (updated) => {
        this.users.update((list) =>
          list.map((item) => (item.id === u.id ? { ...item, is_active: updated.is_active } : item))
        );
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to update user status')
    });
  }
}
