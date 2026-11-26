import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Building2, LucideAngularModule, Plus, Search } from 'lucide-angular';
import { PlatformApiService, PlatformOrganization } from '../../core/services/platform-api.service';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div style="display:flex; flex-direction:column; gap:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:20px; font-weight:600; margin:0;">Organizations</h1>
          <p style="margin:4px 0 0; opacity:.7; font-size:13px;">
            Manage all customer workspaces on the platform
          </p>
        </div>

        <button type="button" class="btn btn-primary btn-sm" (click)="showCreate.set(!showCreate())">
          <lucide-icon [img]="PlusIcon" [size]="15" />
          <span>New Organization</span>
        </button>
      </div>

      @if (showCreate()) {
        <form class="card" style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;" (ngSubmit)="create()">
          <div style="flex:1; min-width:200px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Organization Name</label>
            <input class="text-input" name="newName" [(ngModel)]="newName" placeholder="Acme Corp" required />
          </div>
          <div style="flex:1; min-width:200px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Slug (optional)</label>
            <input class="text-input" name="newSlug" [(ngModel)]="newSlug" placeholder="acme-corp" />
          </div>
          <button type="submit" class="btn btn-primary btn-sm" [disabled]="saving()">
            {{ saving() ? 'Creating...' : 'Create' }}
          </button>
        </form>
      }

      @if (error()) {
        <div class="card" style="padding:12px; color:#ef4444;">{{ error() }}</div>
      }

      <div class="card" style="padding:16px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; max-width:340px;">
          <lucide-icon [img]="SearchIcon" [size]="15" />
          <input
            type="search"
            class="text-input"
            placeholder="Search organizations..."
            [ngModel]="query()"
            (ngModelChange)="query.set($event)"
          />
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="text-align:left; border-bottom:1px solid var(--border, #e5e7eb); opacity:.7;">
                <th style="padding:10px 8px;">Name</th>
                <th style="padding:10px 8px;">Slug</th>
                <th style="padding:10px 8px;">Members</th>
                <th style="padding:10px 8px;">WhatsApp Accounts</th>
                <th style="padding:10px 8px;">Created</th>
              </tr>
            </thead>
            <tbody>
              @for (org of filtered(); track org.id) {
                <tr style="border-bottom:1px solid var(--border, #e5e7eb);">
                  <td style="padding:10px 8px; font-weight:500;">
                    <span style="display:inline-flex; align-items:center; gap:6px;">
                      <lucide-icon [img]="BuildingIcon" [size]="14" />
                      {{ org.name }}
                    </span>
                  </td>
                  <td class="mono" style="padding:10px 8px; opacity:.75;">{{ org.slug }}</td>
                  <td class="mono" style="padding:10px 8px;">{{ org.user_count }}</td>
                  <td class="mono" style="padding:10px 8px;">{{ org.account_count }}</td>
                  <td style="padding:10px 8px; opacity:.7;">{{ org.created_at.slice(0, 10) }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" style="padding:20px; text-align:center; opacity:.65;">
                    No organizations found.
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
export class OrganizationsComponent implements OnInit {
  private readonly api = inject(PlatformApiService);

  readonly orgs = signal<PlatformOrganization[]>([]);
  readonly query = signal('');
  readonly showCreate = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  newName = '';
  newSlug = '';

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.orgs();
    return this.orgs().filter(
      (o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q)
    );
  });

  readonly BuildingIcon = Building2;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.listOrganizations().subscribe({
      next: (list) => this.orgs.set(list),
      error: (err) => this.error.set(err?.error?.message || 'Failed to load organizations')
    });
  }

  create(): void {
    if (!this.newName.trim()) return;
    this.saving.set(true);
    this.error.set(null);
    this.api.createOrganization(this.newName.trim(), this.newSlug.trim() || undefined).subscribe({
      next: (created) => {
        this.orgs.update((prev) => [created, ...prev]);
        this.newName = '';
        this.newSlug = '';
        this.showCreate.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to create organization');
        this.saving.set(false);
      }
    });
  }
}
