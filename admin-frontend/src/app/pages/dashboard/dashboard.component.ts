import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Download,
  LucideAngularModule,
  Plus
} from 'lucide-angular';
import { TimeframeKey } from '../../core/models/crm.models';
import { CrmService } from '../../core/services/crm.service';
import { RevenueChartComponent } from '../../shared/components/revenue-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, RevenueChartComponent],
  styleUrl: './dashboard.component.scss',
  template: `
    <div class="dashboard-page">
      <!-- Page Header -->
      <div class="page-head animate-enter">
        <div>
          <div class="page-meta mono">November 2026 · Live pipeline</div>
          <h1 class="page-title">Revenue Overview</h1>
        </div>

        <div class="head-actions">
          <div class="segmented" role="group" aria-label="Timeframe">
            @for (tf of timeframes; track tf) {
              <button
                type="button"
                class="seg-btn mono"
                [class.active]="crm.timeframe() === tf"
                (click)="crm.timeframe.set(tf)"
              >
                {{ tf }}
              </button>
            }
          </div>

          <button type="button" class="btn btn-secondary btn-sm" (click)="exportSnapshot()">
            <lucide-icon [img]="DownloadIcon" [size]="15" [strokeWidth]="1.5" />
            <span>Export</span>
          </button>

          <button type="button" class="btn btn-primary btn-sm" (click)="crm.openQuickAction('deal')">
            <lucide-icon [img]="PlusIcon" [size]="15" [strokeWidth]="1.75" />
            <span>New deal</span>
          </button>
        </div>
      </div>

      <!-- 4 Compact KPI Stat Cards (Numbers only, equal height) -->
      <section class="kpi-grid">
        @for (kpi of crm.kpis(); track kpi.id; let i = $index) {
          <article class="kpi-card animate-enter" [class]="'stagger-' + (i + 1)">
            <div class="kpi-label">{{ kpi.label }}</div>
            <div class="kpi-value tabular-nums">{{ kpi.value }}</div>
            <div class="kpi-foot">
              <span class="kpi-delta mono" [class.negative]="kpi.trend === 'down'">
                {{ kpi.delta }}
              </span>
              <span class="kpi-comp">{{ kpi.comparison }}</span>
            </div>
          </article>
        }
      </section>

      <!-- Main Analytics Moment (2/3) + Pipeline Stage Breakdown (1/3) -->
      <section class="analytics-grid animate-enter stagger-3">
        <article class="panel chart-panel">
          <div class="panel-head">
            <div>
              <h2>Revenue & Pipeline Velocity</h2>
              <p class="panel-sub">Closed revenue against active pipeline and monthly target</p>
            </div>

            <div class="legend">
              <span class="legend-item">
                <span class="legend-swatch" style="background: var(--accent-gradient)"></span>
                Revenue
              </span>
              <span class="legend-item">
                <span class="legend-swatch" style="background: var(--text-secondary)"></span>
                Pipeline
              </span>
              <span class="legend-item">
                <span class="legend-swatch dashed"></span>
                Target
              </span>
            </div>
          </div>

          <app-revenue-chart [data]="crm.analyticsSeries()" />
        </article>

        <article class="panel stages-panel">
          <div class="panel-head">
            <div>
              <h2>Pipeline by Stage</h2>
              <p class="panel-sub">Weighted distribution across active deals</p>
            </div>
            <a routerLink="/analytics" class="btn btn-ghost btn-sm">
              <span>Details</span>
              <lucide-icon [img]="ArrowUpRightIcon" [size]="14" [strokeWidth]="1.5" />
            </a>
          </div>

          <div class="stages-list">
            @for (item of crm.pipelineStages(); track item.stage) {
              <div class="stage-row">
                <div class="stage-top">
                  <span class="stage-name">{{ item.stage }}</span>
                  <span class="stage-val mono">
                    {{ crm.formatCurrency(item.value) }}
                    <span class="stage-count">({{ item.count }})</span>
                  </span>
                </div>
                <div class="stage-track">
                  <div
                    class="stage-fill"
                    [style.width.%]="item.sharePercent"
                    [style.background]="item.gradient"
                  ></div>
                </div>
              </div>
            }
          </div>
        </article>
      </section>

      <!-- Active Deals Table + Activity Feed -->
      <section class="bottom-grid animate-enter stagger-4">
        <article class="panel">
          <div class="panel-head">
            <div>
              <h2>Active Deals</h2>
              <p class="panel-sub">Click advance to move a deal to the next stage</p>
            </div>
            <a routerLink="/deals" class="btn btn-ghost btn-sm">
              <span>All deals</span>
              <lucide-icon [img]="ArrowRightIcon" [size]="14" [strokeWidth]="1.5" />
            </a>
          </div>

          <div class="table-wrap">
            <table class="crm-table">
              <thead>
                <tr>
                  <th>Deal & Account</th>
                  <th>Stage</th>
                  <th class="num">Value</th>
                  <th class="num">Prob</th>
                  <th class="num">Close</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (deal of crm.filteredDeals().slice(0, 5); track deal.id) {
                  <tr>
                    <td>
                      <div class="deal-title">{{ deal.title }}</div>
                      <div class="deal-company">{{ deal.company }} · {{ deal.owner }}</div>
                    </td>
                    <td>
                      <span class="stage-badge" [attr.data-stage]="deal.stage">
                        <span class="badge-dot"></span>
                        {{ deal.stage }}
                      </span>
                    </td>
                    <td class="num mono">{{ crm.formatCurrency(deal.value) }}</td>
                    <td class="num mono">{{ deal.probability }}%</td>
                    <td class="num mono" style="color: var(--text-muted)">{{ deal.closeDate }}</td>
                    <td class="num">
                      @if (deal.stage !== 'Closed Won') {
                        <button
                          type="button"
                          class="btn btn-secondary btn-sm"
                          (click)="crm.advanceDealStage(deal.id)"
                        >
                          <span>Advance</span>
                          <lucide-icon [img]="ChevronRightIcon" [size]="13" [strokeWidth]="1.5" />
                        </button>
                      } @else {
                        <span class="won-label mono">Closed</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <div>
              <h2>Recent Activity</h2>
              <p class="panel-sub">Latest touchpoints across accounts</p>
            </div>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              (click)="crm.openQuickAction('activity')"
            >
              <lucide-icon [img]="CalendarIcon" [size]="14" [strokeWidth]="1.5" />
              <span>Log</span>
            </button>
          </div>

          <div class="activity-list">
            @for (item of crm.activities().slice(0, 5); track item.id) {
              <div class="activity-row">
                <span class="activity-dot" [attr.data-type]="item.type"></span>
                <div class="activity-body">
                  <div class="activity-title">{{ item.title }}</div>
                  <div class="activity-detail">{{ item.detail }}</div>
                  <div class="activity-meta mono">{{ item.actor }} · {{ item.time }}</div>
                </div>
              </div>
            }
          </div>
        </article>
      </section>
    </div>
  `
})
export class DashboardComponent {
  readonly crm = inject(CrmService);

  readonly timeframes: TimeframeKey[] = ['7d', '30d', '90d', '12m'];

  readonly PlusIcon = Plus;
  readonly DownloadIcon = Download;
  readonly ArrowUpRightIcon = ArrowUpRight;
  readonly ArrowRightIcon = ArrowRight;
  readonly ChevronRightIcon = ChevronRight;
  readonly CalendarIcon = Calendar;

  exportSnapshot(): void {
    const rows = [
      ['ID', 'Title', 'Company', 'Stage', 'Value', 'Probability'],
      ...this.crm.deals().map((d) => [d.id, d.title, d.company, d.stage, String(d.value), `${d.probability}%`])
    ];
    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meridian-pipeline.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
