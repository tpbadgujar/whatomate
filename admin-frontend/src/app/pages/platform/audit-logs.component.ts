import { Component, OnInit, inject, signal } from '@angular/core';
import { LucideAngularModule, RefreshCw } from 'lucide-angular';
import { PlatformApiService, PlatformAuditLog } from '../../core/services/platform-api.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div style="display:flex; flex-direction:column; gap:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:20px; font-weight:600; margin:0;">Platform Audit Logs</h1>
          <p style="margin:4px 0 0; opacity:.7; font-size:13px;">
            Recent security and administrative events across all organizations
          </p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" (click)="load()">
          <lucide-icon [img]="RefreshIcon" [size]="15" />
          <span>Refresh</span>
        </button>
      </div>

      @if (error()) {
        <div class="card" style="padding:12px; color:#ef4444;">{{ error() }}</div>
      }

      <div class="card" style="padding:16px; overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="text-align:left; border-bottom:1px solid var(--border, #e5e7eb); opacity:.7;">
              <th style="padding:10px 8px;">Time</th>
              <th style="padding:10px 8px;">Action</th>
              <th style="padding:10px 8px;">Resource</th>
              <th style="padding:10px 8px;">Organization ID</th>
              <th style="padding:10px 8px;">IP</th>
            </tr>
          </thead>
          <tbody>
            @for (log of logs(); track log.id) {
              <tr style="border-bottom:1px solid var(--border, #e5e7eb);">
                <td class="mono" style="padding:10px 8px; opacity:.75;">{{ log.created_at }}</td>
                <td style="padding:10px 8px; font-weight:500;">{{ log.action }}</td>
                <td class="mono" style="padding:10px 8px;">{{ log.resource }}</td>
                <td class="mono" style="padding:10px 8px; opacity:.7;">{{ log.organization_id }}</td>
                <td class="mono" style="padding:10px 8px; opacity:.7;">{{ log.ip_address || '—' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" style="padding:20px; text-align:center; opacity:.65;">
                  No audit logs recorded yet.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AuditLogsComponent implements OnInit {
  private readonly api = inject(PlatformApiService);
  readonly logs = signal<PlatformAuditLog[]>([]);
  readonly error = signal<string | null>(null);
  readonly RefreshIcon = RefreshCw;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.listAuditLogs(50).subscribe({
      next: (list) => this.logs.set(list),
      error: (err) => this.error.set(err?.error?.message || 'Failed to load audit logs')
    });
  }
}
