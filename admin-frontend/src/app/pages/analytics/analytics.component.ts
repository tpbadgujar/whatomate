import { Component, inject } from '@angular/core';
import { LucideAngularModule, TrendingUp } from 'lucide-angular';
import { TimeframeKey } from '../../core/models/crm.models';
import { CrmService } from '../../core/services/crm.service';
import { RevenueChartComponent } from '../../shared/components/revenue-chart.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [LucideAngularModule, RevenueChartComponent],
  styles: [
    `
      .analytics-page {
        display: grid;
        gap: 24px;
      }

      .page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
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

      .segmented {
        display: inline-flex;
        padding: 3px;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        border: 1px solid var(--hairline-strong);
      }

      .seg-btn {
        height: 26px;
        padding: 0 10px;
        border: 0;
        border-radius: var(--radius-xs);
        background: transparent;
        color: var(--text-muted);
        font-size: 12px;
        cursor: pointer;

        &.active {
          background: var(--bg-raised);
          color: var(--text-primary);
          box-shadow: var(--top-highlight);
        }
      }

      .panel {
        padding: 22px;
        border-radius: var(--radius-xl);
        background: var(--bg-card);
        border: 1px solid var(--hairline);
      }

      .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;

        h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }
      }

      .split-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .rep-list {
        display: grid;
        gap: 14px;
      }

      .rep-row {
        display: grid;
        gap: 6px;
      }

      .rep-top {
        display: flex;
        justify-content: space-between;
        font-size: 13.5px;
      }

      .bar-track {
        height: 8px;
        border-radius: 4px;
        background: var(--bg-raised);
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 500ms var(--ease-out-expo);
      }

      @media (max-width: 900px) {
        .split-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ],
  template: `
    <div class="analytics-page">
      <div class="page-head animate-enter">
        <div>
          <div class="page-meta mono">Performance telemetry</div>
          <h1 class="page-title">Revenue Analytics</h1>
        </div>

        <div class="segmented">
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
      </div>

      <article class="panel animate-enter stagger-1">
        <div class="panel-head">
          <h2>Revenue vs Pipeline Trend</h2>
          <span class="mono" style="font-size: 12px; color: var(--positive)">
            <lucide-icon [img]="TrendingIcon" [size]="14" [strokeWidth]="1.5" style="vertical-align: -2px" />
            118% of plan
          </span>
        </div>
        <app-revenue-chart [data]="crm.analyticsSeries()" />
      </article>

      <div class="split-grid animate-enter stagger-2">
        <article class="panel">
          <div class="panel-head">
            <h2>Quota Attainment by Rep</h2>
          </div>
          <div class="rep-list">
            @for (rep of repPerformance; track rep.name) {
              <div class="rep-row">
                <div class="rep-top">
                  <span>{{ rep.name }}</span>
                  <span class="mono">{{ rep.closed }} · {{ rep.pct }}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="rep.pct" [style.background]="rep.gradient"></div>
                </div>
              </div>
            }
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h2>Conversion Funnel</h2>
          </div>
          <div class="rep-list">
            @for (stage of crm.pipelineStages(); track stage.stage) {
              <div class="rep-row">
                <div class="rep-top">
                  <span>{{ stage.stage }}</span>
                  <span class="mono">{{ crm.formatCurrency(stage.value) }}</span>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [style.width.%]="stage.sharePercent"
                    [style.background]="stage.gradient"
                  ></div>
                </div>
              </div>
            }
          </div>
        </article>
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  readonly crm = inject(CrmService);
  readonly timeframes: TimeframeKey[] = ['7d', '30d', '90d', '12m'];
  readonly TrendingIcon = TrendingUp;

  readonly repPerformance = [
    { name: 'Elena Vance', closed: '$363,000', pct: 94, gradient: 'var(--accent-gradient)' },
    { name: 'Marcus Chen', closed: '$206,500', pct: 78, gradient: 'linear-gradient(90deg, #3b82f6, #06b6d4)' },
    { name: 'Priya Nair', closed: '$120,000', pct: 62, gradient: 'linear-gradient(90deg, #10b981, #14b8a6)' }
  ];
}
