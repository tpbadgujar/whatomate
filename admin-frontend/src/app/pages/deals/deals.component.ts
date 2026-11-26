import { Component, computed, inject, signal } from '@angular/core';
import { ChevronRight, LucideAngularModule, Plus } from 'lucide-angular';
import { DealStage } from '../../core/models/crm.models';
import { CrmService } from '../../core/services/crm.service';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [LucideAngularModule],
  styles: [
    `
      .deals-page {
        display: grid;
        gap: 20px;
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

      .filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .filter-btn {
        height: 32px;
        padding: 0 12px;
        border-radius: var(--radius-md);
        border: 1px solid var(--hairline);
        background: var(--bg-card);
        color: var(--text-secondary);
        font-size: 13px;
        cursor: pointer;

        &.active {
          background: var(--bg-raised);
          border-color: var(--hairline-strong);
          color: var(--text-primary);
        }
      }

      .panel {
        padding: 20px;
        border-radius: var(--radius-xl);
        background: var(--bg-card);
        border: 1px solid var(--hairline);
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;

        th {
          padding: 0 12px 12px 0;
          text-align: left;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
          border-bottom: 1px solid var(--hairline);

          &.num {
            text-align: right;
          }
        }

        td {
          padding: 14px 12px 14px 0;
          border-bottom: 1px solid var(--hairline);
          font-size: 13.5px;

          &.num {
            text-align: right;
          }
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }
      }

      .stage-pill {
        display: inline-flex;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        background: var(--bg-raised);
        border: 1px solid var(--hairline);
        font-size: 12px;
        color: var(--text-secondary);
      }
    `
  ],
  template: `
    <div class="deals-page">
      <div class="page-head animate-enter">
        <div>
          <div class="page-meta mono">{{ visibleDeals().length }} opportunities</div>
          <h1 class="page-title">Deals Pipeline</h1>
        </div>

        <button type="button" class="btn btn-accent btn-sm" (click)="crm.openQuickAction('deal')">
          <lucide-icon [img]="PlusIcon" [size]="15" [strokeWidth]="2" />
          <span>New deal</span>
        </button>
      </div>

      <div class="filter-row animate-enter stagger-1">
        @for (stage of stages; track stage) {
          <button
            type="button"
            class="filter-btn"
            [class.active]="selectedStage() === stage"
            (click)="selectedStage.set(stage)"
          >
            {{ stage }}
          </button>
        }
      </div>

      <div class="panel animate-enter stagger-2">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Deal</th>
              <th>Account</th>
              <th>Owner</th>
              <th>Stage</th>
              <th class="num">Value</th>
              <th class="num">Prob</th>
              <th class="num">Close</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (deal of visibleDeals(); track deal.id) {
              <tr>
                <td class="mono" style="color: var(--text-muted)">{{ deal.id }}</td>
                <td style="font-weight: 500">{{ deal.title }}</td>
                <td style="color: var(--text-secondary)">{{ deal.company }}</td>
                <td style="color: var(--text-secondary)">{{ deal.owner }}</td>
                <td><span class="stage-pill">{{ deal.stage }}</span></td>
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
                    <span class="mono" style="font-size: 12px; color: var(--positive)">Closed</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DealsComponent {
  readonly crm = inject(CrmService);
  readonly selectedStage = signal<'All' | DealStage>('All');
  readonly stages: ('All' | DealStage)[] = ['All', 'Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];

  readonly PlusIcon = Plus;
  readonly ChevronRightIcon = ChevronRight;

  readonly visibleDeals = computed(() => {
    const stage = this.selectedStage();
    const list = this.crm.filteredDeals();
    return stage === 'All' ? list : list.filter((d) => d.stage === stage);
  });
}
